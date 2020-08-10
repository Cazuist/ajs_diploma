import Character from './Character';

export default class Bowman extends Character {
  constructor(level = 1) {
    super(level);
    this.attack = 25;
    this.defence = 25;
    this.type = 'bowman';
    this.attackRange = 2;
    this.moveRange = 2;
    this.teamType = 'user';
  }
}
