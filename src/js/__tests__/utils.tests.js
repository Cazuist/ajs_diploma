import { calcTileType, calcHealthLevel } from '../utils';

describe('Блок тестов для модуля "UTILS"', () => {
  describe('Тестируем функцию "calcTileType"', () => {
    test.each([
      [0, 8, 'top-left'],
      [7, 8, 'top-right'],
      [56, 8, 'bottom-left'],
      [63, 8, 'bottom-right'],
      [8, 8, 'left'],
      [32, 8, 'left'],
      [48, 8, 'left'],
      [15, 8, 'right'],
      [31, 8, 'right'],
      [55, 8, 'right'],
      [1, 8, 'top'],
      [4, 8, 'top'],
      [6, 8, 'top'],
      [57, 8, 'bottom'],
      [59, 8, 'bottom'],
      [62, 8, 'bottom'],
      [12, 8, 'center'],
      [28, 8, 'center'],
      [43, 8, 'center'],
    ])(
      ('Для ячейки c индексом %s при размере %s должен вернуть тип %s'),
      (index, boardSize, expected) => {
        expect(calcTileType(index, boardSize)).toBe(expected);
      },
    );

    test.each([
      [0, 8, 'top-left'],
      [7, 8, 'top-right'],
      [56, 8, 'bottom-left'],
      [63, 8, 'bottom-right'],
      [8, 8, 'left'],
      [15, 8, 'right'],
      [1, 8, 'top'],
      [57, 8, 'bottom'],
      [12, 8, 'center'],
    ])(
      ('При всех параметрах должны получить строку'),
      (index, boardSize, expected) => {
        const result = calcTileType(index, boardSize);

        const received = typeof result;

        expect(received).toBe('string');
      },
    );
  });

  describe('Тестируем функцию "calcHealthLevel"', () => {
    test.each([
      [1, 'critical'],
      [14, 'critical'],
      [15, 'normal'],
      [16, 'normal'],
      [35, 'normal'],
      [49, 'normal'],
      [50, 'high'],
      [51, 'high'],
      [75, 'high'],
      [99, 'high'],
    ])(
      ('Для здоровья %s должны получить статус %s'),
      (health, expected) => {
        expect(calcHealthLevel(health)).toBe(expected);
      },
    );

    test.each([
      [1],
      [14],
      [15],
      [16],
      [35],
      [49],
      [50],
      [51],
      [75],
      [99],
    ])(
      ('Всегда получаем строку'),
      (health) => {
        const result = calcHealthLevel(health);

        const received = typeof result;

        expect(received).toBe('string');
      },
    );
  });
});
