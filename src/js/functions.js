export function randomInteger(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

export function getTilesList(borderSize) {
  const tiles = [];
  let index1;
  let index2;

  if (this.constructor.name === 'UserTeam') {
    [index1, index2] = [0, 1];
  } else {
    [index1, index2] = [borderSize - 2, borderSize - 1];
  }

  for (let i = 0; i < borderSize; i++) {
    tiles.push(index1, index2);
    index1 += borderSize;
    index2 += borderSize;
  }

  return tiles;
}

export function tagTip(str, ...params) {
  return `\u{1F396}${params[0]}\u{2694}${params[1]}\u{1F6E1}${params[2]}\u{2764}${params[3]}`;
}

function getLimits(index, range, boardSize = 8) {
  const limits = {};

  limits.row = Math.floor(index / boardSize);
  limits.column = index % boardSize;

  limits.upperLimit = Math.max(limits.row - range, 0);
  limits.lowerLimit = Math.min(limits.row + range, boardSize - 1);
  limits.leftLimit = Math.max(limits.column - range, 0);
  limits.rightLimit = Math.min(limits.column + range, boardSize - 1);

  limits.topLeftLimit = Math.min(limits.row, limits.column, range);
  limits.topRightLimit = Math.min(limits.row, boardSize - 1 - limits.column, range);
  limits.bottomLeftLimit = Math.min(boardSize - 1 - limits.row, limits.column, range);
  limits.bottomRightLimit = Math.min(
    boardSize - 1 - limits.row, boardSize - 1 - limits.column, range,
  );

  return limits;
}

export function getCellsForMove(index, moveRange, boardSize = 8) {
  const moveCells = [];
  const limits = getLimits(index, moveRange, boardSize);

  for (let i = limits.upperLimit; i <= limits.lowerLimit; i++) {
    moveCells.push(limits.column + boardSize * i);
  }

  for (let i = limits.leftLimit; i <= limits.rightLimit; i++) {
    moveCells.push(limits.row * boardSize + i);
  }

  for (let i = 1; i <= limits.topLeftLimit; i++) {
    moveCells.push(index - (boardSize + 1) * i);
  }

  for (let i = 1; i <= limits.topRightLimit; i++) {
    moveCells.push(index - (boardSize - 1) * i);
  }

  for (let i = 1; i <= limits.bottomLeftLimit; i++) {
    moveCells.push(index + (boardSize - 1) * i);
  }

  for (let i = 1; i <= limits.bottomRightLimit; i++) {
    moveCells.push(index + (boardSize + 1) * i);
  }

  return moveCells.filter((cell) => cell !== index);
}

export function getCellsForAttack(index, moveRange, boardSize = 8) {
  const attackCells = [];
  const limits = getLimits(index, moveRange, boardSize);

  for (let i = limits.upperLimit; i <= limits.lowerLimit; i++) {
    for (let j = limits.leftLimit; j <= limits.rightLimit; j++) {
      attackCells.push(boardSize * i + j);
    }
  }

  return attackCells.filter((cell) => cell !== index);
}
