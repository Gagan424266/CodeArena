/**
 * CodeArena C++ Judge
 * Compiles user source, runs against test cases, enforces time limits.
 *
 * Usage:
 *   ./judge --src main.cpp --tests ./tests --time-ms 1000 --mem-kb 65536
 *
 * Output JSON on stdout: {"verdict":"AC","timeMs":12,"memoryKb":1024}
 */
#include <algorithm>
#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>

namespace fs = std::filesystem;

struct Options {
  std::string src;
  std::string tests;
  int timeMs = 1000;
  int memKb = 65536;
};

Options parseArgs(int argc, char** argv) {
  Options o;
  for (int i = 1; i < argc; ++i) {
    std::string a = argv[i];
    if (a == "--src" && i + 1 < argc) o.src = argv[++i];
    else if (a == "--tests" && i + 1 < argc) o.tests = argv[++i];
    else if (a == "--time-ms" && i + 1 < argc) o.timeMs = std::stoi(argv[++i]);
    else if (a == "--mem-kb" && i + 1 < argc) o.memKb = std::stoi(argv[++i]);
  }
  return o;
}

bool compile(const std::string& src, const std::string& bin) {
  std::string cmd = "g++ -std=c++17 -O2 \"" + src + "\" -o \"" + bin + "\" 2>/dev/null";
  return std::system(cmd.c_str()) == 0;
}

std::string readFile(const fs::path& p) {
  std::ifstream in(p);
  std::ostringstream ss;
  ss << in.rdbuf();
  return ss.str();
}

struct RunResult {
  std::string verdict;
  int timeMs = 0;
  std::string output;
};

RunResult runOne(const std::string& bin, const fs::path& inFile, const fs::path& outFile, int timeMs) {
  RunResult r;
  std::string expected = readFile(outFile);
  // trim trailing whitespace
  while (!expected.empty() && (expected.back() == '\n' || expected.back() == ' '))
    expected.pop_back();

  int pipefd[2];
  if (pipe(pipefd) != 0) {
    r.verdict = "RE";
    return r;
  }

  auto start = std::chrono::steady_clock::now();
  pid_t pid = fork();
  if (pid == 0) {
    // child
    freopen(inFile.c_str(), "r", stdin);
    dup2(pipefd[1], STDOUT_FILENO);
    close(pipefd[0]);
    close(pipefd[1]);
    execl(bin.c_str(), bin.c_str(), (char*)nullptr);
    _exit(127);
  }
  close(pipefd[1]);

  // Parent: wait with timeout (DSA-style busy wait + kill)
  int status = 0;
  bool timedOut = false;
  while (true) {
    pid_t w = waitpid(pid, &status, WNOHANG);
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
                       std::chrono::steady_clock::now() - start)
                       .count();
    if (w == pid) {
      r.timeMs = static_cast<int>(elapsed);
      break;
    }
    if (elapsed > timeMs) {
      kill(pid, SIGKILL);
      waitpid(pid, &status, 0);
      timedOut = true;
      r.timeMs = timeMs;
      break;
    }
    usleep(2000);
  }

  if (timedOut) {
    r.verdict = "TLE";
    close(pipefd[0]);
    return r;
  }
  if (!WIFEXITED(status) || WEXITSTATUS(status) != 0) {
    r.verdict = "RE";
    close(pipefd[0]);
    return r;
  }

  char buf[4096];
  std::string got;
  ssize_t n;
  while ((n = read(pipefd[0], buf, sizeof(buf))) > 0) got.append(buf, n);
  close(pipefd[0]);
  while (!got.empty() && (got.back() == '\n' || got.back() == ' ')) got.pop_back();

  if (got == expected) r.verdict = "AC";
  else r.verdict = "WA";
  r.output = got;
  return r;
}

int main(int argc, char** argv) {
  Options opt = parseArgs(argc, argv);
  if (opt.src.empty() || opt.tests.empty()) {
    std::cout << "{\"verdict\":\"RE\",\"timeMs\":0,\"memoryKb\":0,\"error\":\"bad args\"}\n";
    return 1;
  }

  fs::path work = fs::path(opt.src).parent_path();
  fs::path bin = work / "a.out";

  if (!compile(opt.src, bin.string())) {
    std::cout << "{\"verdict\":\"CE\",\"timeMs\":0,\"memoryKb\":0}\n";
    return 0;
  }

  int maxTime = 0;
  std::string finalVerdict = "AC";

  std::vector<fs::path> inputs;
  for (auto& e : fs::directory_iterator(opt.tests)) {
    if (e.path().extension() == ".in") inputs.push_back(e.path());
  }
  std::sort(inputs.begin(), inputs.end());

  for (auto& inPath : inputs) {
    fs::path outPath = inPath;
    outPath.replace_extension(".out");
    if (!fs::exists(outPath)) continue;
    auto res = runOne(bin.string(), inPath, outPath, opt.timeMs);
    maxTime = std::max(maxTime, res.timeMs);
    if (res.verdict != "AC") {
      finalVerdict = res.verdict;
      break;
    }
  }

  std::cout << "{\"verdict\":\"" << finalVerdict
            << "\",\"timeMs\":" << maxTime
            << ",\"memoryKb\":0}\n";
  return 0;
}
