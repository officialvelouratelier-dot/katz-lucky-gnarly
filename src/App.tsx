// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";

/* Theme */
const T = {
  ink: "#0a0c0a",
  edge: "#2aff2a",
  text: "#e9ffe9",
  sub: "#a9f3b3",
  pink: "#ff9ed1",
};

/* Assets */
const MACHINE = "/gachapon-machine.png";
const SLIME1 = "/slime-1.png";
const SLIME2 = "/slime-2.png";
const GROUP_IMG = "/katz-group-photo.jpg";
const KATZ_LOGO = "/katz-logo.png";

/* Mock Card Pool */
const CARDS = [
  { id: "val-common", member: "VAL", rarity: "Common", url: "/val-common.png" },
  { id: "val-legendary", member: "VAL", rarity: "Legendary", url: "/val-legendary.png" },
];

/* Audio hook */
function useAudio() {
  const ctxRef = useRef(null);
  const ctx = () =>
    (ctxRef.current ??= new (window.AudioContext || window.webkitAudioContext)());

  const tone = (f, d, type = "sine") => {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.value = 0.08;
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + d);
  };

  return {
    lever: () => tone(220, 0.15, "square"),
    reveal: () => tone(880, 0.25, "triangle"),
  };
}

/* Pick a random card */
const pickCard = () => CARDS[Math.floor(Math.random() * CARDS.length)];

export default function App() {
  const [card, setCard] = useState(null);
  const [key, setKey] = useState(0);
  const [pullsLeft, setPullsLeft] = useState(5);
  const [leverDown, setLeverDown] = useState(false);
  const audio = useAudio();

  const pull = async () => {
    if (pullsLeft <= 0) return;
    setLeverDown(true);
    audio.lever();
    await new Promise((r) => setTimeout(r, 300));
    const c = pickCard();
    setCard(c);
    setKey(Date.now());
    audio.reveal();
    setPullsLeft((n) => n - 1);
    setTimeout(() => setLeverDown(false), 300);
    sparkle();
  };

  const savePhoto = () => {
    if (!card) return;
    const a = document.createElement("a");
    a.href = card.url;
    a.download = `${card.member}-${card.rarity}.png`;
    a.click();
  };

  /* Sparkle animation on pull */
  const sparkle = () => {
    const s = document.createElement("div");
    s.className = "sparkle";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  };

  return (
    <div style={S.page}>
      {/* Logo + Phrase */}
      <header style={S.header}>
        <img src={KATZ_LOGO} alt="Katz" style={S.logo} />
        <div style={S.phrase}>Everything’s <b>gnarly</b>.</div>
      </header>

      {/* Machine */}
      <div style={S.machineWrap}>
        <img src={MACHINE} alt="machine" style={S.machine} />
        <img src={SLIME1} alt="slime1" style={S.slime1} />
        <img src={SLIME2} alt="slime2" style={S.slime2} />

        {/* Group photo & card */}
        <div style={S.window}>
          {!card && <img src={GROUP_IMG} alt="group" style={S.group} />}
          {card && (
            <div style={S.cardWrap}>
              <img key={key} src={card.url} alt={card.name} style={S.card} />
              <div style={S.cardMeta}>
                <b>{card.member}</b>
                <span>{card.rarity}</span>
              </div>
              <button style={S.button} onClick={savePhoto}>Save photo</button>
            </div>
          )}
        </div>

        {/* Lever */}
        <div
          onClick={pull}
          style={{
            ...S.leverBox,
            transform: leverDown ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <div style={S.leverKnob} />
        </div>
      </div>

      {/* Footer */}
      <footer style={S.footer}>{pullsLeft} pulls left</footer>

      {/* Sparkle CSS */}
      <style>{`
        .sparkle {
          position: fixed;
          top: 50%; left: 50%;
          width: 20px; height: 20px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px #0f0, 0 0 20px #0f0;
          animation: explode 1s ease-out forwards;
          pointer-events: none;
        }
        @keyframes explode {
          from { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          to { transform: translate(-50%, -200%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* Styles */
const S = {
  page: {
    background: T.ink,
    color: T.text,
    minHeight: "100vh",
    width: "100%",
    maxWidth: "1080px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
  },
  logo: { height: 36 },
  phrase: { fontSize: 14, color: T.sub },
  machineWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "9/16",
    maxWidth: "1080px",
    overflow: "hidden",
  },
  machine: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  slime1: { position: "absolute", top: 0, right: 20, width: 120, opacity: 0.8 },
  slime2: { position: "absolute", bottom: 80, left: 40, width: 140, opacity: 0.8 },
  window: {
    position: "absolute",
    top: "15%", left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    height: "45%",
    borderRadius: 16,
    overflow: "hidden",
    border: `2px solid ${T.edge}`,
  },
  group: { width: "100%", height: "100%", objectFit: "cover" },
  cardWrap: { width: "100%", height: "100%", textAlign: "center" },
  card: { width: "100%", height: "80%", objectFit: "cover" },
  cardMeta: { display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 14 },
  button: { background: T.edge, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" },
  leverBox: {
    position: "absolute",
    bottom: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    height: 60,
    width: 20,
    background: "#181b18",
    borderRadius: 10,
    border: `2px solid ${T.edge}`,
    transition: "transform 0.3s ease",
  },
  leverKnob: {
    position: "absolute",
    bottom: -20,
    left: "50%",
    transform: "translateX(-50%)",
    height: 36,
    width: 36,
    borderRadius: "50%",
    background: T.pink,
    boxShadow: "0 0 12px #f0f",
  },
  footer: { marginTop: 20, fontSize: 14, color: T.sub },
};
