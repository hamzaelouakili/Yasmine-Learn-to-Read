import { useState } from "react";
import "./App.css";
import yasmineHappy from "./assets/yasmine_happy.png";

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

// Helper: geef een array met alle klankblokken, ook dubbele, bv. 'pop' => ['p','o','p']
function getPhonemeBlocksAll(word: string, sound: string) {
  const blocks = sound.split("-");
  if (blocks.join("") === word) return blocks;
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
  const [tipHighlight, setTipHighlight] = useState(-1);
  // Toon alle klankblokken (ook dubbele) als losse drag letters
  function getLetterOptionsAll(word: string, sound: string) {
    return shuffle(getPhonemeBlocksAll(word, sound));
  }
  const [letters, setLetters] = useState(() =>
    getLetterOptionsAll(current.word, current.sound)
  );

  function pickDutchVoice(voices: SpeechSynthesisVoice[]) {
    // Kies eerst een Hollandse stem (nl-NL), bij voorkeur een vrouwenstem
    return (
      voices.find(
        (v) =>
          v.lang.toLowerCase() === "nl-nl" &&
          v.name.toLowerCase().includes("vrouw")
      ) ||
      voices.find(
        (v) =>
          v.lang.toLowerCase() === "nl-nl" &&
          v.name.toLowerCase().includes("female")
      ) ||
      voices.find((v) => v.lang.toLowerCase() === "nl-nl") ||
      voices.find((v) => v.lang.toLowerCase().startsWith("nl")) ||
      null
    );
  }

  function speakPhoneme(phoneme: string) {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel(); // Direct stoppen voor snelle start
      const utter = new window.SpeechSynthesisUtterance(phoneme);
      const voices = window.speechSynthesis.getVoices();
      utter.voice = pickDutchVoice(voices);
      utter.lang = utter.voice?.lang || "nl-NL";
      utter.rate = 0.8;
      utter.onend = resolve;
      window.speechSynthesis.speak(utter);
    });
  }

  function speakWord(word: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Direct stoppen voor snelle start
      const utter = new window.SpeechSynthesisUtterance(word);
      const voices = window.speechSynthesis.getVoices();
      utter.voice = pickDutchVoice(voices);
      utter.lang = utter.voice?.lang || "nl-NL";
      utter.rate = 0.8;
      window.speechSynthesis.speak(utter);
    }
  }

  function playCelebrationSound() {
    const audio = new Audio(
      "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3"
    );
    audio.volume = 0.5;
    audio.play();
  }

  function handleDrop(idx: number) {
    if (dragged == null) return;
    const correctPhoneme = phonemes[idx];
    const newSlots = [...slots];
    const newFeedback = [...feedback];
    if (dragged === correctPhoneme && !slots[idx]) {
      newSlots[idx] = dragged;
      newFeedback[idx] = "correct";
      setSlots(newSlots);
      setFeedback(newFeedback);
      // Verwijder alleen de eerste niet-gebruikte letter uit letters
      const dragIdx = letters.findIndex((l) => l === dragged);
      setLetters(letters.filter((_, i) => i !== dragIdx));
      // Check of woord af is
      if (newSlots.join("") === phonemes.join("")) {
        playCelebrationSound();
        // Eerst uitspraak + highlight, dan pas goed zo afbeelding
        (async () => {
          for (let i = 0; i < phonemes.length; i++) {
            setTipHighlight(i);
            await speakPhoneme(phonemes[i]);
          }
          setTipHighlight(-1);
          // Repeat the whole word
          await speakPhoneme(current.word);
          setShowCongrats(true);
          setTimeout(() => {
            setScore((s) => s + 1);
            setShowCongrats(false);
            nextWord();
          }, 900);
        })();
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
    setLetters(getLetterOptionsAll(next.word, next.sound));
    setShowTip(false);
  }

  // Track if tip is currently playing
  const [tipPlaying, setTipPlaying] = useState(false);

  // Tip: highlight and pronounce each klankblok (phoneme) in order
  async function handleTip() {
    if (tipPlaying) return; // Prevent double play
    setShowTip(true);
    setTipPlaying(true);
    for (let i = 0; i < phonemes.length; i++) {
      setTipHighlight(i);
      await speakPhoneme(phonemes[i]);
    }
    setTipHighlight(-1);
    setTipPlaying(false);
  }

  return (
    <div className="game-container">
      <h1>Yasmine Spel: Maak het woord!</h1>
      <p className="score">Score: {score}</p>
      {showCongrats && (
        <div className="congrats-anim">
          <img src={yasmineHappy} alt="Goed zo!" className="congrats-img" />
        </div>
      )}
      <div className="sound-row">
        <button
          className="sound-btn"
          aria-label={`Luister naar ${current.word}`}
          onClick={() => speakWord(current.word)}
        >
          🔊
        </button>
        {!showTip && (
          <button className="tip-btn" onClick={handleTip} disabled={tipPlaying}>
            Tip
          </button>
        )}
        {showTip && (
          <>
            <button
              className="tip-btn"
              onClick={handleTip}
              disabled={tipPlaying}
            >
              Herhaal tip
            </button>
            <button
              className="tip-btn"
              onClick={() => {
                setShowTip(false);
                setTipHighlight(-1);
              }}
              disabled={tipPlaying}
            >
              Verberg tip
            </button>
          </>
        )}
      </div>
      {showTip && (
        <div className="tip-spelling-row">
          {phonemes.map((ph, idx) => (
            <span
              key={idx}
              className={`tip-spelling-block${
                tipHighlight === idx ? " tip-highlight" : ""
              }`}
            >
              {ph}
            </span>
          ))}
        </div>
      )}
      <div className="slots-row">
        {slots.map((letter, idx) => (
          <div
            key={idx}
            className={`slot ${feedback[idx]}${
              tipHighlight === idx ? " tip-highlight" : ""
            }`}
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
            onDragStart={() => {
              setDragged(l);
              speakPhoneme(l);
            }}
            onClick={() => speakPhoneme(l)}
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
