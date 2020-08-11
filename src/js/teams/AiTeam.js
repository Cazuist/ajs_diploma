import Team from './Team';

export default class AiTeam extends Team {
  constructor(level, charCount) {
    super(level, charCount);
    this.type = 'ai';
  }
}
