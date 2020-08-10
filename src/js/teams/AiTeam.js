import Team from './Team';

export default class AiTeam extends Team {
  constructor() {
    super();
    this.type = 'ai';
  }
}
