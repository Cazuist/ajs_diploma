import GameStateService from '../GameStateService';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('Начинаем тестирование класса "GameStateService" ', () => {
  test('Возвращаем объект', () => {
    

    beforeEach(() => {
      jest.resetAllMocks();
    });

    const state = new GameStateService(localStorage);
    state.load.mockReturnValue({});

    const received = state.load();

    expect(received).toEqual({});
  });

  test('Выбрасываем ошибку', () => {
    
    const state = new GameStateService(localStorage);
    
    try {
      state.load();
    } catch (e) {
      expect(e.message).toBe('Invalid state');
    }
  });
});