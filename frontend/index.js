const BG_COLOR = "#231f20";
const PLAYER_ONE_COLOR = "red";
const PLAYER_TWO_COLOR = "blue";
const FOOD_COLOR = "#e66916";

const socket = io.connect("https://sleepy-cliffs-32051.herokuapp.com");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("fullGame", handleFullGame);

const gameScreen = document.getElementById("game-screen");
const initialScreen = document.getElementById("initial-screen");
const newGameButton = document.getElementById("new-game-button");
const joinGameButton = document.getElementById("join-game-button");
const gameCodeInput = document.getElementById("game-code-input");
const gameCodeDisplay = document.getElementById("game-code-display");
const gameCodeDisplayWrapper = document.getElementById("game-code-display-wrapper");

newGameButton.addEventListener("click", newGame);

joinGameButton.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  const gameCode = gameCodeInput.value;
  socket.emit("joinGame", gameCode);
  init();
}

let canvas, ctx, playerNumber;
let gameActive = false;

function init() {
  initialScreen.classList.add("d-none");
  gameScreen.classList.remove("d-none");

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keyDownHandler);
  gameActive = true;
}

function keyDownHandler(e) {
  socket.emit("keyDown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridSize = state.gridSize;
  const size = canvas.width / gridSize;

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, PLAYER_ONE_COLOR);
  paintPlayer(state.players[1], size, PLAYER_TWO_COLOR);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;

  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameCode(gameCode) {
  // gameCodeDisplayWrapper.classList.remove("d-none");
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
  reset();
  alert("Unknown Game Code");
}

function handleFullGame() {
  reset();
  alert("Game Full");
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  // gameCodeDisplayWrapper.classList.add("d-none");
  gameCodeDisplay.innerText = "";
  initialScreen.classList.remove("d-none");
  gameScreen.classList.add("d-none");
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }

  gameActive = false;

  data = JSON.parse(data);

  if (data.winner === playerNumber) {
    alert("You Win!");
    reset();
  } else {
    alert("You Lose!");
    reset();
  }
}
