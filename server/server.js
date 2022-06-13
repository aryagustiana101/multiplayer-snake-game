import { Server } from "socket.io";
import { initGame, gameLoop, getUpdatedVelocity } from "server/game";
import { makeGameCode } from "server/utilities";
import { FRAME_RATE } from "server/constants";

const state = {};
const clientRooms = {};

const io = new Server({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  const handleKeydown = (keyCode) => {
    const gameCode = clientRooms[socket.id];
    if (!gameCode) {
      return;
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const velocity = getUpdatedVelocity(keyCode);

    if (velocity) {
      state[gameCode].players[socket.number - 1].velocity = velocity;
    }
  };

  const handleNewGame = () => {
    const gameCode = makeGameCode(5);
    clientRooms[socket.id] = gameCode;
    socket.emit("gameCode", gameCode);

    state[gameCode] = initGame();
    socket.join(gameCode);
    socket.number = 1;
    socket.emit("init", 1);
  };

  const handleJoinGame = (gameCode) => {
    const room = io.sockets.adapter.rooms.get(gameCode);

    let allUsers;
    if (io.sockets.adapter.rooms.has(gameCode)) {
      allUsers = io.sockets.adapter.rooms.get(gameCode);
    }

    let numberClients = 0;
    if (allUsers) {
      numberClients = allUsers.size;
    }

    if (numberClients === 0) {
      socket.emit("unknownGame");
      return;
    }
    if (numberClients > 1) {
      socket.emit("fullGame");
      return;
    }

    clientRooms[socket.id] = gameCode;

    socket.join(gameCode);
    socket.number = 2;
    socket.emit("init", 2);

    startGameInterval(gameCode);
  };

  socket.on("keyDown", handleKeydown);
  socket.on("newGame", handleNewGame);
  socket.on("joinGame", handleJoinGame);
});

const startGameInterval = (gameCode) => {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[gameCode]);
    if (!winner) {
      emitGameState(gameCode, state[gameCode]);
    } else {
      emitGameOver(gameCode, winner);
      state[gameCode] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
};

function emitGameState(gameCode, state) {
  io.sockets.in(gameCode).emit("gameState", JSON.stringify(state));
}

function emitGameOver(gameCode, winner) {
  io.sockets.in(gameCode).emit("gameOver", JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
