// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

/* ---------- Theme ---------- */
const T = {
  ink: "#0a0c0a",
  panel: "#0e110e",
  edge: "#1e241f",
  text: "#e9ffe9",
  sub: "#a9f3b3",
  neon: "#2dfb7c",
  neonDim: "rgba(45,251,124,.25)",
  pink: "#ff9ed1",
};

/* ---------- Global keyframes ---------- */
const CSS = `
@keyframes neonPulse{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
@keyframes leverPull{0%{transform:rotate(0)}100%{transform:rotate(85deg)}}
@keyframes cardIn{from{transform:translate(-50%,110%)}to{transform:translate(-50%,0)}}
`;
function Global(){ useEffect(()=>{ const s=document.createElement("style"); s.innerHTML=CSS; document.head.appendChild(s); return ()=>s.remove(); },[]); return null; }

/* ---------- Smart <Img> with extension fallbacks + live updates ---------- */
function Img(props: React.ImgHTMLAttributes<HTMLImageElement> & {src:string}) {
  const [src,setSrc] = useState(props.src);
  const tried = useRef<Set<string>>(new Set());
  useEffect(()=>{ setSrc(props.src); tried.current.clear(); },[props.src]);
  const onErr = ()=> {
    const exts = [".png",".jpg",".jpeg",".webp"];
    const cur = exts.findIndex(e=>src.toLowerCase().endsWith(e));
    const order = cur>=0 ? [...exts.slice(cur+1),...exts.slice(0,cur)] : exts;
    for(const ext of order){
      const next = src.replace(/\.[a-z0-9]+$/i, ext);
      if(!tried.current.has(next)){ tried.current.add(next); setSrc(next); return; }
    }
  };
  return <img {...props} src={src} onError={onErr} />;
}

/* ---------- Assets in /public ---------- */
const LOGO = "/katz-logo.png";
const GROUP = "/katz-group-photo.jpg";

/* ---------- Types & Pool ---------- */
type Rarity = "Common"|"Uncommon"|"Rare"|"Legendary";
type Card = { id:string; member:string; rarity:Rarity; name:string; url:string };

const POOL: Record<Rarity, Card[]> = {
  Common: [
    { id:"mephi-c", member:"MEPHI", rarity:"Common", name:"MEPHI Common", url:"/mephi-common.png" },
    { id:"honey-c", member:"HONEY", rarity:"Common", name:"HONEY Common", url:"/honey-common.png" },
    { id:"andrea-c", member:"ANDREA", rarity:"Common", name:"ANDREA Common", url:"/andrea-common.png" },
    { id:"val-c", member:"VAL", rarity:"Common", name:"VAL Common", url:"/val-common.png" },
    { id:"yori-c", member:"YORI", rarity:"Common", name:"YORI Common", url:"/yori-common.png" },
    { id:"rubi-c", member:"RUBI", rarity:"Common", name:"RUBI Common", url:"/rubi-common.png" },
  ],
  Uncommon: [
    { id:"mephi-u", member:"MEPHI", rarity:"Uncommon", name:"MEPHI Uncommon", url:"/mephi-uncommon.png" },
    { id:"honey-u", member:"HONEY", rarity:"Uncommon", name:"HONEY Uncommon", url:"/honey-uncommon.png" },
    { id:"andrea-u", member:"ANDREA", rarity:"Uncommon", name:"ANDREA Uncommon", url:"/andrea-uncommon.png" },
    { id:"val-u", member:"VAL", rarity:"Uncommon", name:"VAL Uncommon", url:"/val-uncommon.png" },
    { id:"yori-u", member:"YORI", rarity:"Uncommon", name:"YORI Uncommon", url:"/yori-uncommon.png" },
    { id:"rubi-u", member:"RUBI", rarity:"Uncommon", name:"RUBI Uncommon", url:"/rubi-uncommon.png" },
  ],
  Rare: [
    { id:"mephi-r", member:"MEPHI", rarity:"Rare", name:"MEPHI Rare", url:"/mephi-rare.png" },
    { id:"honey-r", member:"HONEY", rarity:"Rare", name:"HONEY Rare", url:"/honey-rare.jpg" },
    { id:"andrea-r", member:"ANDREA", rarity:"Rare", name:"ANDREA Rare", url:"/andrea-rare.jpg" },
    { id:"val-r", member:"VAL", rarity:"Rare", name:"VAL Rare", url:"/val-rare.jpg" },
    { id:"yori-r", member:"YORI", rarity:"Rare", name:"YORI Rare", url:"/yori-rare.jpg" },
    { id:"rubi-r", member:"RUBI", rarity:"Rare", name:"RUBI Rare", url:"/rubi-rare.jpg" },
  ],
  Legendary: [
    { id:"mephi-l", member:"MEPHI", rarity:"Legendary", name:"MEPHI Legendary", url:"/mephi-legendary.png" },
    { id:"honey-l", member:"HONEY", rarity:"Legendary", name:"HONEY Legendary", url:"/honey-legendary.png" },
    { id:"andrea-l", member:"ANDREA", rarity:"Legendary", name:"ANDREA Legendary", url:"/andrea-legendary.png" },
    { id:"val-l", member:"VAL", rarity:"Legendary", name:"VAL Legendary", url:"/val-legendary.png" },
    { id:"yori-l", member:"YORI", rarity:"Legendary", name:"YORI Legendary", url:"/yori-legendary.png" },
    { id:"rubi-l", member:"RUBI", rarity:"Legendary", name:"RUBI Legendary", url:"/rubi-legendary.png" },
  ],
};

const RATES: Record<Rarity, number> = { Common:.25, Uncommon:.15, Rare:.10, Legendary:.50 };
const pick = <T,>(arr:T[])=>arr[Math.floor(Math.random()*arr.length)];
function rollRarity(): Rarity {
  const r = Math.random(); let acc=0;
  for (const [k,v] of Object.entries(RATES)) { acc += v as number; if (r <= acc) return k as Rarity; }
  return "Common";
}

/* ---------- Simple SFX ---------- */
function useSfx(){
  const ref=useRef<AudioContext|null>(null);
  useEffect(()=>()=>ref.current?.close?.(),[]);
  const ctx = ()=> (ref.current ??= new (window.AudioContext||(window as any).webkitAudioContext)());
  const blip=(f=520,d=.08,t:OscillatorType="sine",g=.06)=>{const c=ctx(),o=c.createOscillator(),g1=c.createGain();o.type=t;o.frequency.value=f;g1.gain.value=g;o.connect(g1).connect(c.destination);const at=c.currentTime;o.start(at);o.stop(at+d);}
  const whoosh=()=>{const c=ctx();const b=c.createBuffer(1,c.sampleRate*.22,c.sampleRate);const ch=b.getChannelData(0);for(let i=0;i<ch.length;i++) ch[i]=Math.random()*2-1;const s=c.createBufferSource();const g=c.createGain();g.gain.value=.18;s.buffer=b;s.connect(g).connect(c.destination);s.start();}
  const ping=(r:Rarity)=> r==="Legendary"? blip(1000,.18,"square",.08) : r==="Rare"? blip(800,.12,"sawtooth",.07) : r==="Uncommon"? blip(620,.1,"sine",.06) : blip(500,.08,"sine",.05);
  return { whoosh, ping };
}

/* ---------- App ---------- */
const DESIGN_W = 1080, DESIGN_H = 1920;
const PULLS_PER_REFRESH = 5;

export default function App(){
  Global();

  // scale 1080x1920 to viewport height
  const [vh,setVh] = useState(()=>window.innerHeight);
  useEffect(()=>{ const on=()=>setVh(window.innerHeight); window.addEventListener("resize",on); return()=>window.removeEventListener("resize",on);},[]);
  const scale = Math.min(1, vh / DESIGN_H);

  const sfx = useSfx();
  const [pullsLeft, setPullsLeft] = useState(PULLS_PER_REFRESH); // resets on refresh
  const [lever, setLever] = useState(false);
  const [card, setCard] = useState<Card|null>(null);
  const [imgKey, setImgKey] = useState(0);

  const pull = async () => {
    if (pullsLeft <= 0 || lever) return;
    setLever(true); sfx.whoosh();
    await new Promise(r=>setTimeout(r,240));

    const rarity = rollRarity();
    const c = pick(POOL[rarity]); // name + correct image always together
    setCard(c); setImgKey(Date.now()); sfx.ping(rarity);

    setPullsLeft(n=>n-1);
    setTimeout(()=>setLever(false), 260);
  };

  const savePhoto = ()=>{
    if (!card) return;
    const a = document.createElement("a");
    a.href = card.url;
    a.download = `${card.member}-${card.rarity}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div style={S.page}>
      <div style={{ width:DESIGN_W, height:DESIGN_H, transform:`scale(${scale})`, transformOrigin:"top center", position:"relative" }}>
        {/* Frame glow */}
        <div style={S.frameGlow}/>

        {/* Header */}
        <header style={S.header}>
          <Img src={LOGO} alt="KATZ" style={S.logo}/>
          <div style={S.tagline}>Everything’s <b>gnarly</b>.</div>
        </header>

        {/* Machine window */}
        <div style={S.window}>
          <Img src={GROUP} alt="Group" style={S.group}/>
          <div style={S.windowBorder}/>
          <div
            style={{
              ...S.cardSlide,
              transform: card ? "translate(-50%,0)" : "translate(-50%,110%)",
              animation: card ? "cardIn 300ms cubic-bezier(.2,.9,.2,1.1)" : undefined
            }}
          >
            {card && (
              <>
                <Img key={imgKey} src={card.url} alt={card.name} style={S.pcBig}/>
                <div style={S.meta}><b>{card.member}</b><span>{card.rarity}</span></div>
                <div style={{padding:"0 16px 14px"}}>
                  <button style={S.secondary} onClick={savePhoto}>Save photo</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lever-only control */}
        <div style={S.leverWrap} onClick={pull} title={pullsLeft>0 ? "Pull" : "No pulls left"}>
          <div style={S.leverBase}/>
          <div style={{
            ...S.leverStick,
            animation: lever ? "leverPull 240ms forwards" : undefined
          }}/>
          <div style={S.leverKnob}/>
        </div>

        {/* Footer pulls left */}
        <div style={S.footer}>{pullsLeft} pull{pullsLeft===1?"":"s"} left</div>
      </div>
    </div>
  );
}

/* ---------- Styles (measured to 1080×1920) ---------- */
const neonOutline = `0 0 0 2px ${T.neon}, 0 0 22px ${T.neon}, inset 0 0 18px ${T.neonDim}`;
const S: Record<string, React.CSSProperties> = {
  page:{ background:T.ink, color:T.text, minHeight:"100vh", display:"flex", justifyContent:"center" },

  frameGlow:{ position:"absolute", left:24, right:24, top:24, bottom:24, borderRadius:28, boxShadow:neonOutline, border:`2px solid ${T.neon}`, animation:"neonPulse 2.6s ease-in-out infinite", opacity:.8 },

  header:{ position:"absolute", left:60, right:60, top:54, height:68, display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo:{ height:50, filter:"drop-shadow(0 0 14px "+T.neonDim+")" },
  tagline:{ fontSize:26, color:T.text, opacity:.95 },

  // Window area (adjust these in small steps if you want it higher/lower)
  window:{ position:"absolute", left:100, right:100, top:180, bottom:560, borderRadius:22, overflow:"hidden", background:T.panel },
  group:{ width:"100%", height:"100%", objectFit:"cover" },
  windowBorder:{ position:"absolute", inset:0, borderRadius:22, boxShadow:neonOutline, border:`2px solid ${T.neon}`, pointerEvents:"none", opacity:.6 },

  cardSlide:{
    position:"absolute", left:"50%", bottom:14, width:360,
    transform:"translate(-50%,110%)",
    borderRadius:16, border:`2px solid ${T.neon}`,
    background:"#111611", boxShadow:`0 12px 24px rgba(0,0,0,.5), 0 0 20px ${T.neonDim}`
  },
  pcBig:{ width:"100%", height:440, objectFit:"cover", borderTopLeftRadius:14, borderTopRightRadius:14 },
  meta:{ display:"flex", justifyContent:"space-between", padding:"8px 12px", fontSize:18, color:T.sub },

  // Lever composed from shapes (tap anywhere on this block)
  leverWrap:{ position:"absolute", left:430, right:430, bottom:360, top:1480, cursor:"pointer" },
  leverBase:{ position:"absolute", left:"50%", bottom:40, width:200, height:18, transform:"translateX(-50%)", borderRadius:10, background:"#0d140f", border:`2px solid ${T.edge}`, boxShadow:"inset 0 6px 12px rgba(0,0,0,.6)" },
  leverStick:{ position:"absolute", left:"50%", top:"45%", width:22, height:120, transform:"translate(-50%, -50%) rotate(0)", background:T.neon, borderRadius:12, boxShadow:`0 0 18px ${T.neonDim}` },
  leverKnob:{ position:"absolute", left:"50%", top:"45%", width:74, height:74, transform:"translate(-50%, -50%)", borderRadius:999, background:T.pink, boxShadow:"0 8px 0 rgba(0,0,0,.28), 0 0 22px rgba(255,158,209,.35)" },

  secondary:{ background:"#0b120c", color:T.text, border:`2px solid ${T.neon}`, borderRadius:12, padding:"10px 14px", fontWeight:700, cursor:"pointer" },

  footer:{ position:"absolute", left:0, right:0, bottom:84, textAlign:"center", fontSize:26, color:T.text },
};
