export default class GameState {
  static from(object) {
    return object || null;
  }

  static updateBusyCells(positionedCharacters) {
    GameState.busyCells = [];

    if (positionedCharacters) {
      GameState.busyCells = positionedCharacters.map((char) => char.position);
    }
  }
}
