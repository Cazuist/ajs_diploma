import Team from './Team';
import chars from '../characters/charactersList';

export default class AiTeam extends Team {
  constructor(level, charCount, allowedTypes = chars.aiChars) {
    super(level, charCount, allowedTypes);
    this.type = 'ai';
  }
}
