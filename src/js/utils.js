export function calcTileType(index, boardSize) {
  const cellsAmount = boardSize ** 2;

  switch (true) {
    case index === 0:
      return 'top-left';
    case index === boardSize - 1:
      return 'top-right';
    case index === cellsAmount - 1:
      return 'bottom-right';
    case index === cellsAmount - boardSize:
      return 'bottom-left';
    case index < boardSize - 1:
      return 'top';
    case index > cellsAmount - boardSize:
      return 'bottom';
    case index % boardSize === 0:
      return 'left';
    case index % boardSize === boardSize - 1:
      return 'right';
    default:
      return 'center';
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
