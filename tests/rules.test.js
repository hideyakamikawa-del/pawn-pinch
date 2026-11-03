// ルールの単体テスト。実行: node tests/rules.test.js
const { newBoard, countOf, genMoves, applyMove, undoMove } = require('./load_engine')();

let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } else console.log('ok  ', m); };
const mk = (h, c) => { const b = new Int8Array(81); for (const i of h) b[i] = 1; for (const i of c) b[i] = 2; return b; };
const mv = (b, p, f, t) => applyMove(b, countOf(b), p, f, t);
const at = (r, c) => r * 9 + c;

let b = mk([at(4, 4), at(5, 2)], [at(4, 3)]);
let cap = mv(b, 1, at(5, 2), at(4, 2));
ok(cap.length === 1 && b[at(4, 3)] === 0, '横はさみで1枚取る');

b = mk([at(2, 4), at(6, 3)], [at(3, 4)]);
cap = mv(b, 1, at(6, 3), at(4, 3));
ok(cap.length === 0, '片側だけなら取れない');

b = mk([at(2, 4), at(4, 8)], [at(3, 4)]);
cap = mv(b, 1, at(4, 8), at(4, 4));
ok(cap.length === 1 && b[at(3, 4)] === 0, '縦はさみ');

b = mk([at(4, 0), at(6, 4)], [at(4, 1), at(4, 2), at(4, 3)]);
cap = mv(b, 1, at(6, 4), at(4, 4));
ok(cap.length === 3, '3枚まとめ取り');

b = mk([at(4, 2), at(4, 4)], [at(0, 8)]); b[at(3, 3)] = 2;
cap = mv(b, 2, at(3, 3), at(4, 3));
ok(b[at(4, 3)] === 2, '相手2枚の間に自分から入っても取られない');

b = mk([], [0]); b[1] = 1; b[27] = 1;
cap = mv(b, 1, 27, 9);
ok(cap.length === 1 && b[0] === 0, '角取り(角の駒を2枚で囲む)');

b = mk([], [0]); b[1] = 1; b[27] = 1;
mv(b, 1, 1, 2);
ok(b[0] === 2, '角: 囲みが成立しない手では取れない');

b = mk([at(4, 4)], [at(4, 0)]); b[at(8, 1)] = 1;
cap = mv(b, 1, at(8, 1), at(4, 1));
ok(cap.length === 0 && b[at(4, 0)] === 2, '壁(盤端)ではさめない');

b = newBoard();
const g = genMoves(b, 1);
ok(g.every(m => { const f = (m / 81) | 0, t = m % 81; return ((f / 9) | 0) === ((t / 9) | 0) || (f % 9) === (t % 9); }), '直線移動のみ');
ok(g.length === 9 * 7, '初期手数=63 (' + g.length + ')');

b = mk([at(4, 4), at(5, 2)], [at(4, 3)]);
const before = Int8Array.from(b), c0 = countOf(b), cc = countOf(b);
const cp = applyMove(b, cc, 1, at(5, 2), at(4, 2));
undoMove(b, cc, 1, at(5, 2), at(4, 2), cp);
ok(b.every((v, i) => v === before[i]) && cc[2] === c0[2], 'undoで盤面と駒数が完全に戻る');

console.log(fail ? 'FAILED ' + fail : 'ALL RULE TESTS PASSED');
process.exit(fail ? 1 : 0);
