var previousTurnHealth = -1;

class Player {

  countInArray(array, value) {
    return array.reduce((n, x) => n + (x === value), 0);
  }

  needHealing(warrior) {
    return !this.hurt && warrior.health() < 15;
  }

  needToFlee(warrior) {
    return this.hurt && warrior.health() < 7;
  }

  setMapValues(warrior) {
    var inFront = this.map.slice(this.playerLocation + 1, this.playerLocation + 6);
    var backBehind = this.map.slice(this.playerLocation - 6, this.playerLocation - 1);
    for (var i = 1; i < inFront.length + 1; i++) {
      switch (this.map[this.playerLocation + i]) {
        case 0:
          if (this.needHealing(warrior)) {

          }
      }
    }
    warrior.think(inFront);
    warrior.think(backBehind);
  }

  makeAMap() {
    this.map = [];
    this.interestMap = [];
    for (var i = 0; i < 100; i++) {
      // Fog of war is -2
      this.map.push(-2);
      this.interestMap.push(1);
    }
    // player character is -1
    this.map[48] = -1;
    this.interestMap[48] = -1;
    // placing him in the middle of a static map
    // (might change this eventually to be dynamic)
    this.playerLocation = 48;
  }

  movePlayerLocation(direction, warrior) {
    switch (direction) {
      case 'forward':
        // move player location forward on both maps
        this.map[this.playerLocation] = 0;
        this.interestMap[this.playerLocation] = 0;
        this.playerLocation += 1;
        this.map[this.playerLocation] = -1;
        this.interestMap[this.playerLocation] = 1;
        break;
      case 'backward':
        // move player location backward on both maps
        this.map[this.playerLocation] = 0;
        this.interestMap[this.playerLocation] = 0;
        this.playerLocation -= 1;
        this.map[this.playerLocation] = -1;
        this.interestMap[this.playerLocation] = 1;
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
    if (this.constructor.mapMade === 'false') {
      this.makeAMap();
      this.constructor.mapMade = 'true';
    }
    this.hurt = false;
    if (this.previousTurnHealth > warrior.health()) {
      this.hurt = true;
    }
    this.setMapValues(warrior);
    var adjacentArray = this.lookAround(warrior);
    if (this.needHealing()) {
      warrior.rest();
    } else if (this.needToFlee()) {
      if (adjacentArray.includes(0)) {
        if (adjacentArray[0] === 0) {
          warrior.walk();
          this.movePlayerLocation('forward', warrior);
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
        this.movePlayerLocation('backward', warrior);
        // for some MYSTERIOUS reason, I have to set this to true or I
        // get the error of: Cannot read property 'isEnemy' of undefined
        this.constructor.hitBackwardWall = 'true';
      } else {
        warrior.walk();
        this.movePlayerLocation('forward', warrior);
      }
    }
    this.previousTurnHealth = warrior.health();
    this.lookAround(warrior);
    //warrior.think(this.map.slice(45, 55));
  }
}
// setting these as strings because booleans seem to intialize as null
// no matter what I do!
Player.hitBackwardWall = 'false';
Player.mapMade = 'false';
