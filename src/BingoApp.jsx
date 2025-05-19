// BingoApp.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const generateRandomNumbers = () => {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, 24);
};

const generateBoard = () => {
  const numbers = generateRandomNumbers();
  const board = [];
  let idx = 0;
  for (let row = 0; row < 5; row++) {
    const rowArr = [];
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        rowArr.push({ word: "FREE", marked: true });
      } else {
        rowArr.push({ word: numbers[idx++].toString(), marked: false });
      }
    }
    board.push(rowArr);
  }
  return board;
};

const getColumnLetter = (colIdx) => ['B', 'I', 'N', 'G', 'O'][colIdx];

const generateCalls = (board) => {
  const calls = [];
  const used = new Set();
  const boostChance = 0.65; // 65% chance to pick a number from the board

  while (calls.length < 10) {
    let letterIdx, number, combo;

    if (Math.random() < boostChance) {
      // Pick a number from the board
      while (true) {
        letterIdx = Math.floor(Math.random() * 5);
        const col = board.map(row => row[letterIdx]);
        const candidates = col.filter(cell => cell.word !== 'FREE');
        if (candidates.length === 0) continue;
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        number = parseInt(chosen.word, 10);
        combo = `${getColumnLetter(letterIdx)}${number}`;
        if (!used.has(combo)) break;
      }
    } else {
      letterIdx = Math.floor(Math.random() * 5);
      number = Math.floor(Math.random() * 75) + 1;
      combo = `${getColumnLetter(letterIdx)}${number}`;
      if (used.has(combo)) continue;
    }

    used.add(combo);
    calls.push(combo);
  }
  return calls;
};

export default function BingoApp() {
  const [board, setBoard] = useState(generateBoard);
  const [calls, setCalls] = useState([]);
  const [bingo, setBingo] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [clickableCell, setClickableCell] = useState(null);
  const callIndex = useRef(0);
  const boardRef = useRef(board);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    setCalls(generateCalls(board));
  }, [board]);

  useEffect(() => {
    if (calls.length === 0) return;

    const interval = setInterval(() => {
      if (callIndex.current >= calls.length) {
        clearInterval(interval);
        setClickableCell(null);
        return;
      }
      const call = calls[callIndex.current];
      setCurrentCall(call);

      const letter = call[0];
      const number = call.slice(1);
      const colIdx = ['B','I','N','G','O'].indexOf(letter);

      let found = null;
      for (let row = 0; row < 5; row++) {
        const cell = boardRef.current[row][colIdx];
        if (cell.word === number) {
          found = [row, colIdx];
          break;
        }
      }
      setClickableCell(found);
      callIndex.current++;
    }, 5000);
    return () => clearInterval(interval);
  }, [calls]);

  const checkBingo = (board) => {
    const isLineComplete = (line) => line.every(cell => cell.marked);

    const rows = board;
    const cols = [0,1,2,3,4].map(i => board.map(row => row[i]));
    const diag1 = [0,1,2,3,4].map(i => board[i][i]);
    const diag2 = [0,1,2,3,4].map(i => board[i][4-i]);

    return [...rows, ...cols, diag1, diag2].some(isLineComplete);
  };

  const handleClick = (rowIdx, colIdx) => {
    if (!clickableCell || (clickableCell[0] !== rowIdx || clickableCell[1] !== colIdx)) return;
    if (board[rowIdx][colIdx].word === 'FREE') return;

    const newBoard = board.map((row, r) =>
        row.map((cell, c) =>
            r === rowIdx && c === colIdx ? { ...cell, marked: true } : cell
        )
    );
    setBoard(newBoard);
    if (checkBingo(newBoard)) setBingo(true);
    setClickableCell(null);
  };

  return (
      <div className="app">
        <h1 className="title">✨ Number Bingo ✨</h1>
        <p className="subtitle">Tap the highlighted number if it appears after each call!</p>
        <div className="current-call">{currentCall ? `🔔 Current Call: ${currentCall}` : '⏳ Waiting for calls...'}</div>
        <div className="board-wrapper">
          <div className="row letter-row">
            {['B','I','N','G','O'].map((letter, idx) => (
                <div key={idx} className="cell letter-cell no-click">{letter}</div>
            ))}
          </div>
          <div className="board">
            {board.map((row, rowIdx) => (
                <div key={rowIdx} className="row">
                  {row.map((cell, colIdx) => {
                    const isClickable = clickableCell && clickableCell[0] === rowIdx && clickableCell[1] === colIdx;
                    return (
                        <div
                            key={colIdx}
                            className={`cell ${cell.marked ? 'marked' : ''} ${cell.word === 'FREE' ? 'free' : ''} ${isClickable ? 'highlight' : 'disabled'}`}
                            onClick={() => handleClick(rowIdx, colIdx)}
                        >
                          <span className="cell-content">{cell.word}</span>
                        </div>
                    );
                  })}
                </div>
            ))}
          </div>
        </div>
        {bingo && (
            <motion.div
                className="bingo-reward"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <div className="bingo-popup">
                <span className="bingo-text">🎊 BINGO! 🎊</span>
                <p className="bingo-subtext">You're a winner!</p>
              </div>
            </motion.div>
        )}
      </div>
  );
}
