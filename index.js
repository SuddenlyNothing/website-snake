/*
 * Name: Bix Men
 * Date: 01.25.2022
 * Section: CSE 154 AG
 * Handles the snake game loop. Things like setting up the board, moving the snake, spawning the
 * apple and determining the gameover state.
 */

"use strict";
(function() {
  const DEFAULT_TICK_SPEED = 150;
  const TILE_WIDTH = 40;
  const TILE_HEIGHT = 40;
  const LEFT = 37;
  const A_KEY = 65;
  const UP = 38;
  const W_KEY = 87;
  const RIGHT = 39;
  const D_KEY = 68;
  const DOWN = 40;
  const S_KEY = 83;
  const SPACE_KEY = 32;
  let tickSpeed = DEFAULT_TICK_SPEED;
  let moveDir = [0, 0];
  let playing = false;
  let snakeBody = [];
  let lost = false;
  let won = false;
  let started = false;
  let inputed = false;
  let dirQueue;
  let defaultWidth;
  let defaultHeight;
  window.addEventListener("load", init);
  document.addEventListener('keydown', inputSetMoveDir);

  /**
   * Function called on window load. Initializes things that need to wait for the page to load
   * like event listeners.
   */
  function init() {
    id("start").addEventListener("click", onStartClick);
    id("again").addEventListener("click", onAgainClick);
    id("left").addEventListener("click", function() {
      setMoveDir([-1, 0]);
    });
    id("right").addEventListener("click", function() {
      setMoveDir([1, 0]);
    });
    id("up").addEventListener("click", function() {
      setMoveDir([0, -1]);
    });
    id("down").addEventListener("click", function() {
      setMoveDir([0, 1]);
    });
    let snakeBoard = id("snake-board");
    defaultWidth = Math.floor(snakeBoard.clientWidth / TILE_WIDTH);
    defaultHeight = Math.floor(snakeBoard.clientHeight / TILE_HEIGHT);
    id("width").value = defaultWidth;
    id("height").value = defaultHeight;
  }

  /**
   * All game processing happens here. Things like moving the player.
   */
  function gameLoop() {
    if (!playing) {
      return;
    }
    movePlayer();
    if (won) {
      gameOver(true);
    } else if (lost) {
      gameOver(false);
    }
    setTimeout(gameLoop, tickSpeed);
  }

  /**
   * Sets the game state to game over
   * @param {Boolean} winner - true if a winner, false if not.
   */
  function gameOver(winner) {
    playing = false;
    lost = false;
    won = false;
    dirQueue = null;
    inputed = false;
    started = false;
    if (winner) {
      showWin();
    } else {
      showLoss();
    }
    id("gameover").classList.remove("hidden");
  }

  /**
   * Set the win message
   */
  function showWin() {
    id("gameover-message").innerText = "You should try a harder difficulty!";
    id("gameover-title").innerText = "You Won!";
  }

  /**
   * Set the lose message
   */
  function showLoss() {
    id("gameover-message").innerText = "Try again?";
    id("gameover-title").innerText = "You Lost";
  }

  /**
   * Moves the player in the move direction.
   * Grows if came into contact with apple.
   */
  function movePlayer() {
    let currPos = snakeBody[0].id.split("-").map(Number);
    let newXPos = currPos[0] + moveDir[0];
    let newYPos = currPos[1] + moveDir[1];
    let newPos = id(newXPos + "-" + newYPos);
    if (!newPos || (newPos !== snakeBody[snakeBody.length - 1] &&
        (newPos.classList.contains("snake-head") || newPos.classList.contains("snake-body")))) {
      lost = true;
      return;
    }
    snakeBody[0].classList.remove("snake-head");
    if (newPos.classList.contains("apple")) {
      snakeBody[0].classList.add("snake-body");
      snakeBody.unshift(newPos);
      newPos.classList.remove("apple");
      newPos.classList.add("snake-head");
      spawnApple();
    } else {
      snakeBody[0].classList.add("snake-body");
      snakeBody.unshift(newPos);
      snakeBody.pop().classList.remove("snake-body");
      snakeBody[0].classList.add("snake-head");
    }
    inputed = false;
    if (dirQueue) {
      setMoveDir(dirQueue);
    }
  }

  /**
   * Spawns an apple not on the player.
   */
  function spawnApple() {
    let spawnLocations = qsa(".snake-tile:not(.snake-head):not(.snake-body)");
    if (spawnLocations.length === 0) {
      won = true;
      return;
    }
    let spawnLocation = Math.floor(Math.random() * spawnLocations.length);
    spawnLocations[spawnLocation].classList.add("apple");
  }

  /**
   * Sets the move dir based on the given input event.
   * @param {Object} event - input event
   */
  function inputSetMoveDir(event) {
    console.log(event.keyCode);
    if (event.keyCode === A_KEY || event.keyCode === LEFT) {
      setMoveDir([-1, 0]);
    } else if (event.keyCode === W_KEY || event.keyCode === UP) {
      setMoveDir([0, -1]);
    } else if (event.keyCode === D_KEY || event.keyCode === RIGHT) {
      setMoveDir([1, 0]);
    } else if (event.keyCode === S_KEY || event.keyCode === DOWN) {
      setMoveDir([0, 1]);
    } else if (event.keyCode === SPACE_KEY) {
      onAgainClick();
    }
  }

  /**
   * Set move dir for snake
   * @param {Array} dir - new move dir
   */
  function setMoveDir(dir) {
    if (!started) {
      return;
    }
    if (inputed) {
      dirQueue = dir;
    } else {
      if (snakeBody.length > 1) {
        let headPos = snakeBody[0].id.split("-").map(Number);
        let shoulderPos = snakeBody[1].id.split("-").map(Number);
        let faceDir = [
          headPos[0] - shoulderPos[0],
          headPos[1] - shoulderPos[1]
        ];
        if (dir[0] !== 0 && faceDir[0] !== 0) {
          return;
        }
        if (dir[1] !== 0 && faceDir[1] !== 0) {
          return;
        }
      }
      moveDir = dir;
      inputed = true;
      dirQueue = null;
    }
    if (!playing) {
      playing = true;
      gameLoop();
    }
  }

  /**
   * Initiates play again.
   */
  function onAgainClick() {
    let gameover = id("gameover");
    if (gameover.classList.contains("hidden")) {
      return;
    }
    gameover.classList.add("hidden");
    onStartClick();
  }

  /**
   * Initiates playing board.
   */
  function onStartClick() {
    let width = id("width").value;
    let height = id("height").value;
    if (width === "" || height === "") {
      throw new Error("Width and/or height is not a number!");
    }
    if (width * height <= 1) {
      id("width").value = defaultWidth;
      id("height").value = defaultHeight;
      throw new Error("Width and/or height is too small a number");
    }
    let tickSpeedInput = id("tick-speed");
    tickSpeed = tickSpeedInput.value;
    if (tickSpeed < 1) {
      tickSpeed = DEFAULT_TICK_SPEED;
      tickSpeedInput.value = DEFAULT_TICK_SPEED;
    }
    started = true;
    playing = false;
    snakeBody = [];
    initBoard(width, height);
  }

  /**
   * Sets up all the cells of the board according to the width and height.
   * @param {Number} width - width of board
   * @param {Number} height - height of board
   */
  function initBoard(width, height) {
    let snakeBoard = id("snake-board");
    snakeBoard.innerHTML = "";
    for (let i = 0; i < height; i++) {
      let tileContainer = document.createElement("div");
      tileContainer.classList.add("snake-tile-container");
      for (let j = 0; j < width; j++) {
        let tile = document.createElement("div");
        tile.classList.add("snake-tile");
        tile.id = j + "-" + i;
        if (i === Math.floor(height / 2) && j === Math.floor(width / 2)) {
          tile.classList.add("snake-head");
          snakeBody.push(tile);
        }
        tileContainer.appendChild(tile);
      }
      snakeBoard.appendChild(tileContainer);
    }
    spawnApple();
  }

  /**
   * Returns element with the given id.
   * @param {String} id - id of element
   * @returns {HTMLElement} element with id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns all elements with given selector.
   * @param {String} selector - selector of element
   * @returns {HTMLElement} all elements with given selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();