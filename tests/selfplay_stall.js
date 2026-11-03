// 自己対戦で「勝負がつくまでの手数」を測る(停止ルールの有無の比較)
// 実行: node tests/selfplay_stall.js [局数=12] [レベル=4,5,6]
const E = require('./load_engine')();

function game(lv, stallRule) {
  const b = E.newBoard();
  let turn = 1, plies = 0, lastCap = 0;
  const seen = {}; seen[E.posKey(b, 1)] = 1;
  while (plies < 400) {
    const m = E.chooseMove(b, turn, lv, seen);
    const f = (m / 81) | 0, t = m % 81, c = E.countOf(b);
    const cap = E.applyMove(b, c, turn, f, t); plies++;
    if (cap.length) lastCap = plies;
    const cn = E.countOf(b);
    if (cn[3 - turn] <= 1) return { end: 'kill', plies };
    const q = 3 - turn, k = E.posKey(b, q);
    seen[k] = (seen[k] || 0) + 1;
    if (seen[k] >= 3) return { end: 'rep', plies };
    if (stallRule && plies - lastCap >= (lastCap ? E.STALL : E.STALL0)) return { end: cn[1] === cn[2] ? 'stallDraw' : 'stallWin', plies };
    turn = q;
  }
  const cn = E.countOf(b);
  return { end: cn[1] === cn[2] ? 'capDraw' : 'capWin', plies };
}

const N = +process.argv[2] || 12;
for (const lv of (process.argv[3] || '4,5,6').split(',').map(Number)) {
  for (const stall of [false, true]) {
    const rs = [];
    for (let i = 0; i < N; i++) rs.push(game(lv, stall));
    const k = x => rs.filter(r => r.end === x).length;
    const avg = Math.round(rs.reduce((a, r) => a + r.plies, 0) / N), mx = Math.max(...rs.map(r => r.plies));
    const draws = k('stallDraw') + k('capDraw') + k('rep');
    console.log(`Lv${lv} stall-rule=${stall ? 'on ' : 'off'}: kill=${k('kill')} win-by-count=${k('stallWin') + k('capWin')} draw=${draws} (repetition=${k('rep')}) / avg ${avg} plies, max ${mx}`);
  }
}
