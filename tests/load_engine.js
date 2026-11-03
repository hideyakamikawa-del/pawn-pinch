// index.html の「// ==ENGINE==」〜「// ==/ENGINE==」の間(画面に依存しない部分)を取り出して使えるようにする
const fs = require('fs');
const path = require('path');

module.exports = function loadEngine() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const src = html.split('// ==ENGINE==')[1].split('// ==/ENGINE==')[0];
  return new Function(src + `; return {
    HUMAN, CPU, LV, MAX_PLIES, newBoard, countOf, genMoves, applyMove, undoMove,
    chooseMove, posKey,
    STALL: typeof STALL !== 'undefined' ? STALL : null,
    STALL0: typeof STALL0 !== 'undefined' ? STALL0 : null,
    setCorner: v => { cornerRule = v; }
  };`)();
};
