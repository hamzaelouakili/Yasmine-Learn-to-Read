import { useState } from "react";
import "./App.css";

const gameData = [
  { word: "vis", sound: "v-i-s" },
  { word: "kat", sound: "k-a-t" },
  { word: "boom", sound: "b-oo-m" },
  { word: "bal", sound: "b-a-l" },
  { word: "jas", sound: "j-a-s" },
  { word: "pop", sound: "p-o-p" },
  { word: "bed", sound: "b-e-d" },
  { word: "pen", sound: "p-e-n" },
  { word: "boek", sound: "b-oe-k" },
  { word: "huis", sound: "h-ui-s" },
  { word: "deur", sound: "d-eu-r" },
  { word: "raam", sound: "r-aa-m" },
  { word: "stoel", sound: "s-t-oe-l" },
  { word: "tafel", sound: "t-a-f-e-l" },
  { word: "fiets", sound: "f-ie-t-s" },
  { word: "appel", sound: "a-p-p-e-l" },
  { word: "peer", sound: "p-ee-r" },
  { word: "ei", sound: "e-i" },
  { word: "melk", sound: "m-e-l-k" },
  { word: "kaas", sound: "k-aa-s" },
  { word: "maan", sound: "m-aa-n" },
  { word: "zon", sound: "z-o-n" },
  { word: "ster", sound: "s-t-e-r" },
  { word: "ijs", sound: "i-j-s" },
  { word: "beer", sound: "b-ee-r" },
  { word: "riet", sound: "r-ie-t" },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// Helper: splits a woord in klankblokken (zoals in sound), bv. 'beer' => ['b','ee','r']
function getPhonemeBlocks(word: string, sound: string) {
  // sound: 'b-ee-r' => ['b','ee','r']
  const blocks = sound.split("-");
  // Controle: als blocks samen niet het woord vormen, fallback op gewone letters
  if (blocks.join("") === word) return blocks;
  // fallback: gewone letters
  return word.split("");
}

function App() {
  const [score, setScore] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [current, setCurrent] = useState(
    () => gameData[Math.floor(Math.random() * gameData.length)]
  );
  const [phonemes, setPhonemes] = useState(() =>
    getPhonemeBlocks(current.word, current.sound)
  );
  const [slots, setSlots] = useState<(string | null)[]>(
    Array(phonemes.length).fill(null)
  );
  const [dragged, setDragged] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<("none" | "correct" | "wrong")[]>(
    Array(phonemes.length).fill("none")
  );
  const [showCongrats, setShowCongrats] = useState(false);
  // Alleen de klankblokken van het woord, in random volgorde
  function getLetterOptions(word: string, sound: string) {
    const blocks = getPhonemeBlocks(word, sound);
    let shuffled: string[];
    do {
      shuffled = shuffle(blocks);
    } while (shuffled.join("") === blocks.join(""));
    return shuffled;
  }
  const [letters, setLetters] = useState(() =>
    getLetterOptions(current.word, current.sound)
  );

  function speakWord(word: string) {
    if ("speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(word);
      utter.lang = "nl-NL";
      window.speechSynthesis.speak(utter);
    }
  }

  function handleDrop(idx: number) {
    if (dragged == null) return;
    const correctPhoneme = phonemes[idx];
    const newSlots = [...slots];
    const newFeedback = [...feedback];
    if (dragged === correctPhoneme && !slots.includes(dragged)) {
      newSlots[idx] = dragged;
      newFeedback[idx] = "correct";
      setSlots(newSlots);
      setFeedback(newFeedback);
      setLetters(letters.filter((l) => l !== dragged));
      // Check of woord af is
      if (newSlots.join("") === phonemes.join("")) {
        setShowCongrats(true);
        setTimeout(() => {
          setScore((s) => s + 1);
          setShowCongrats(false);
          nextWord();
        }, 1400);
      }
    } else {
      newFeedback[idx] = "wrong";
      setFeedback(newFeedback);
      setTimeout(() => {
        const reset = [...feedback];
        reset[idx] = "none";
        setFeedback(reset);
      }, 700);
    }
    setDragged(null);
  }

  function nextWord() {
    const next = gameData[Math.floor(Math.random() * gameData.length)];
    const nextPhonemes = getPhonemeBlocks(next.word, next.sound);
    setCurrent(next);
    setPhonemes(nextPhonemes);
    setSlots(Array(nextPhonemes.length).fill(null));
    setFeedback(Array(nextPhonemes.length).fill("none"));
    setLetters(getLetterOptions(next.word, next.sound));
    setShowTip(false);
  }

  return (
    <div className="game-container">
      <h1>Yasmine Spel: Maak het woord!</h1>
      <p className="score">Score: {score}</p>
      {showCongrats && <div className="congrats-anim">Goed zo! 🎉</div>}
      <div className="sound-row">
        <button
          className="sound-btn"
          aria-label={`Luister naar ${current.word}`}
          onClick={() => speakWord(current.word)}
        >
          🔊
        </button>
        <button className="tip-btn" onClick={() => setShowTip((t) => !t)}>
          Tip
        </button>
      </div>
      {showTip && <div className="tip-spelling">{current.sound}</div>}
      <div className="slots-row">
        {slots.map((letter, idx) => (
          <div
            key={idx}
            className={`slot ${feedback[idx]}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
          >
            {letter}
          </div>
        ))}
      </div>
      <div className="letters-row">
        {letters.map((l, i) => (
          <div
            key={l + i}
            className="draggable-letter"
            draggable
            onDragStart={() => setDragged(l)}
            onDragEnd={() => setDragged(null)}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
