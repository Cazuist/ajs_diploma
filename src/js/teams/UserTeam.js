import Team from './Team';
import chars from '../characters/charactersList';

export default class UserTeam extends Team {
  constructor(level, charCount, allowedTypes = chars.userChars) {
    super(level, charCount, allowedTypes);
    this.type = 'user';
  }
}
