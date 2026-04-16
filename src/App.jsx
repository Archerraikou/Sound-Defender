import { useRef } from "react";
import "./App.css";
import { useRhythmGame } from "./hooks/useRhythmGame";
import GameOverlay from "./components/GameOverlay";
import EnemyHealthBars from "./components/EnemyHealthBars";

function App() {
  const mountRef = useRef(null);
  const ringRef = useRef(null);

  const { enemyBars, playerHp, combo, score, flash, judgement } = useRhythmGame(
    mountRef,
    ringRef,
  );

  return (
    <div className={`rhythm-app ${flash ? `flash-${flash}` : ""}`}>
      <div className="game-shell">
        <div ref={mountRef} className="three-mount" />

        <EnemyHealthBars enemyBars={enemyBars} />

        <GameOverlay
          score={score}
          combo={combo}
          playerHp={playerHp}
          judgement={judgement}
          ringRef={ringRef}
        />
      </div>
    </div>
  );
}

export default App;
