# CodeArena Judge

```bash
mkdir -p build
g++ -std=c++17 -O2 src/judge.cpp -o build/judge
```

The binary is invoked by the Node worker:

```text
./build/judge --src main.cpp --tests ../problems/two-sum/tests --time-ms 1000 --mem-kb 65536
```
