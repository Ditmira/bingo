// BingoApp.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const TOPIC_WORDS = [
    "React", "Hooks", "JSX", "Props", "State",
    "Node", "NPM", "Parcel", "Webpack", "ESLint",
    "Redux", "Context", "Router", "Axios", "API",
    "Promise", "Async", "Await", "DOM", "JSON",
    "GraphQL", "MongoDB", "Express", "JWT", "Socket.io"
];

const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

const generateBoard = () => {
    const shuffled = shuffleArray(TOPIC_WORDS);
    const board = [];
    let idx = 0;
    for (let row = 0; row < 5; row++) {
        const rowArr = [];
        for (let col = 0; col < 5; col++) {
            if (row === 2 && col === 2) {
                rowArr.push({ word: "FREE", marked: true });
            } else {
                rowArr.push({ word: shuffled[idx++], marked: false });
            }
        }
        board.push(rowArr);
    }
    return board;
};

export default function BingoApp() {
    const [board, setBoard] = useState(generateBoard);
    const [bingo, setBingo] = useState(false);

    const checkBingo = (board) => {
        const isLineComplete = (line) => line.every(cell => cell.marked);

        const rows = board;
        const cols = [0,1,2,3,4].map(i => board.map(row => row[i]));
        const diag1 = [0,1,2,3,4].map(i => board[i][i]);
        const diag2 = [0,1,2,3,4].map(i => board[i][4-i]);

        return [...rows, ...cols, diag1, diag2].some(isLineComplete);
    };

    const handleClick = (rowIdx, colIdx) => {
        if (board[rowIdx][colIdx].word === 'FREE') return;

        const newBoard = board.map((row, r) =>
            row.map((cell, c) =>
                r === rowIdx && c === colIdx ? { ...cell, marked: !cell.marked } : cell
            )
        );
        setBoard(newBoard);
        if (checkBingo(newBoard)) setBingo(true);
    };

    return (
        <div className="app">
            <h1>⚛️ React Bingo ⚛️</h1>
            <p className="subtitle">Learn React Concepts Through Play</p>
            <div className="board">
                {board.map((row, rowIdx) => (
                    <div key={rowIdx} className="row">
                        {row.map((cell, colIdx) => (
                            <div
                                key={colIdx}
                                className={`cell ${cell.marked ? 'marked' : ''}`}
                                onClick={() => handleClick(rowIdx, colIdx)}
                            >
                                {cell.word}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {bingo && (
                <motion.div
                    className="bingo-reward"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                    🎉 BINGO! 🎉
                </motion.div>
            )}
        </div>
    );
}
