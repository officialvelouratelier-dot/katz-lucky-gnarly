// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

/* ================= THEME ================= */
const T = {
  ink: "#0a0c0a",
  panel: "#0e110e",
  edge: "#2aff2a",
  text: "#e9ffe9",
  sub: "#a9f3b3",
  pink: "#ff9ed1",
  glow: "0 0 10px #2aff2a, 0 0 20px #2aff2a66",
};
/* ======================================== */

/* ========= ASSETS (served from /public) ========= */
const MACHINE = "/gachapon-machine.png";
const GROUP_IMG = "/katz-group-photo.jpg";
const KATZ_LOGO = "/katz-logo.png";

/* ======== SIMPLE POOL (swap/extend as you like) ======== */
type Card = { id: string; member: string; rarity: "Common"|"Uncommon"|"Rare"|"Legendary"; url: string };
const POOL: Card[] = [
  { id:"mephi-c", member:"MEPHI", rarity:"Common", url:"/mephi-common.png" },
  { id:"honey-c", member:"HONEY", rarity:"Common", url:"/honey-common.png" },
  { id:"andrea-c", member:"ANDREA", rarity:"Common", url:"/andrea-common.png" },
  { id:"val-c", member:"VAL", rarity:"Common", url:"/val-common.png" },
  { id:"yori-c", member:"YORI", rarity:"Common", url:"/yori-common.png" },
  { id:"rubi-c", member:"RUBI", rarity:"Common", url:"/rubi-common.png" },

  { id:"mephi-u", member:"MEPHI", rarity:"Uncommon", url:"/mephi-uncommon.png" },
  { id:"honey-u", member:"HONEY", rarity:"Uncommon", url:"/honey-uncommon.png" },
  { id:"andrea-u", member:"ANDREA", rarity:"Uncommon", url:"/andrea-uncommon.png" },
  { id:"val-u", member:"VAL", rarity:"Uncommon", url:"/val-uncommon.png" },
  { id:"yori-u", member:"YORI", rarity:"Uncommon", url:"/yori-uncommon.png" },
  { id:"rubi-u", member:"RUBI", rarity:"Uncommon", url:"/rubi-uncommon.png" },

  { id:"mephi-r", member:"MEPHI", rarity:"Rare", url:"/mephi-rare.jpg" },
  { id:"honey-r", member:"HONEY", rarity:"Rare", url:"/honey-rare.jpg" },
  { id:"andrea-r", member:"ANDREA", rarity:"Rare", url:"/andrea-rare.jpg" },
  { id:"val-r", member:"VAL", rarity:"Rare", url:"/val-rare.jpg" },
  { id:"yori-r", member:"YORI", rarity:"Rare", url:"/yori-rare.jpg" },
  { id:"rubi-r", member:"RUBI", rarity:"Rare", url:"/rubi-rare.jpg" },

  { id:"mephi-l", member:"MEPHI", rarity:"Legendary", url:"/mephi-legendary.png" },
  { id:"honey-l", member:"HONEY", rarity:"Legendary", url:"/honey-legendary.png" },
  { id:"andrea-l", member:"ANDREA", rarity:"Legendary", url:"/andrea-legendary.png" },
  { id:"val-l", member:"VAL", rarity:"Legendary", url:"/val-legendary.png" },
  { id:"yori-l", member:"YORI", rarity:"Legendary", url:"/yori-legendary.png" },
  { id:"rubi-l", member:"RUBI", rarity:"Legendary", url:"/rubi-legendary.png" },
];

/* ======== AUDIO (tiny, no external files) ======== */
function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => () => ctxRef.current?.close?.(), []);
  const ctx = () =>
    (ctxRef.current ??=
      new (window.AudioContext || (window as any).webkitAudioContext)());

  const tone = (f=440, d=.15, type:OscillatorType="sine", gain=.06) => {
    const c = ctx(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.value = gain;
    o.connect(g).connect(c.destination);
    const t = c.currentTime;
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.stop(t + d);
  };

  const whoosh = (d=.25) => {
    const c = ctx();
    const b = c.createBuffer(1, c.sampleRate * d, c.sampleRate);
    const ch = b.getChannelData(0);
    for (let i=0;i<ch.length;i++) ch[i] = Math.random()*2-1;
    const src = c.createBufferSource(); src.buffer = b;
    const f = c.createBiquadFilter(); f.type="lowpass"; f.frequency.value=1600;
    const g = c.createGain(); g.gain.value=.18;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  };

  return {
    lever: ()=>whoosh(.28),
    reveal: ()=>tone(880,.25,"triangle",.09),
  };
}

/* ======== HELPERS ======== */
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random()*arr.length)];

/* ===================== APP ===================== */
export default function App() {
  const [card, setCard] = useState<Card | null>(null);
  const [imgKey, setImgKey] = useState(0);       // force <img> remount when URL changes
  const [pullsLeft, setPullsLeft] = useState(5); // refresh resets
  const [leverDown, setLeverDown] = useState(false);
  const audio = useAudio();

  /* SPARKLES */
  const burst = () => {
    const n = 24;
    for (let i=0;i<n;i++) {
      const p = document.createElement("div");
      p.className = "spark";
      const ang = (i / n) * Math.PI*2;
      const dist = 120 + Math.random()*60;
      p.style.setProperty("--dx", `${Math.cos(ang)*dist}px`);
      p.style.setProperty("--dy", `${Math.sin(ang)*dist}px`);
      document.body.appendChild(p);
      setTimeout(()=>p.remove(), 900);
    }
  };

  const pull = async () => {
    if (pullsLeft <= 0) return;
    setLeverDown(true);
    audio.lever();
    await new Promise(r => setTimeout(r, 280));

    const c = pick(POOL);
    setCard(c);
    setImgKey(Date.now());
    audio.reveal();
    setPullsLeft(x => x-1);
    burst();

    setTimeout(()=>setLeverDown(false), 260);
  };

  const savePhoto = () => {
    if (!card) return;
    const a = document.createElement("a");
    a.href = card.url;
    a.download = `${card.member}-${card.rarity}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={S.page}>
      {/* Top bar */}
      <header style={S.header}>
        <img src={KATZ_LOGO} alt="KATZ" style={S.logoTop}/>
        <div style={S.tagline}>Everything’s <b>gnarly</b>.</div>
      </header>

      {/* 9:16 rail */}
      <div style={S.rail}>
        {/* cabinet */}
        <img src={MACHINE} alt="" style={S.machine} />

        {/* lit frame glow */}
        <div style={S.frameGlow} />

        {/* window keeps GROUP always, card overlays */}
        <div style={S.window}>
          <img src={GROUP_IMG} alt="Group" style={S.group} />
          <div
            style={{
              ...S.cardSlide,
              transform: card ? "translate(-50%, 0)" : "translate(-50%, 115%)",
            }}
          >
            {card && (
              <>
                <img key={imgKey} src={card.url} alt={card.id} style={S.pcBig}/>
                <div style={S.metaRow}>
                  <b>{card.member}</b>
                  <span>{card.rarity}</span>
                </div>
                <div style={{padding:"0 10px 10px"}}>
                  <button style={S.secondary} onClick={savePhoto}>Save photo</button>
                </div>
              </>
            )}
          </div>

          {/* slot bar for polish */}
          <div style={S.slotBar}/>
        </div>

        {/* lever (circle + stick) */}
        <div
          role="button"
          aria-label="lever"
          title={pullsLeft>0 ? "Pull" : "No pulls left"}
          onClick={pull}
          style={{
            ...S.leverStickWrap,
            transform: leverDown ? "translateX(-50%) rotate(90deg)" : "translateX(-50%) rotate(0deg)",
            opacity: pullsLeft>0 ? 1 : .5,
            cursor: pullsLeft>0 ? "pointer" : "not-allowed",
          }}
        >
          <div style={S.leverStick}/>
          <div style={S.leverKnob}/>
        </div>
      </div>

      <footer style={S.footer}>{pullsLeft} pull{pullsLeft===1?"":"s"} left</footer>

      {/* sparkles + keyframes */}
      <style>{CSS}</style>
    </div>
  );
}

/* ===================== STYLES ===================== */
const S: Record<string, React.CSSProperties> = {
  page:{
    background:T.ink, color:T.text, minHeight:"100vh",
    display:"flex", flexDirection:"column", alignItems:"center",
  },

  header:{ width:"min(100%, 1080px)", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px 6px 12px" },
  logoTop:{ height:36, objectFit:"contain", filter:"drop-shadow(0 0 6px #00ff80aa)" },
  tagline:{ fontSize:14, color:T.sub },

  /* strict 9:16 area (scales with screen, max width 1080) */
  rail:{
    position:"relative",
    width:"min(100%, 1080px)",
    aspectRatio:"9/16",
    border:`2px solid ${T.edge}`,
    borderRadius:22,
    boxShadow:T.glow,
    overflow:"hidden",
    background:T.panel,
  },

  machine:{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" },

  frameGlow:{
    position:"absolute", left:"5%", right:"5%", top:"9.5%", bottom:"28%",
    borderRadius:18, boxShadow:T.glow, pointerEvents:"none"
  },

  window:{
    position:"absolute", left:"6.5%", right:"6.5%", top:"11%", bottom:"30%",
    border:`2px solid ${T.edge}`, borderRadius:16, overflow:"hidden",
    background:"#0b0f0b",
  },
  group:{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.96)" },

  /* slot bar polish */
  slotBar:{
    position:"absolute", left:"8%", right:"8%", bottom:"8%",
    height:14, borderRadius:10, border:`2px solid ${T.edge}`,
    background:"linear-gradient(#0b0f0b, #060807)", boxShadow:"inset 0 6px 12px rgba(0,0,0,.6)"
  },

  /* card overlay that slides up */
  cardSlide:{
    position:"absolute", left:"50%", bottom:"12%",
    width:"min(68%, 520px)",
    borderRadius:14, border:`1px solid ${T.edge}`,
    background:"#131a14", transition:"transform 320ms cubic-bezier(.2,.9,.2,1.1)",
    boxShadow:"0 14px 22px rgba(0,0,0,.45)"
  },
  pcBig:{ width:"100%", height:"min(64vh, 56vw)", objectFit:"cover",
    borderTopLeftRadius:14, borderTopRightRadius:14, display:"block" },
  metaRow:{ display:"flex", justifyContent:"space-between", padding:"8px 10px", fontSize:13, color:T.sub },

  /* lever positioned under window, perfectly centered */
  leverStickWrap:{
    position:"absolute", bottom:"7.5%", left:"50%",
    transform:"translateX(-50%)",
    transition:"transform 240ms cubic-bezier(.2,.9,.2,1.2)",
  },
  /* stick is centered anchor for rotation so it stays aligned */
  leverStick:{
    width:64, height:12, borderRadius:10, background:"#1a231a",
    border:`2px solid ${T.edge}`, boxShadow:T.glow
  },
  leverKnob:{
    position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)",
    width:38, height:38, borderRadius:999, background:T.pink,
    boxShadow:"0 0 12px #ff66dd, inset 0 -6px 10px rgba(0,0,0,.35)"
  },

  secondary:{ background:"transparent", color:T.text, border:`2px solid ${T.edge}`, borderRadius:10, padding:"8px 12px", fontWeight:700, cursor:"pointer" },

  footer:{ width:"min(100%,1080px)", textAlign:"center", color:T.sub, fontSize:14, padding:"10px 0 18px" },
};

/* ============== EXTRA CSS (sparkles/keyframes) ============== */
const CSS = `
.spark{
  position: fixed;
  left: 50%; top: 58%;
  width: 6px; height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #7dffa6, 0 0 16px #7dffa688;
  transform: translate(-50%,-50%);
  animation: fly .9s ease-out forwards;
  pointer-events: none;
}
@keyframes fly{
  0%   { opacity: 1; transform: translate(-50%,-50%) scale(0.7); }
  80%  { opacity: .8; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.6); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.9); }
}
`;
