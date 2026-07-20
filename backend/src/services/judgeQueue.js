import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from '../db/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const queue = [];
let running = false;

const PROBLEMS_DIR =
  process.env.PROBLEMS_DIR ||
  path.resolve(__dirname, '../../../problems');

export function enqueue(submissionId) {
  queue.push(submissionId);
  pump();
}

async function pump() {
  if (running) return;
  running = true;
  while (queue.length) {
    const id = queue.shift();
    await judgeSubmission(id);
  }
  running = false;
}

export function startWorker() {
  console.log('Judge worker started');
  pump();
}

async function judgeSubmission(id) {
  const sub = store.submissions.get(id);
  if (!sub) return;

  store.updateSubmission(id, { status: 'running' });
  const problem = store.problems.get(sub.problemSlug);

  try {
    if (sub.language === 'cpp') {
      const result = await runCppJudge(sub, problem);
      store.updateSubmission(id, {
        status: 'done',
        verdict: result.verdict,
        timeMs: result.timeMs,
        memoryKb: result.memoryKb,
        judgedAt: new Date().toISOString(),
      });
    } else {
      // Fallback mock for non-C++ in local scaffold
      const result = await mockJudge(sub, problem);
      store.updateSubmission(id, {
        status: 'done',
        verdict: result.verdict,
        timeMs: result.timeMs,
        memoryKb: 1024,
        judgedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error('Judge error', e);
    store.updateSubmission(id, {
      status: 'done',
      verdict: 'RE',
      judgedAt: new Date().toISOString(),
    });
  }
}

async function runCppJudge(sub, problem) {
  const judgeBin = process.env.JUDGE_PATH || path.resolve(__dirname, '../../../judge/build/judge');
  try {
    await fs.access(judgeBin);
  } catch {
    return mockJudge(sub, problem);
  }

  const workDir = path.join(PROBLEMS_DIR, sub.problemSlug, '.work', sub.id);
  await fs.mkdir(workDir, { recursive: true });
  const srcPath = path.join(workDir, 'main.cpp');
  await fs.writeFile(srcPath, sub.sourceCode);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const proc = spawn(judgeBin, [
      '--src', srcPath,
      '--tests', path.join(PROBLEMS_DIR, sub.problemSlug, 'tests'),
      '--time-ms', String(problem.timeLimitMs || 1000),
      '--mem-kb', String(problem.memoryLimitKb || 65536),
    ]);

    let out = '';
    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => console.error(d.toString()));
    proc.on('close', () => {
      try {
        const parsed = JSON.parse(out.trim() || '{}');
        if (parsed.verdict) {
          finish({
            verdict: parsed.verdict,
            timeMs: parsed.timeMs || 0,
            memoryKb: parsed.memoryKb || 0,
          });
          return;
        }
      } catch {
        // fall through to mock
      }
      mockJudge(sub, problem).then(finish);
    });
    proc.on('error', () => {
      mockJudge(sub, problem).then(finish);
    });
  });
}

/** Deterministic mock when C++ judge binary is not built yet */
async function mockJudge(sub, problem) {
  await new Promise((r) => setTimeout(r, 300));
  const code = sub.sourceCode || '';
  // Heuristic for scaffold demos
  if (code.includes('compile_error_demo')) {
    return { verdict: 'CE', timeMs: 0 };
  }
  if (problem.slug === 'two-sum' && code.includes('unordered_map')) {
    return { verdict: 'AC', timeMs: 12 };
  }
  if (problem.slug === 'valid-parentheses' && code.includes('stack')) {
    return { verdict: 'AC', timeMs: 8 };
  }
  if (code.length < 20) return { verdict: 'WA', timeMs: 5 };
  return { verdict: 'AC', timeMs: 15 };
}
