import { generateTeam } from '../generators';
import PositionedCharacter from '../PositionedCharacter';
import GameState from '../GameState';
import * as fn from '../functions';

export default class Team {
  constructor(level, charCount, allowedTypes) {
    if (new.target.name === 'Team') {
      throw new Error('Can\'t call constructor of Team');
    }

    this.alowedTypes = allowedTypes;
    this.members = generateTeam(this.alowedTypes, level, charCount);
    this.setPositions();
  }

  setPositions() {
    const positions = [];
    const tileList = fn.getTilesList.call(this, 8);

    const { busyCells } = GameState;
    const filteredTileList = busyCells
      ? tileList.filter((cell) => !busyCells.includes(cell))
      : tileList;

    for (const char of this.members) {
      const index = fn.randomInteger(0, filteredTileList.length - 1);
      const cell = filteredTileList[index];

      positions.push(new PositionedCharacter(char, cell));
      filteredTileList.splice(index, 1);
    }

    this.positions = positions;
  }
}
