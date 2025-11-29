import React, { useState, useEffect, useRef, useCallback } from "react";

// Simple single-file Snake game (paste into App.jsx of a Vite/CRA React project)
// Tailwind classes are used for layout — optional but recommended.

const BOARD_SIZE = 20; // 20x20 grid
const START_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];
const START_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 150; // ms per tick

function randomFood(excludeCells = [], size = BOARD_SIZE) {
  const taken = new Set(excludeCells.map((c) => `${c.x},${c.y}`));
  let x, y, key;
  do {
    x = Math.floor(Math.random() * size);
    y = Math.floor(Math.random() * size);
    key = `${x},${y}`;
  } while (taken.has(key));
  return { x, y };
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [direction, setDirection] = useState(START_DIRECTION);
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const [food, setFood] = useState(() => randomFood(START_SNAKE));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Handle keyboard input
  const handleKey = useCallback((e) => {
    const key = e.key;
    // map keys to directions
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };

    if (!map[key]) return;
    const newDir = map[key];
    // prevent reversing
    const cur = directionRef.current;
    if (cur.x + newDir.x === 0 && cur.y + newDir.y === 0) return;
    setDirection(newDir);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Game tick
  useEffect(() => {
    if (!running) return;
    if (gameOver) return;

    const id = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const dir = directionRef.current;
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE
        ) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }

        // check self-collision
        const hitsSelf = prev.some((p) => p.x === newHead.x && p.y === newHead.y);
        if (hitsSelf) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }

        let ate = newHead.x === food.x && newHead.y === food.y;
        let newSnake = [newHead, ...prev];
        if (!ate) {
          newSnake.pop();
        } else {
          setScore((s) => s + 1);
          // faster as score grows a bit
          setSpeed((sp) => Math.max(40, sp - 4));
          setFood(randomFood(newSnake));
        }
        return newSnake;
      });
    }, speed);

    return () => clearInterval(id);
  }, [running, speed, food, gameOver]);

  const start = () => {
    setSnake(START_SNAKE);
    setDirection(START_DIRECTION);
    directionRef.current = START_DIRECTION;
    setFood(randomFood(START_SNAKE));
    setRunning(true);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  const pause = () => {
    setRunning(false);
  };

  const resume = () => {
    if (!gameOver) setRunning(true);
  };

  const restart = () => {
    start();
  };

  // Helper to render cells
  const cells = [];
  const snakeSet = new Set(snake.map((s) => `${s.x},${s.y}`));
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const key = `${x},${y}`;
      const isSnake = snakeSet.has(key);
      const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
      const isFood = food.x === x && food.y === y;
      cells.push({ x, y, isSnake, isHead, isFood, key });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4 text-white">
          <h1 className="text-2xl font-semibold">Snake — React</h1>
          <div className="flex gap-2 items-center">
            <div>Score: <span className="font-medium">{score}</span></div>
            <div>Speed: <span className="font-medium">{Math.round(1000 / speed)}</span></div>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <div
              className="grid bg-gray-800 border-2 border-gray-700"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1.4rem)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 1.4rem)`,
              }}
            >
              {cells.map((c) => (
                <div
                  key={c.key}
                  className={`w-6 h-6 border-gray-700 box-border 
                    ${c.isFood ? "bg-red-500 rounded-full" : ""} 
                    ${c.isSnake ? (c.isHead ? "bg-green-300" : "bg-green-500") : "bg-gray-800"}`}
                />
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              {!running && !gameOver && (
                <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={start}>
                  Start
                </button>
              )}

              {running && (
                <button className="px-3 py-1 rounded bg-yellow-500 text-black" onClick={pause}>
                  Pause
                </button>
              )}

              {!running && !gameOver && (
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={resume}>
                  Resume
                </button>
              )}

              {gameOver && (
                <>
                  <div className="text-red-400 font-medium flex items-center">Game Over</div>
                  <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={restart}>
                    Restart
                  </button>
                </>
              )}

              <button
                className="px-3 py-1 rounded bg-gray-700 text-white"
                onClick={() => {
                  // quick reset without starting
                  setSnake(START_SNAKE);
                  setDirection(START_DIRECTION);
                  directionRef.current = START_DIRECTION;
                  setFood(randomFood(START_SNAKE));
                  setScore(0);
                  setGameOver(false);
                  setRunning(false);
                  setSpeed(INITIAL_SPEED);
                }}
              >
                Reset
              </button>

              <button
                className="px-3 py-1 rounded bg-indigo-600 text-white"
                onClick={() => setSpeed((s) => Math.max(40, s - 20))}
              >
                Faster
              </button>
              <button
                className="px-3 py-1 rounded bg-indigo-600 text-white"
                onClick={() => setSpeed((s) => Math.min(1000, s + 20))}
              >
                Slower
              </button>
            </div>

            <div className="mt-2 text-gray-300 text-sm">
              Controls: Arrow keys or WASD. The game speeds up slightly each time you eat food.
            </div>
          </div>

          <div className="flex-1 text-white">
            <div className="bg-gray-800 p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">How it works</h2>
              <ul className="list-disc pl-5 text-sm text-gray-300">
                <li>Grid-based snake movement with tick driven by <code>setInterval</code>.</li>
                <li>Collision detection with walls and self.</li>
                <li>Eating food grows the snake and increases score & speed.</li>
              </ul>

              <h3 className="mt-4 font-semibold">Possible extensions</h3>
              <ol className="list-decimal pl-5 text-sm text-gray-300">
                <li>Touch / swipe controls for mobile.</li>
                <li>Persistent high score using localStorage.</li>
                <li>Level obstacles, power-ups, or two-player mode.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">Tip: paste this file as <code>App.jsx</code> in a React + Tailwind project (Vite or CRA).</div>
      </div>
    </div>
  );
}
