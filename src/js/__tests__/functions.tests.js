import * as fn from '../functions';

describe('Блок тестов для модуля "FUNCTIONS"', () => {
  describe('Тестируем функцию "tagTip"', () => {
    test('Должны получить строку по шаблону', () => {
      const level = 2;
      const attack = 10;
      const defence = 40;
      const health = 50;

      const received = fn.tagTip`${level}${attack}${defence}${health}`;
      const expected = `\u{1F396}2\u{2694}10\u{1F6E1}40\u{2764}50`;

      expect(received).toBe(expected);
    });
  });

  describe('Тестируем функцию "randomInteger"', () => {
    test('Должны получить случайное число в пределах 1 и 5', () => {
      const min = 1;
      const max = 5;

      const received = fn.randomInteger(min, max);

      expect(received).toBeLessThanOrEqual(max);
      expect(received).toBeGreaterThanOrEqual(min);
    });
  });

  describe('Тестируем функцию "getTilesList"', () => {
    test('Должны получить массив длинной 16', () => {
      const received = fn.getTilesList().length;
      expect(received).toBe(16);
    });

    test('Должны получить массив чисел', () => {
      const expected = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];

      const received = fn.getTilesList();

      expect(received).toEqual(expected);
    });
  });
});