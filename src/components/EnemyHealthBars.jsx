export default function EnemyHealthBars({ enemyBars }) {
  return (
    <div className="enemy-ui-layer">
      {enemyBars.map((bar) => (
        <div
          key={bar.id}
          className="enemy-world-hp"
          style={{
            left: `${bar.x}px`,
            top: `${bar.y}px`,
            opacity: bar.visible ? 1 : 0,
          }}
        >
          <div className="enemy-world-hp-track">
            <div
              className="enemy-world-hp-fill"
              style={{
                width: `${bar.hpRatio * 100}%`,
                background: `#${bar.color.toString(16).padStart(6, "0")}`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
