import Team from './Team';

export default class UserTeam extends Team {
  constructor(level, charCount) {
    super(level, charCount);
    this.type = 'user';
  }
}
