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
  const boostChance = 0.85;

  const boardCombos = [];

  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    const letter = getColumnLetter(rowIdx); // B, I, N, G, O
    for (let colIdx = 0; colIdx < 5; colIdx++) {
      const cell = board[rowIdx][colIdx];
      if (cell.word !== "FREE") {
        const combo = `${letter}${cell.word}`;
        boardCombos.push(combo);
      }
    }
  }

  while (calls.length < 30 && (boardCombos.length > 0 || used.size < 75)) {
    let combo = null;

    if (Math.random() < boostChance && boardCombos.length > 0) {
      const randomIndex = Math.floor(Math.random() * boardCombos.length);
      combo = boardCombos.splice(randomIndex, 1)[0];
    } else {
      while (!combo) {
        const letter = getColumnLetter(Math.floor(Math.random() * 5));
        const number = Math.floor(Math.random() * 75) + 1;
        const potentialCombo = `${letter}${number}`;
        if (!used.has(potentialCombo)) {
          combo = potentialCombo;
        }
      }
    }

    if (!used.has(combo)) {
      used.add(combo);
      calls.push(combo);
    }
  }

  return calls;
};

export default function BingoApp() {
  const [board, setBoard] = useState(generateBoard);
  const [calls, setCalls] = useState([]);
  const [bingo, setBingo] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [clickableCell, setClickableCell] = useState(null);
  const [allCallsCompleted, setAllCallsCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(true);

  const callIndex = useRef(0);
  const boardRef = useRef(board);
  const callIntervalRef = useRef(null); // ✅ Added to store interval

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    if (gameStarted) {
      const newBoard = generateBoard();
      setBoard(newBoard);
      const newCalls = generateCalls(newBoard);
      callIndex.current = 0;
      setCalls(newCalls);
      setAllCallsCompleted(false);
      setCurrentCall(null);
      setClickableCell(null);
      setBingo(false);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (calls.length === 0) return;

    callIntervalRef.current = setInterval(() => {
      if (callIndex.current >= calls.length) {
        clearInterval(callIntervalRef.current);
        setClickableCell(null);
        setAllCallsCompleted(true);
        return;
      }

      const call = calls[callIndex.current];
      setCurrentCall(call);

      const letter = call[0];
      const number = call.slice(1);
      const colIdx = ['B', 'I', 'N', 'G', 'O'].indexOf(letter);

      let found = null;
      for (let row = 0; row < 5; row++) {
        const cell = boardRef.current[colIdx][row];
        if (cell.word === number) {
          found = [colIdx, row];
          break;
        }
      }

      setClickableCell(found);
      callIndex.current++;
    }, 5000);

    return () => clearInterval(callIntervalRef.current);
  }, [calls]);

  const checkBingo = (board) => {
    const isLineComplete = (line) => line.every(cell => cell.marked);

    const rows = board;
    const cols = [0, 1, 2, 3, 4].map(i => board.map(row => row[i]));
    const diag1 = [0, 1, 2, 3, 4].map(i => board[i][i]);
    const diag2 = [0, 1, 2, 3, 4].map(i => board[i][4 - i]);

    return [...rows, ...cols, diag1, diag2].some(isLineComplete);
  };

  const handleClick = (rowIdx, colIdx) => {
    if (!clickableCell || clickableCell[0] !== rowIdx || clickableCell[1] !== colIdx) return;

    const newBoard = board.map((row, r) =>
        row.map((cell, c) =>
            r === rowIdx && c === colIdx ? { ...cell, marked: true } : cell
        )
    );

    setBoard(newBoard);
    setClickableCell(null);

    if (checkBingo(newBoard)) {
      setBingo(true);
      clearInterval(callIntervalRef.current); // ✅ Stop calls on Bingo
    }
  };

  return (
      <div className="app">
        <h1 className="title">✨ Number Bingo ✨</h1>
        <p className="subtitle">Tap the highlighted number if it appears after each call!</p>
        <div className="current-call">
          {currentCall ? `🔔 Current Call: ${currentCall}` : '⏳ Waiting for calls...'}
        </div>
        {allCallsCompleted && <div className="no-more-calls">🚫 No more calls!</div>}

        <div className="board-wrapper">
          <div className="row letter-row">
            {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => (
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
