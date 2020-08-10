export default class GameState {
  static from(object) {
    const state = {};

    state.level = object.gameLevel;
    state.positions = object.positions;
    state.turn = object.turn;

    return state;
  }
}
