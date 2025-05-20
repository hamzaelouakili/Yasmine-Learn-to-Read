import { useState } from "react";
import "./App.css";

// Simple Dutch word-picture pairs (replace with your own images for a personalized experience)
const gameData = [
  {
    word: "kat",
    img: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Cat_poster_1.jpg",
    sound: "k-a-t",
  },
  {
    word: "boom",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Tree.jpg",
    sound: "b-oo-m",
  },
  {
    word: "vis",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/17/Goldfish3.jpg",
    sound: "v-i-s",
  },
];

function App() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const choices = [...gameData].sort(() => Math.random() - 0.5);
  const correct = gameData[current];

  function handleChoice(word: string) {
    setSelected(word);
    setShowResult(true);
    if (word === correct.word) setScore(score + 1);
  }

  function next() {
    setSelected(null);
    setShowResult(false);
    setCurrent((prev) => (prev + 1) % gameData.length);
  }

  return (
    <div className="game-container">
      <h1>Yasmine Lees Avontuur</h1>
      <p className="score">Score: {score}</p>
      <div className="picture-area">
        <img src={correct.img} alt="woord" className="picture" />
      </div>
      <div className="choices">
        {choices.map((item) => (
          <button
            key={item.word}
            className={`choice-btn ${
              selected === item.word
                ? item.word === correct.word
                  ? "correct"
                  : "wrong"
                : ""
            }`}
            onClick={() => !showResult && handleChoice(item.word)}
            disabled={!!selected}
          >
            {item.word}
          </button>
        ))}
      </div>
      <div className="sound-area">
        <span className="sound">{correct.sound}</span>
      </div>
      {showResult && (
        <div className="result">
          {selected === correct.word ? "Goed gedaan!" : "Probeer het nog eens!"}
          <button className="next-btn" onClick={next}>
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
