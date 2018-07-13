var previousTurnHealth = -1;

class Player {

  countInArray(array, value) {
    return array.reduce((n, x) => n + (x === value), 0);
  }

  makeAMap() {
    this.map = [];
    for (var i = 0; i < 100; i++) {
      this.map.push(0);
    }
    this.map[48] = -1;
    this.playerLocation = 48;
  }

  movePlayerLocation(direction, warrior) {
    switch (direction) {
      case 'forward':
        this.map[this.playerLocation] = 0;
        this.playerLocation += 1;
        this.map[this.playerLocation] = -1;
        break;
      case 'backward':
        this.map[this.playerLocation] = 0;
        this.playerLocation -= 1;
        this.map[this.playerLocation] = -1;
        break;
      default:
        warrior.think("Hmm...well movePlayerLocation didn't work.");
    }
  }


  lookAround(warrior) {
    var adjacentArray = [0, 0, 0, 0];
    if (!warrior.feel().isEmpty()) {
      if (warrior.feel().getUnit().isEnemy()) {
        adjacentArray[0] = 1;
        this.map[this.playerLocation + 1] = 1;
        warrior.think(this.map[this.playerLocation + 1]);
      } else if (warrior.feel().getUnit().isBound()) {
        adjacentArray[0] = 2;
        this.map[this.playerLocation + 1] = 2;
      }
    } else {
      this.map[this.playerLocation + 1] = 0;
    }
    if (!warrior.feel('backward').isEmpty()) {
      if (warrior.feel('backward').getUnit().isEnemy()) {
        adjacentArray[1] = 1;
        this.map[this.playerLocation - 1] = 1;
      } else if (warrior.feel('backward').getUnit().isBound()) {
        adjacentArray[1] = 2;
        this.map[this.playerLocation - 1] = 2;
      } else if (warrior.feel('backward').isWall()) {
        adjacentArray[1] = 3;
        this.map[this.playerLocation - 1] = 3;
        this.constructor.hitBackwardWall = 'true';
      }
    } else {
      this.map[this.playerLocation + 1] = 0;
    }
    return adjacentArray;
  }

  playTurn(warrior) {
    var walkBackward = this.constructor.hitBackwardWall;
    this.makeAMap();
    var hurt = false;
    if (this.previousTurnHealth > warrior.health()) {
      hurt = true;
    }
    var adjacentArray = this.lookAround(warrior);
    if (!hurt && warrior.health() < 15) {
      warrior.rest();
    } else if (hurt && warrior.health() < 5) {
      if (adjacentArray.includes(0)) {
        if (adjacentArray[0] === 0) {
          warrior.walk();
        } else if (adjacentArray[1] === 0) {
          warrior.walk('backward');
          this.movePlayerLocation('backward', warrior);
        }
      }
    } else if (adjacentArray.includes(1)) {
      if (adjacentArray[0] === 1) {
        warrior.attack();
      } else if (adjacentArray[1] === 1) {
        warrior.attack('backward');
      }
    } else
    if (adjacentArray.includes(2)) {
      if (adjacentArray[0] === 2) {
        warrior.rescue();
      } else if (adjacentArray[1] === 2) {
        warrior.rescue('backward');
      }
    } else {
      if (walkBackward === 'false') {
        warrior.walk('backward');
        this.constructor.hitBackwardWall = 'true';
        this.movePlayerLocation('backward', warrior);
      } else {
        warrior.walk();
      }
    }
    this.previousTurnHealth = warrior.health();
    warrior.think("\n\n\n\n" + this.map + "\n\n\n\n");
  }
}
Player.hitBackwardWall = 'false';