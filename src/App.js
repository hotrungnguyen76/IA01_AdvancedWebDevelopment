import { useState } from "react";

const boardSize = 4;

function Square({ value, onSquareClick, isWinningSquare }) {
  let className = "square";
  if (isWinningSquare) {
    className += " highlighted";
  }
  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    onPlay({
      squares: nextSquares,
      player: xIsNext ? "X" : "O",
      position: convertIndex(i),
    });
  }

  const winnerInfo = calculateWinner(squares);
  let status;
  let winningLines;

  let winningSquares = [];
  if (winnerInfo) {
    status = "Winner: " + winnerInfo.player;
    //color
    winningSquares = winnerInfo.location;
  } else {
    const isEnd = squares.every((square) => square !== null);
    if (isEnd) {
      status = "TWO OPPOSITIONS ARE DRAW";
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  //Use two loops  to make the squares instead of hardcoding them
  const boardRows = [];

  for (let i = 0; i < boardSize; i++) {
    const squaresRow = [];
    for (let j = 0; j < boardSize; j++) {
      const squareIndex = i * boardSize + j;
      const isWinningSquare = winningSquares.includes(squareIndex);

      squaresRow.push(
        <Square
          key={squareIndex}
          value={squares[squareIndex]}
          onSquareClick={() => handleClick(squareIndex)}
          isWinningSquare={isWinningSquare}
        />
      );
    }
    boardRows.push(
      <div key={i} className="board-row">
        {squaresRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [isDescending, setIsDescending] = useState(true);
  const [history, setHistory] = useState([
    {
      squares: Array(boardSize * boardSize).fill(null),
      player: null,
      position: [null, null],
    },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((info, move) => {
    const isCurrentMove = move === currentMove;
    let description;

    if (isCurrentMove) {
      description = `You are at move #${move}: Player ${info.player} at [${info.position[0]},${info.position[1]}]`;
    } else {
      description = `Go to move #${move}`;
    }

    return (
      <li key={move}>
        {isCurrentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const sortedMoves = isDescending ? moves.slice().reverse() : moves;

  function toggleSortOrder() {
    setIsDescending((prev) => !prev);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div>
        <div>
          <button onClick={toggleSortOrder}>
            Toggle Sort Order: {isDescending ? "↓" : "↑"}
          </button>
        </div>
        <div className="game-info">
          <ol>{sortedMoves}</ol>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [];

  // Kiểm tra dãy dọc
  for (let i = 0; i < boardSize; i++) {
    lines.push([]);
    for (let j = 0; j < boardSize; j++) {
      lines[i].push(i * boardSize + j);
    }
  }

  // Kiểm tra dãy ngang
  for (let i = 0; i < boardSize; i++) {
    lines.push([]);
    for (let j = 0; j < boardSize; j++) {
      lines[boardSize + i].push(j * boardSize + i);
    }
  }

  // Kiểm tra đường chéo từ trái sang phải
  lines.push([]);
  for (let i = 0; i < boardSize; i++) {
    lines[2 * boardSize].push(i * (boardSize + 1));
  }

  // Kiểm tra đường chéo từ phải sang trái
  lines.push([]);
  for (let i = 0; i < boardSize; i++) {
    lines[2 * boardSize + 1].push((i + 1) * (boardSize - 1));
  }

  for (let i = 0; i < lines.length; i++) {
    const lineIndices = lines[i];
    const lineValues = lineIndices.map((index) => squares[index]);

    if (lineValues.every((value) => value && value === lineValues[0])) {
      return { player: lineValues[0], location: lineIndices };
    }
  }
  return null;
}

function convertIndex(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return [row, col];
}
