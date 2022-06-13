import { GRID_SIZE } from "server/constants";

const createGameState = () => {
  return {
    players: [
      {
        position: {
          x: 3,
          y: 10,
        },
        velocity: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        position: {
          x: 9,
          y: 5,
        },
        velocity: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 8, y: 5 },
          { x: 7, y: 5 },
          { x: 9, y: 5 },
        ],
      },
    ],
    food: {},
    gridSize: GRID_SIZE,
  };
};

export const gameLoop = (state) => {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.position.x += playerOne.velocity.x;
  playerOne.position.y += playerOne.velocity.y;

  playerTwo.position.x += playerTwo.velocity.x;
  playerTwo.position.y += playerTwo.velocity.y;

  if (playerOne.position.x < 0 || playerOne.position.x > state.gridSize || playerOne.position.y < 0 || playerOne.position.y > state.gridSize) {
    return 2;
  }

  if (playerTwo.position.x < 0 || playerTwo.position.x > state.gridSize || playerTwo.position.y < 0 || playerTwo.position.y > state.gridSize) {
    return 1;
  }

  if (state.food.x === playerOne.position.x && state.food.y === playerOne.position.y) {
    playerOne.snake.push({ ...playerOne.position });
    playerOne.position.x += playerOne.velocity.x;
    playerOne.position.y += playerOne.velocity.y;
    randomFood(state);
  }

  if (state.food.x === playerTwo.position.x && state.food.y === playerTwo.position.y) {
    playerTwo.snake.push({ ...playerTwo.position });
    playerTwo.position.x += playerTwo.velocity.x;
    playerTwo.position.y += playerTwo.velocity.y;
    randomFood(state);
  }

  if (playerOne.velocity.x || playerOne.velocity.y) {
    for (const cell of playerOne.snake) {
      if (cell.x === playerOne.position.x && cell.y === playerOne.position.y) {
        return 2;
      }
    }
    playerOne.snake.push({ ...playerOne.position });
    playerOne.snake.shift();
  }

  if (playerTwo.velocity.x || playerTwo.velocity.y) {
    for (const cell of playerTwo.snake) {
      if (cell.x === playerTwo.position.x && cell.y === playerTwo.position.y) {
        return 1;
      }
    }
    playerTwo.snake.push({ ...playerTwo.position });
    playerTwo.snake.shift();
  }

  return false;
};

const randomFood = (state) => {
  const food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  for (const cell of state.players[0].snake) {
    if (cell.x == food.x && cell.y == food.y) {
      return randomFood(state);
    }
  }

  for (const cell of state.players[1].snake) {
    if (cell.x == food.x && cell.y == food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
};

export const getUpdatedVelocity = (keyCode) => {
  switch (keyCode) {
    case 37: {
      // left
      return { x: -1, y: 0 };
    }
    case 38: {
      // down
      return { x: 0, y: -1 };
    }
    case 39: {
      // right
      return { x: 1, y: 0 };
    }
    case 40: {
      // up
      return { x: 0, y: 1 };
    }
  }
};

export const initGame = () => {
  const state = createGameState();
  randomFood(state);
  return state;
};
