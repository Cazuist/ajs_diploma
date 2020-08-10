import GamePlay from './GamePlay';
import GameState from './GameState';
import GameStateService from './GameStateService';

import UserTeam from './teams/UserTeam';
import AiTeam from './teams/AiTeam';

import cursors from './cursors';
import themes from './themes';
import * as fn from './functions';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();

    this.positions = [...(new UserTeam()).positions, ...(new AiTeam()).positions];
    this.gameLevel = 1;
    this.turn = 'user';
    this.selectedIndex = 0;
    this.selectedChar = null;
    this.currentScore = 0;
    this.maxScore = 0;
  }

  init() {
    this.gamePlay.drawUi(themes[`level${this.gameLevel}`]);
    this.gamePlay.redrawPositions(this.positions);

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));

    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    const isCharacter = !!this.gamePlay.cells[index].children.length;
    let type;

    if (isCharacter) {
      const positionedChar = this.positions
        .filter((char) => char.position === index)[0];

      const char = positionedChar.character;
      type = char.teamType;

      if (this.turn === char.teamType) {
        this.gamePlay.deselectCell(this.selectedIndex);
        this.gamePlay.selectCell(index);

        this.selectedIndex = index;
        this.selectedChar = positionedChar;
      }
    }

    if (this.selectedChar) {
      const { position } = this.selectedChar;
      const { character } = this.selectedChar;
      const cellsForMove = fn.getCellsForMove(position, character.moveRange);
      const cellsForAttack = fn.getCellsForAttack(position, character.attackRange);

      const canMove = !isCharacter && cellsForMove.includes(index);
      const canAttack = isCharacter && type !== this.turn && cellsForAttack.includes(index);

      if (canMove) {
        this.gamePlay.setCursor(cursors.auto);
        this.selectedChar.position = index;
        this.gamePlay.redrawPositions(this.positions);
        this.gamePlay.cells.forEach((cell, idx) => this.gamePlay.deselectCell(idx));
        this.selectedChar = null;
        this.switchTurn();
      }

      if (canAttack) {
        const target = this.positions.filter((char) => char.position === index)[0].character;
        const damage = this.selectedChar.character.getDamage(target);

        this.gamePlay.showDamage(index, damage)
          .then(() => {
            target.takeDamage(damage);
            this.gamePlay.setCursor(cursors.auto);

            if (target.health === 0) {
              this.removeCharacter();
            }

            this.selectedChar = null;
            this.gamePlay.redrawPositions(this.positions);
            this.gamePlay.cells.forEach((cell, idx) => this.gamePlay.deselectCell(idx));
            this.switchTurn();
          }).catch((error) => alert(error.message));
      }

      if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
        alert('Attantion! Not allowed action!');
      }
    }
  }

  onCellEnter(index) {
    const isCharacter = !!this.gamePlay.cells[index].children.length;
    let type;

    if (isCharacter) {
      const filteredChar = this.positions
        .filter((char) => char.position === index)[0]
        .character;

      type = filteredChar.teamType;

      const { attack, defence, health } = filteredChar;
      const message = fn.tagTip`${this.gameLevel}${attack}${defence}${health}`;

      this.gamePlay.showCellTooltip(message, index);
    }

    if (this.selectedChar) {
      const { position } = this.selectedChar;
      const { character } = this.selectedChar;
      const cellsForMove = fn.getCellsForMove(position, character.moveRange);
      const cellsForAttack = fn.getCellsForAttack(position, character.attackRange);

      const canMove = !isCharacter && cellsForMove.includes(index);
      const canAttack = isCharacter && type !== this.turn && cellsForAttack.includes(index);

      if (canMove) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (canAttack) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else if (index === this.selectedIndex) {
        this.gamePlay.setCursor(cursors.auto);
      } else if (isCharacter && type === this.turn) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    const isCharacter = !!this.gamePlay.cells[index].children.length;

    if (!isCharacter) {
      this.gamePlay.deselectCell(index);
    } else {
      this.gamePlay.hideCellTooltip(index);

      if (this.selectedIndex !== index) {
        this.gamePlay.deselectCell(index);
      }
    }
  }

  onNewGameClick() {
    if (confirm('Do yo realy want to start new game!\nYour progress will no save!')) {
      this.gamePlay = new GamePlay();
      this.stateService = new GameStateService(localStorage);
      this.gamePlay.bindToDOM(document.querySelector('#game-container'));

      this.positions = [...(new UserTeam()).positions, ...(new AiTeam()).positions];
      this.selectedIndex = 0;
      this.selectedChar = null;
      this.init();
    }
  }

  switchTurn() {
    if (this.turn === 'user') {
      this.turn = 'ai';
    } else {
      this.turn = 'user';
    }
  }

  removeCharacter() {
    this.positions = this.positions.filter((char) => char.character.health !== 0);
  }
  /*
  //В разработке
  onLoadGameClick() {
    if (confirm('Do yo realy want to load game!\nYour progress will no save!')) {
      return 1;
    }
  }

  onSaveGameClick() {
    alert('Your game succesfully saved!');
    this.stateService.save(GameState.from(this));
  }

  getScore() {
    const score = this.positions
      .filter((char) => char.character.teamType = 'user')
      .reduce((cur, char1) => cur + char1.character.health, 0);

    return score;
  }

  checkWinStatus() {
    return !this.positions
      .filter((char) => char.character.teamType !== this.turn).length;
  } */
}
