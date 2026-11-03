// レベル同士の強さ比較。実行: node tests/strength_match.js <レベルA> <レベルB> [局数=24]
// 先手後手を交互に入れ替え、400手までに決まらなければ駒数で判定する。
// 注意: 局数が少ないと運の幅が大きい。同じレベル同士(A=B)を対照実験として必ず走らせて比べること。
const E = require('./load_engine')();

function game(lvH, lvC, maxp) {
  const b = E.newBoard(); let turn = 1, plies = 0;
  while (plies < maxp) {
    const m = E.chooseMove(b, turn, turn === 1 ? lvH : lvC);
    if (m == null) return { end: 'stuck', turn, cnt: E.countOf(b) };
    const f = (m / 81) | 0, t = m % 81, c = E.countOf(b);
    if (b[f] !== turn || b[t] !== 0) throw new Error('illegal move');
    E.applyMove(b, c, turn, f, t); plies++;
    const c2 = E.countOf(b);
    if (c2[3 - turn] <= 1) return { end: 'win' + turn, cnt: c2 };
    turn = 3 - turn;
  }
  return { end: 'cap', cnt: E.countOf(b) };
}

const A = +process.argv[2], B = +process.argv[3], N = +process.argv[4] || 24;
if (!A || !B) { console.log('usage: node tests/strength_match.js <levelA> <levelB> [games]'); process.exit(1); }
const w = { A: 0, B: 0, draw: 0 };
for (let i = 0; i < N; i++) {
  const aFirst = i % 2 === 0;
  const r = aFirst ? game(A, B, 300) : game(B, A, 300);
  const cnt = r.cnt;
  let win;
  if (r.end === 'win1') win = aFirst ? 'A' : 'B';
  else if (r.end === 'win2') win = aFirst ? 'B' : 'A';
  else {
    const ca = aFirst ? cnt[1] : cnt[2], cb = aFirst ? cnt[2] : cnt[1];
    win = ca > cb ? 'A' : ca < cb ? 'B' : 'draw';
  }
  w[win]++;
}
console.log(`Lv${A} vs Lv${B} over ${N} games: Lv${A} wins ${w.A} / Lv${B} wins ${w.B} / draws ${w.draw}`);
