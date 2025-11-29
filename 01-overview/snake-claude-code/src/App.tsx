import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{x: 10, y: 10}];
const INITIAL_DIRECTION = {x: 1, y: 0};
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({x: 15, y: 15});
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [wallMode, setWallMode] = useState('wall'); // 'wall' or 'passthrough'

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({x: 15, y: 15});
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  const toggleWallMode = () => {
    if (!gameStarted || gameOver) {
      setWallMode(prev => prev === 'wall' ? 'passthrough' : 'wall');
    }
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Handle wall collision based on mode
      if (wallMode === 'wall') {
        // Wall mode: game over on collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }
      } else {
        // Pass-through mode: wrap around edges
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, gameStarted, generateFood, wallMode]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && e.key.startsWith('Arrow')) {
        setGameStarted(true);
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      setDirection(prev => {
        switch (e.key) {
          case 'ArrowUp':
            return prev.y !== 1 ? {x: 0, y: -1} : prev;
          case 'ArrowDown':
            return prev.y !== -1 ? {x: 0, y: 1} : prev;
          case 'ArrowLeft':
            return prev.x !== 1 ? {x: -1, y: 0} : prev;
          case 'ArrowRight':
            return prev.x !== -1 ? {x: 1, y: 0} : prev;
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  useEffect(() => {
    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-green-800">Snake Game</h1>
          <div className="text-2xl font-bold text-green-600">Score: {score}</div>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={toggleWallMode}
            disabled={gameStarted && !gameOver}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              wallMode === 'wall'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            } ${
              gameStarted && !gameOver
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-80'
            }`}
          >
            Wall Mode
          </button>
          <button
            onClick={toggleWallMode}
            disabled={gameStarted && !gameOver}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              wallMode === 'passthrough'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            } ${
              gameStarted && !gameOver
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-80'
            }`}
          >
            Pass-Through Mode
          </button>
        </div>

        <div 
          className="relative border-4 border-green-800 rounded-lg bg-green-50"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE
          }}
        >
          {snake.map((segment, i) => (
            <div
              key={i}
              className={`absolute ${i === 0 ? 'bg-green-700' : 'bg-green-500'} rounded-sm`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2
              }}
            />
          ))}
          
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2
            }}
          />

          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <div className="text-white text-center">
                <p className="text-2xl font-bold mb-2">Press Arrow Key to Start</p>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <div className="text-white text-center">
                <p className="text-3xl font-bold mb-4">Game Over!</p>
                <p className="text-xl mb-4">Final Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {isPaused && !gameOver && gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              <div className="text-white text-center">
                <p className="text-3xl font-bold">Paused</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-gray-600">
          <p className="text-sm">Use Arrow Keys to move • Press Space to pause</p>
          <p className="text-xs mt-2">
            <span className="font-semibold">Wall Mode:</span> Game ends at boundaries • 
            <span className="font-semibold ml-2">Pass-Through:</span> Wrap around edges
          </p>
          <p className="text-xs text-gray-500 mt-1">Change mode before starting game</p>
        </div>
      </div>
    </div>
  );
}