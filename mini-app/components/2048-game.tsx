"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const SIZE = 4;

function randomTile() {
  return Math.random() < 0.9 ? 2 : 4;
}

export function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // start with two tiles
    addRandomTile(grid);
    addRandomTile(grid);
  }, []);

  function addRandomTile(g: number[][]) {
    const empty = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    g[r][c] = randomTile();
    setGrid([...g]);
  }

  function move(dir: "up" | "down" | "left" | "right") {
    if (gameOver) return;
    let moved = false;
    let newGrid = grid.map(row => [...row]);

    const combine = (a: number[], b: number[]) => {
      const res = [];
      let skip = false;
      for (let i = 0; i < a.length; i++) {
        if (skip) { skip = false; continue; }
        if (i < b.length && a[i] === b[i]) {
          res.push(a[i] * 2);
          setScore(s => s + a[i] * 2);
          skip = true;
          moved = true;
        } else {
          res.push(a[i]);
        }
      }
      while (res.length < a.length) res.push(0);
      return res;
    };

    if (dir === "left") {
      for (let r = 0; r < SIZE; r++) {
        const row = newGrid[r].filter(v => v !== 0);
        const merged = combine(row, row);
        if (merged.some((v, i) => v !== newGrid[r][i])) moved = true;
        newGrid[r] = merged;
      }
    } else if (dir === "right") {
      for (let r = 0; r < SIZE; r++) {
        const row = newGrid[r].filter(v => v !== 0).reverse();
        const merged = combine(row, row).reverse();
        if (merged.some((v, i) => v !== newGrid[r][i])) moved = true;
        newGrid[r] = merged;
      }
    } else if (dir === "up") {
      for (let c = 0; c < SIZE; c++) {
        const col = [];
        for (let r = 0; r < SIZE; r++) if (newGrid[r][c] !== 0) col.push(newGrid[r][c]);
        const merged = combine(col, col);
        for (let r = 0; r < SIZE; r++) {
          if (merged[r] !== newGrid[r][c]) moved = true;
          newGrid[r][c] = merged[r];
        }
      }
    } else if (dir === "down") {
      for (let c = 0; c < SIZE; c++) {
        const col = [];
        for (let r = SIZE - 1; r >= 0; r--) if (newGrid[r][c] !== 0) col.push(newGrid[r][c]);
        const merged = combine(col, col).reverse();
        for (let r = SIZE - 1; r >= 0; r--) {
          if (merged[SIZE - 1 - r] !== newGrid[r][c]) moved = true;
          newGrid[r][c] = merged[SIZE - 1 - r];
        }
      }
    }

    if (moved) {
      setGrid(newGrid);
      addRandomTile(newGrid);
      if (checkGameOver(newGrid)) setGameOver(true);
    }
  }

  function checkGameOver(g: number[][]) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] === 0) return false;
        if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return false;
        if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((v, i) => (
          <div key={i} className="w-16 h-16 flex items-center justify-center bg-muted rounded">
            {v !== 0 && <span className="text-xl font-bold">{v}</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")}>↑</Button>
        <Button onClick={() => move("left")}>←</Button>
        <Button onClick={() => move("right")}>→</Button>
        <Button onClick={() => move("down")}>↓</Button>
      </div>
      <div className="text-lg">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-semibold">Game Over!</span>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
