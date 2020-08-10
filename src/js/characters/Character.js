export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    if (new.target.name === 'Character') {
      throw new Error('Can\'t call constructor of Character');
    }
  }

  levelUp() {
    this.level += 1;
    this.attack = Math.max(this.attack, Math.round(this.attack * (0.8 + this.health / 100)));
    this.defence = Math.max(this.defence, Math.round(this.defence * (0.8 + this.health / 100)));
    this.health = Math.max(this.level + 80, 100);
  }

  getDamage(target) {
    return Math.max(this.attack - target.defence, this.attack * 0.1);
  }

  takeDamage(damage) {
    this.health -= damage;

    if (this.health < 0) {
      this.health = 0;
    }
  }
}
