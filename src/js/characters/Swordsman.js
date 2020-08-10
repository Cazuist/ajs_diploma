import Character from './Character';

export default class Swordsman extends Character {
  constructor(level = 1) {
    super(level);
    this.attack = 40;
    this.defence = 10;
    this.type = 'swordsman';
    this.attackRange = 1;
    this.moveRange = 4;
    this.teamType = 'user';
  }
}
