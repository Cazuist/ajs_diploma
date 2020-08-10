import Character from '../characters/Character';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Bowman from '../characters/Bowman';
import Vampire from '../characters/Vampire';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';

describe('Тестируем класс Character', () => {
  test('При создании экземпляра класса Character выбрасывает ошибку', () => {
    expect(() => new Character(1)).toThrow(Error);
  });
});

describe('Тестируем дочерние классы Character', () => {
  test.each([
    [Bowman],
    [Swordsman],
    [Undead],
    [Vampire],
    [Magician],
    [Daemon],
  ])(
    ('При создании экземпляра класса %s ошибка не выбрасывается'),
    (ClassName) => {
      expect(() => new ClassName()).not.toThrow(Error);
    }    
  );
});