import Team from './Team';

export default class UserTeam extends Team {
  constructor() {
    super();
    this.type = 'user';
  }
}
