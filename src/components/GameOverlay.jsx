import { PLAYER_MAX_HP } from "../config/gameConfig.js";

export default function GameOverlay({
  score,
  combo,
  playerHp,
  judgement,
  ringRef,
}) {
  return (
    <div className="overlay">
      <div className="scoreboard overlay-scoreboard">
        <span>Score: {score}</span>
        <span>Combo: {combo}</span>
      </div>

      <div className="center-ui">
        <div className="target-ring fixed" />
        <div ref={ringRef} className="target-ring shrinking central" />
        <div className="keycap">SPACE</div>
      </div>

      {judgement.visible && (
        <div
          key={judgement.id}
          className={`judgement judgement-${judgement.type}`}
        >
          {judgement.text}
        </div>
      )}

      <div className="player-hud">
        <div className="player-hp-label">Player HP</div>
        <div className="player-hp-track">
          <div
            className="player-hp-fill"
            style={{ width: `${(playerHp / PLAYER_MAX_HP) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
