import { useState } from "react";
import { useStore, fmt } from "../../store/useStore";
import { getLevelInfo } from "../../game/levels";

export default function HomeScreen() {
  const {
    user,
    energyStatus,
    adStatus,
    levelRecords,
    startLevel,
    watchAd,
    setScreen,
    notify,
  } = useStore();
  const [starting, setStarting] = useState(false);

  if (!user) return null;

  const level = user.current_level || 1;
  const info = getLevelInfo(level);
  const record = levelRecords[level];
  const canPlay = energyStatus.current >= 1;
  const canWatchAd = adStatus.watched < adStatus.adsMax;

  const handlePlay = async () => {
    if (starting) return;
    setStarting(true);
    const ok = await startLevel(level);
    if (!ok) setStarting(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60),
      sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div
      style={{
        padding: "16px 16px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Profile card */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f0f35, #1a1a50)",
          border: "1px solid rgba(79,143,247,0.3)",
          borderRadius: 20,
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#e2e8ff" }}>
            {user.first_name || user.username || "Player"}
          </div>
          <div style={{ fontSize: 12, color: "#4f8ff7", marginTop: 2 }}>
            🏆 Max Level: {user.max_level_reached || 1}
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
            💥 {(user.total_balls_destroyed || 0).toLocaleString()} balls
            destroyed
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: 18 }}>
            🪙 {fmt(user.coins)}
          </div>
          <div
            style={{
              color: "#a855f7",
              fontWeight: 700,
              fontSize: 14,
              marginTop: 2,
            }}
          >
            💎 {user.gems}
          </div>
        </div>
      </div>

      {/* Current level */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(79,143,247,0.15), rgba(8,8,32,0.8))`,
          border: `2px solid ${info.tierColor}44`,
          borderRadius: 20,
          padding: "20px 16px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: info.tierColor + "25",
            border: `1px solid ${info.tierColor}55`,
            color: info.tierColor,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            letterSpacing: 1,
          }}
        >
          {info.tierName.toUpperCase()}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#555",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          CURRENT LEVEL
        </div>
        <div
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {level}
        </div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>of 500</div>

        {record && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginTop: 10,
            }}
          >
            <span style={{ fontSize: 11, color: "#fbbf24" }}>
              {"⭐".repeat(record.stars)}
              {"☆".repeat(3 - record.stars)}
            </span>
            {record.best_time_seconds && (
              <span style={{ fontSize: 11, color: "#4f8ff7" }}>
                ⏱ {formatTime(Math.floor(record.best_time_seconds))}
              </span>
            )}
          </div>
        )}

        {/* Play button */}
        <button
          onClick={handlePlay}
          disabled={!canPlay || starting}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 900,
            fontSize: 18,
            cursor: canPlay ? "pointer" : "not-allowed",
            background: canPlay
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "rgba(40,40,60,0.5)",
            color: canPlay ? "#fff" : "#444",
            boxShadow: canPlay ? "0 4px 20px rgba(59,130,246,0.4)" : "none",
            transition: "all 0.2s",
          }}
        >
          {starting ? "⏳ Loading..." : canPlay ? "▶ PLAY" : "⚡ No Energy"}
        </button>
      </div>

      {/* Energy bar */}
      <div
        style={{
          background: "rgba(15,15,40,0.8)",
          border: "1px solid rgba(6,182,212,0.25)",
          borderRadius: 16,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14, color: "#67e8f9" }}>
            ⚡ Energy
          </span>
          <span style={{ fontSize: 13, color: "#67e8f9", fontWeight: 800 }}>
            {energyStatus.current} / {energyStatus.max}
          </span>
        </div>

        {/* Energy dots */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {Array.from({ length: energyStatus.max }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background:
                  i < energyStatus.current
                    ? "linear-gradient(135deg, #06b6d4, #0891b2)"
                    : "rgba(6,182,212,0.1)",
                border: `2px solid ${
                  i < energyStatus.current ? "#06b6d4" : "rgba(6,182,212,0.2)"
                }`,
                boxShadow:
                  i < energyStatus.current
                    ? "0 0 10px rgba(6,182,212,0.4)"
                    : "none",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {energyStatus.current < energyStatus.max &&
          energyStatus.secondsUntilNext > 0 && (
            <div
              style={{
                fontSize: 11,
                color: "#555",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Next energy in {formatTime(energyStatus.secondsUntilNext)}
            </div>
          )}

        <div style={{ display: "flex", gap: 8 }}>
          {/* Watch ad */}
          <button
            onClick={() =>
              canWatchAd
                ? useStore.getState().watchAd()
                : notify("No more ads today", "error")
            }
            style={{
              flex: 1,
              padding: "9px 6px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: canWatchAd
                ? "rgba(6,182,212,0.15)"
                : "rgba(40,40,60,0.5)",
              color: canWatchAd ? "#67e8f9" : "#444",
              fontWeight: 600,
              fontSize: 11,
              border: `1px solid ${
                canWatchAd ? "rgba(6,182,212,0.3)" : "rgba(60,60,80,0.3)"
              }`,
            }}
          >
            📺 Watch Ad ({adStatus.adsMax - adStatus.watched} left)
          </button>
          {/* Buy energy */}
          <button
            onClick={() => setScreen("shop")}
            style={{
              flex: 1,
              padding: "9px 6px",
              borderRadius: 10,
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.3)",
              color: "#c084fc",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            💎 Buy Energy
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          {
            label: "⚔️ Upgrades",
            sub: "Upgrade your gun",
            screen: "upgrades",
            color: "#f97316",
          },
          {
            label: "🛒 Shop",
            sub: "Buy gems & coins",
            screen: "shop",
            color: "#a855f7",
          },
          {
            label: "📋 Quests",
            sub: "Earn free rewards",
            screen: "tasks",
            color: "#22c55e",
          },
          {
            label: "🏆 Ranks",
            sub: "Global leaderboard",
            screen: "leaderboard",
            color: "#fbbf24",
          },
        ].map((item) => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            style={{
              background: "rgba(15,15,40,0.8)",
              border: `1px solid ${item.color}30`,
              borderRadius: 14,
              padding: "14px 12px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8ff" }}>
              {item.label}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              {item.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Login streak */}
      {user.login_streak > 0 && (
        <div
          style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🔥</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24" }}>
              {user.login_streak} Day Streak!
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>
              Come back tomorrow for more rewards
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
