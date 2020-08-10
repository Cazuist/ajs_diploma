/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
import Character from './characters/Character';
import * as fn from './functions';

export function* characterGenerator(allowedTypes, maxLevel = 1) {
  if (!(Array.isArray(allowedTypes))) {
    throw new Error('First parameter must be array!');
  }

  if (allowedTypes.some((type) => !(type.prototype instanceof Character))) {
    throw new Error('All types must inherit from Character!');
  }

  const index = fn.randomInteger(0, allowedTypes.length - 1);
  const level = fn.randomInteger(1, maxLevel);

  yield new allowedTypes[index](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];

  for (let i = 0; i < characterCount; i++) {
    const char = characterGenerator(allowedTypes, maxLevel).next().value;
    team.push(char);
  }

  return team;
}
