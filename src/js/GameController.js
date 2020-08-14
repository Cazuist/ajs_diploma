import GamePlay from './GamePlay';
import GameState from './GameState';

import Character from './characters/Character';
import { startUserChars } from './characters/charactersList';
import UserTeam from './teams/UserTeam';
import AiTeam from './teams/AiTeam';

import cursors from './cursors';
import themes from './themes';
import * as fn from './functions';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.setState();
  }

  init() {
    this.gamePlay.drawUi(themes[`level${this.state.level % 4 || 4}`]);
    this.gamePlay.redrawPositions(this.state.positions);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));

    this.gamePlay.levelFieldEl.innerText = this.state.level;
    this.gamePlay.scoreFieldEl.innerText = this.state.currentScore;
    this.gamePlay.maxScoreFieldEl.innerText = this.state.maxScore;

    // TODO: load saved stated from stateService

    // localStorage.clear();
  }

  setState() {
    const state = {
      level: 1,
      turn: 'user',
      selectedIndex: 0,
      selectedChar: null,
      currentScore: 0,
      maxScore: 0,
      positions: [
        ...(new UserTeam(1, 2, startUserChars)).positions,
        ...(new AiTeam(1, 2)).positions,
      ],
    };

    if (this.stateService.load()) {
      this.state = this.stateService.load();
    } else {
      this.state = state;
    }

    return state;
  }

  onCellClick(index) {
    const isCharacter = !!this.gamePlay.cells[index].children.length;

    if (isCharacter) {
      const positionedChar = this.state.positions
        .filter((char) => char.position === index)[0];

      if (this.state.turn === positionedChar.character.teamType) {
        this.gamePlay.deselectCell(this.state.selectedIndex);
        this.gamePlay.selectCell(index);

        this.state.selectedIndex = index;
        this.state.selectedChar = positionedChar;
      }
    }

    if (this.state.selectedChar) {
      const posibleActions = this.getPosibileActions(this.state.selectedChar, index);

      if (posibleActions.canMove) {
        this.makeMove(this.state.selectedChar, index);
        this.makeAiActions();
      }

      if (posibleActions.canAttack) {
        this.makeAttack(this.state.selectedChar, index);
      }
    }

    if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
      GamePlay.showMessage('Attantion! Not allowed action!');
    }
  }

  onCellEnter(index) {
    const isCharacter = !!this.gamePlay.cells[index].children.length;
    const cell = this.gamePlay.cells[index];

    if (isCharacter) {
      const filteredChar = this.state.positions
        .filter((char) => char.position === index)[0]
        .character;

      const { attack, defence, health } = filteredChar;
      const message = fn.tagTip`${filteredChar.level}${attack}${defence}${health}`;
      this.gamePlay.showCellTooltip(message, index);

      if (filteredChar.teamType !== this.state.turn) {
        this.gamePlay.setCursor(cursors.notallowed);
      } else {
        this.gamePlay.setCursor(cursors.pointer);
      }
    }

    if (this.state.selectedChar) {
      const posibleActions = this.getPosibileActions(this.state.selectedChar, index);
      if (cell.classList.contains('selected-yellow')) {
        this.gamePlay.setCursor(cursors.auto);
      } else if (posibleActions.canMove) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (posibleActions.canAttack) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else if (!isCharacter) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    const cell = this.gamePlay.cells[index];

    this.gamePlay.hideCellTooltip(index);

    if (!cell.classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(index);
    }

    if (!this.state.selectedChar) {
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onNewGameClick() {
    if (confirm('Do yo realy want to start new game!\nYour progress will no save!')) {
      GameState.busyCells = [];

      this.state = {
        level: 1,
        turn: 'user',
        selectedIndex: 0,
        selectedChar: null,
        currentScore: 0,
        maxScore: 0,
        positions: [
          ...(new UserTeam(1, 2, startUserChars)).positions,
          ...(new AiTeam(1, 2)).positions,
        ],
      };
      this.blockGame();
      this.init();
    }
  }

  onSaveGameClick() {
    GamePlay.showMessage('Your game succesfully saved!');
    this.state.selectedChar = null;
    this.stateService.save(GameState.from(this.state));
  }

  onLoadGameClick() {
    if (confirm('Do yo realy want to load game!\nYour progress will no save!')) {
      this.blockGame();
      this.state = this.stateService.load();
      this.init();
    }
  }

  switchTurn() {
    if (this.state.turn === 'user') {
      this.state.turn = 'ai';
    } else {
      this.state.turn = 'user';
    }
    // this.gamePlay.turnFieldEl.innerText = `${this.state.turn === 'user' ? 'You' : 'Computer'}`;
  }

  blockGame() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.loadGameListeners = [];
    this.gamePlay.setCursor(cursors.auto);
    this.setMaxScore();
  }

  setEndGameEvents() {
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  removeCharacter() {
    this.state.positions = this.state.positions
      .filter((char) => char.character.health !== 0);
  }

  checkWinStatus() {
    return !this.state.positions
      .filter((char) => char.character.teamType !== this.state.turn).length;
  }

  updateGameBoard() {
    if (this.checkWinStatus()) {
      if (this.state.turn === 'ai') {
        GamePlay.showMessage(`Sorry! You lost!\nYour score is ${this.state.currentScore}`);
        this.blockGame();
        this.setEndGameEvents();
        return;
      }

      GameState.updateBusyCells(this.state.positions);
      this.levelUp();
    } else {
      this.switchTurn();
    }
  }

  levelUp() {
    this.state.currentScore += this.getScore();
    this.gamePlay.scoreFieldEl.innerText = this.state.currentScore;
    this.blockGame();

    if (this.state.level >= 4) {
      const message = `Congratulations! You win!\nYour score is ${this.state.currentScore}.`;

      GamePlay.showMessage(message);
      this.setEndGameEvents();
      return;
    }

    this.state.positions.forEach((char) => Character.levelUp.call(char.character));

    this.state.level += 1;
    const userCharsAmount = this.state.positions
      .filter((char) => char.character.teamType === 'user').length;

    const addCharAmount = Math.min(this.state.level - 1, 2);

    const additionalUserChars = new UserTeam(this.state.level - 1, addCharAmount).positions;
    const additionalAiChars = new AiTeam(this.state.level, userCharsAmount
         + addCharAmount).positions;

    this.state.positions.push(...additionalUserChars, ...additionalAiChars);
    this.switchTurn();
    this.init();
  }

  getScore() {
    const score = this.state.positions
      .filter((char) => char.character.teamType === 'user')
      .reduce((cur, char) => cur + char.character.health, 0);

    return score;
  }

  setMaxScore() {
    const currentState = this.stateService.load();

    this.state.maxScore = Math.max(this.state.currentScore, currentState.maxScore);
    this.gamePlay.maxScoreFieldEl.innerText = this.state.maxScore;
    currentState.maxScore = this.state.maxScore;
    this.stateService.save(currentState);
  }

  makeMove(character, index) {
    character.position = index;
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.cells.forEach((cell, idx) => this.gamePlay.deselectCell(idx));
    this.state.selectedChar = null;
    this.gamePlay.redrawPositions(this.state.positions);
    this.switchTurn();
    // this.gamePlay.turnFieldEl.innerText = `${this.state.turn === 'user' ? 'You' : 'Computer'}`;
  }

  makeAttack(character, index) {
    const target = this.state.positions
      .filter((char) => char.position === index)[0].character;
    const damage = Character.getDamage.call(character.character, target);
    Character.takeDamage.call(target, damage);

    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];

    this.gamePlay.showDamage(index, damage)
      .then(() => {
        this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
        this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
        this.removeCharacter();
        this.updateGameBoard();
      }).then(() => {
        this.state.selectedChar = null;
        this.gamePlay.redrawPositions(this.state.positions);
        this.gamePlay.cells.forEach((cell, idx) => this.gamePlay.deselectCell(idx));
      }).then(() => {
        this.makeAiActions();
      })
      .catch((error) => GamePlay.showMessage(error.message));
  }

  getPosibileActions(selectedCharacter, index) {
    const isCharacter = !!this.gamePlay.cells[index].children.length;
    const disabledForMove = this.state.positions
      .map((char) => char.position);

    const disabledForAttack = this.state.positions
      .filter((char) => char.character.teamType === this.state.turn)
      .map((char) => char.position);

    const { position, character } = selectedCharacter;

    const cellsForMove = fn.getCellsForMove(position, character.moveRange)
      .filter((cell) => !disabledForMove.includes(cell));

    const cellsForAttack = fn.getCellsForAttack(position, character.attackRange)
      .filter((cell) => !disabledForAttack.includes(cell) && isCharacter);

    const canMove = cellsForMove.includes(index);
    const canAttack = cellsForAttack.includes(index);

    return { canMove, canAttack };
  }

  makeAiActions() {
    /* const aiChars = this.state.positions
      .filter((char) => char.character.teamType === 'ai'); */

    this.blockGame();
    this.switchTurn();
    this.init();
  }
}
