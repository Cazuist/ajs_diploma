import GamePlay from './GamePlay';
import GameState from './GameState';

import Character from './characters/Character';
import { startUserChars } from './characters/charactersList';
import UserTeam from './teams/UserTeam';
import AiTeam from './teams/AiTeam';

import CST from './constatnts';
import * as fn from './functions';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.setState();
    this.setTeams();
  }

  init() {
    this.gamePlay.drawUi(CST.themes[`level${this.state.level % 4 || 4}`]);
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

    window.addEventListener('beforeunload', () => this.saveCurrentState());
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

    const loadedState = this.stateService.load();

    if (loadedState && loadedState.currentState) {
      this.state = loadedState.currentState;
      return;
    }

    this.state = state;
    this.stateService.save({ currentState: null, savedState: null });
  }

  saveCurrentState() {
    const loadedState = this.stateService.load();
    this.state.selectedChar = null;

    loadedState.currentState = this.state;
    this.stateService.save(loadedState);
  }

  setTeams() {
    this.userTeam = this.state.positions
      .filter((char) => char.character.teamType === 'user');
    this.aiTeam = this.state.positions
      .filter((char) => char.character.teamType === 'ai');
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
        this.makeMove(this.state.selectedChar, index)
          .then(() => {
            this.setAfterTurn();
            this.switchTurn();

            return this.makeAiActions();
          })
          .then(() => {
            this.setAfterTurn();

            if (!this.checkWinStatus()) {
              this.switchTurn();
              return;
            }

            this.setLostGame();
          })
          .catch((error) => GamePlay.showMessage(error.message));
      }

      if (posibleActions.canAttack) {
        this.makeAttack(this.state.selectedChar, index)
          .then(() => {
            this.setAfterTurn();

            if (!this.checkWinStatus()) {
              this.switchTurn();
              return this.makeAiActions();
            }

            this.levelUp();
            this.switchTurn();
          })
          .then(() => {
            this.setAfterTurn();
            this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
            this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));

            if (!this.checkWinStatus()) {
              this.switchTurn();
              return;
            }

            this.setLostGame();
          })
          .catch((error) => GamePlay.showMessage(error.message));
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
        this.gamePlay.setCursor(CST.cursors.notallowed);
      } else {
        this.gamePlay.setCursor(CST.cursors.pointer);
      }
    }

    if (this.state.selectedChar) {
      const posibleActions = this.getPosibileActions(this.state.selectedChar, index);
      if (cell.classList.contains('selected-yellow')) {
        this.gamePlay.setCursor(CST.cursors.auto);
      } else if (posibleActions.canMove) {
        this.gamePlay.setCursor(CST.cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (posibleActions.canAttack) {
        this.gamePlay.setCursor(CST.cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else if (!isCharacter) {
        this.gamePlay.setCursor(CST.cursors.notallowed);
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
      this.gamePlay.setCursor(CST.cursors.auto);
    }
  }

  onNewGameClick() {
    if (!confirm('Do yo realy want to start new game!\nYour progress will no save!')) {
      return;
    }
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

  onSaveGameClick() {
    GamePlay.showMessage('Your game succesfully saved!');
    this.state.selectedChar = null;

    const loadedState = this.stateService.load();
    loadedState.savedState = this.state;
    this.stateService.save(loadedState);
  }

  onLoadGameClick() {
    if (!confirm('Do yo realy want to load game!\nYour progress will no save!')) {
      return;
    }

    const loadedState = this.stateService.load();

    if (!loadedState.savedState) {
      GamePlay.showMessage('Can\'t find saved games!');
      return;
    }

    this.state = loadedState.savedState;
    this.setTeams();
    this.blockGame();
    this.init();
  }

  makeMove(character, index) {
    return new Promise((resolve) => {
      character.position = index;
      this.gamePlay.setCursor(CST.cursors.auto);
      this.gamePlay.cells.forEach((cell, idx) => this.gamePlay.deselectCell(idx));
      this.state.selectedChar = null;
      resolve();
    });
  }

  makeAttack(character, index) {
    const target = this.state.positions
      .filter((char) => char.position === index)[0].character;
    const damage = Character.getDamage.call(character.character, target);

    Character.takeDamage.call(target, damage);

    this.gamePlay.setCursor(CST.cursors.auto);
    this.gamePlay.cells.forEach((cell, idx) => this.gamePlay.deselectCell(idx));
    this.state.selectedChar = null;

    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];

    return this.gamePlay.showDamage(index, damage);
  }

  levelUp() {
    this.state.currentScore += this.getScore();
    this.gamePlay.scoreFieldEl.innerText = this.state.currentScore;
    this.blockGame();

    if (this.state.level >= 2) {
      const message = `Congratulations! You win!\nYour score is ${this.state.currentScore}.`;

      GamePlay.showMessage(message);
      this.setEndGameEvents();
      return;
    }

    this.state.positions.forEach((char) => Character.levelUp.call(char.character));
    this.state.level += 1;

    const userCharsAmount = this.userTeam.length;
    const addCharAmount = Math.min(this.state.level - 1, 2);
    const additionalUserChars = new UserTeam(this.state.level - 1, addCharAmount).positions;
    const additionalAiChars = new AiTeam(this.state.level, userCharsAmount
         + addCharAmount).positions;

    this.state.positions.push(...additionalUserChars, ...additionalAiChars);
    this.init();
    this.setTeams();
  }

  switchTurn() {
    if (this.state.turn === 'user') {
      this.state.turn = 'ai';
    } else {
      this.state.turn = 'user';
    }
  }

  setAfterTurn() {
    this.removeCharacter();
    this.gamePlay.redrawPositions(this.state.positions);
    this.setTeams();
  }

  removeCharacter() {
    this.state.positions = this.state.positions
      .filter((char) => char.character.health !== 0);
  }

  setLostGame() {
    this.blockGame();
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    GamePlay.showMessage(`Sorry! You lost!\nYour score is ${this.state.currentScore}`);
  }

  blockGame() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.loadGameListeners = [];
    this.gamePlay.setCursor(CST.cursors.auto);
    this.setMaxScore();
  }

  checkWinStatus() {
    return !this.state.positions
      .filter((char) => char.character.teamType !== this.state.turn).length;
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

  getScore() {
    const score = this.userTeam
      .reduce((cur, char) => cur + char.character.health, 0);

    return score;
  }

  setMaxScore() {
    if (this.stateService.load()) {
      const currentState = this.stateService.load();

      this.state.maxScore = Math.max(this.state.currentScore, currentState.maxScore);
      this.gamePlay.maxScoreFieldEl.innerText = this.state.maxScore;
      currentState.maxScore = this.state.maxScore;
      this.stateService.save(currentState);
    }
  }

  makeAiActions() {
    const object = this.createBattleObj();
    const attackers = object.filter((entity) => !!entity.targets.userTargets.length);
    const movers = object.filter((entity) => !!entity.freeCells.length);

    if (!movers.length && !attackers.length) {
      return;
    }

    if (!attackers.length) {
      const entity = movers[fn.randomInteger(0, movers.length - 1)];
      const to = entity.freeCells[fn.randomInteger(0, entity.freeCells.length - 1)];

      entity.character.position = to;
      return;
    }

    const attacker = attackers[fn.randomInteger(0, attackers.length - 1)];
    const targets = attacker.targets.userTargets;
    const index = fn.randomInteger(0, targets.length - 1);

    const target = targets[index];
    const damage = attacker.targets.getDamages[index];

    Character.takeDamage.call(target.character, damage);
    return this.gamePlay.showDamage(target.position, damage);
  }

  createBattleObj() {
    const object = [];
    const cellsUnderAttack = [];

    this.userTeam.forEach((char) => {
      cellsUnderAttack.push(
        ...fn.getCellsForAttack(char.position, char.character.attackRange),
      );
    });

    this.aiTeam.forEach((positionedChar) => {
      const character = positionedChar;
      const { position } = character;
      const { attackRange } = character.character;
      const { moveRange } = character.character;

      const cellsForAttack = fn.getCellsForAttack(position, attackRange);
      const disabledForMove = this.state.positions
        .map((char) => char.position);
      const cellsForMove = fn.getCellsForMove(position, moveRange)
        .filter((cell) => !disabledForMove.includes(cell));
      const userTargets = this.userTeam
        .filter((char) => cellsForAttack.includes(char.position));

      const getDamages = userTargets
        .map((defencer) => Character.getDamage.call(character.character, defencer.character));

      const userAttackers = this.userTeam
        .map((char) => [char.character,
          fn.getCellsForAttack(char.position, char.character.attackRange),
        ])
        .filter((char) => char[1].includes(character.position))
        .map((char) => char[0]);

      const takeDamages = userAttackers
        .map((attacker) => Character.getDamage.call(attacker, character.character));

      const freeCells = cellsForMove
        .filter((cell) => !cellsUnderAttack.includes(cell));

      object.push({
        character,
        cellsForMove,
        freeCells,
        targets: { userTargets, getDamages },
        underAttack: { userAttackers, takeDamages },
      });
    });

    return object;
  }
}
