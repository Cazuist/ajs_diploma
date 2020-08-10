import chars from '../characters/charactersList';
import { generateTeam } from '../generators';
import PositionedCharacter from '../PositionedCharacter';
import * as fn from '../functions';

export default class Team {
  constructor() {
    if (new.target.name === 'Team') {
      throw new Error('Can\'t call constructor of Team');
    }

    this.level = 1;
    this.type = 'common';
    this.alowedTypes = new.target.name === 'UserTeam'
      ? chars.userChars.filter((Char) => (new Char()).constructor.name !== 'Magician')
      : chars.aiChars;
    this.members = generateTeam(this.alowedTypes, this.level, 2);

    this.positions = this.setPositions();
  }

  setPositions() {
    const positions = [];
    const tileList = fn.getTilesList(8, this);

    for (const char of this.members) {
      const index = fn.randomInteger(0, tileList.length - 1);
      const cell = tileList[index];

      positions.push(new PositionedCharacter(char, cell));
      tileList.splice(index, 1);
    }

    return positions;
  }
}
