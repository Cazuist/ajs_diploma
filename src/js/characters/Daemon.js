import Character from './Character';

export default class Daemon extends Character {
  constructor(level = 1) {
    super(level);
    this.attack = 10;
    this.defence = 40;
    this.type = 'daemon';
    this.attackRange = 4;
    this.moveRange = 1;
    this.teamType = 'ai';
  }
}
