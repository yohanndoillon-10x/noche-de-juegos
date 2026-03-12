import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';

// ===== CONFIG =====
const PARTYKIT_HOST = window.location.hostname === "localhost"
  ? "localhost:1999"
  : "noche-de-juegos.yohanndoillon-10x.partykit.dev";

const GameCtx = createContext(null);
function useGame() { return useContext(GameCtx); }

const CATEGORIES = [
  { id: "apodos", label: "Apodos", icon: "\u{1F495}" },
  { id: "bromas", label: "Bromas", icon: "\u{1F602}" },
  { id: "lugares", label: "Lugares", icon: "\u{1F4CD}" },
  { id: "memorias", label: "Memorias", icon: "\u{1F9E0}" },
  { id: "secretos", label: "Secretos", icon: "\u{1F92B}" },
];

const DEFAULT_WORDS = [
  { word: "beso", category: "default" },
  { word: "abrazo", category: "default" },
  { word: "cena rom\u00e1ntica", category: "default" },
  { word: "pel\u00edcula juntos", category: "default" },
  { word: "bailar", category: "default" },
  { word: "desayuno en cama", category: "default" },
  { word: "paseo por la playa", category: "default" },
  { word: "carta de amor", category: "default" },
  { word: "masaje", category: "default" },
  { word: "estrella fugaz", category: "default" },
  { word: "chocolate caliente", category: "default" },
  { word: "atardecer", category: "default" },
  { word: "picnic", category: "default" },
  { word: "foto juntos", category: "default" },
  { word: "viaje so\u00f1ado", category: "default" },
];

const TRUTHS = {
  mild: [
    "\u00bfCu\u00e1l fue tu primera impresi\u00f3n de m\u00ed?",
    "\u00bfQu\u00e9 es lo que m\u00e1s te gusta de nosotros?",
    "\u00bfCu\u00e1l es tu recuerdo favorito juntos?",
    "\u00bfQu\u00e9 canci\u00f3n te recuerda a m\u00ed?",
    "\u00bfCu\u00e1ndo supiste que te gustaba?",
    "\u00bfQu\u00e9 es lo m\u00e1s tierno que hago sin darme cuenta?",
    "\u00bfQu\u00e9 es lo primero que notaste de m\u00ed?",
    "\u00bfCu\u00e1l es tu momento favorito del d\u00eda conmigo?",
    "Si pudieras revivir un d\u00eda juntos, \u00bfcu\u00e1l ser\u00eda?",
    "\u00bfQu\u00e9 es algo que siempre quisiste decirme?",
  ],
  medium: [
    "\u00bfCu\u00e1l es tu fantas\u00eda de cita perfecta conmigo?",
    "\u00bfQu\u00e9 es lo m\u00e1s atrevido que has pensado sobre nosotros?",
    "\u00bfHay algo que te de verg\u00fcenza admitir que te gusta de m\u00ed?",
    "\u00bfCu\u00e1l fue el momento m\u00e1s intenso entre nosotros?",
    "\u00bfQu\u00e9 es lo que m\u00e1s extra\u00f1as cuando no estamos juntos?",
    "\u00bfQu\u00e9 parte de mi cuerpo es tu favorita?",
    "\u00bfCu\u00e1l es tu forma favorita de que te toquen?",
    "\u00bfAlguna vez so\u00f1aste algo subido de tono conmigo?",
    "\u00bfQu\u00e9 prenda m\u00eda te vuelve loco/a?",
    "\u00bfCu\u00e1l es tu beso favorito de los que nos hemos dado?",
  ],
  spicy: [
    "Describe con detalle tu fantas\u00eda favorita conmigo",
    "\u00bfCu\u00e1l es el lugar m\u00e1s atrevido donde te gustar\u00eda estar conmigo?",
    "\u00bfQu\u00e9 es lo m\u00e1s salvaje que te gustar\u00eda intentar juntos?",
    "\u00bfCu\u00e1l fue el momento m\u00e1s caliente entre nosotros?",
    "Si no hubiera l\u00edmites esta noche, \u00bfqu\u00e9 har\u00edas?",
    "\u00bfQu\u00e9 te excita m\u00e1s de m\u00ed?",
    "Cuenta algo que nunca te atreviste a pedirme",
    "\u00bfCu\u00e1l es tu posici\u00f3n favorita y por qu\u00e9?",
    "\u00bfQu\u00e9 me har\u00edas si estuviera ah\u00ed ahora mismo?",
    "Describe c\u00f3mo ser\u00eda nuestra noche perfecta sin restricciones",
  ],
};

const DARES = {
  mild: [
    "M\u00e1ndame una selfie haciendo tu mejor cara seductora",
    "Canta un pedacito de nuestra canci\u00f3n",
    "Baila sensualmente por 15 segundos",
    "Dime 3 cosas que amas de m\u00ed mirando a la c\u00e1mara",
    "Hazme tu mejor piropo",
    "Imita c\u00f3mo me conociste la primera vez",
    "Haz tu mejor cara de modelo",
    "Ded\u00edcame una canci\u00f3n ahora mismo",
    "Escr\u00edbeme un mini poema en 30 segundos",
    "Mu\u00e9strame el \u00faltimo meme que guardaste por m\u00ed",
  ],
  medium: [
    "M\u00e1ndame un audio susurrando algo sexy",
    "Mu\u00e9strame tu mejor movimiento de baile sensual",
    "Haz un striptease... pero solo de una prenda",
    "Dime al o\u00eddo (c\u00e1mara cerca) qu\u00e9 me har\u00edas si estuviera ah\u00ed",
    "M\u00e1ndame la foto m\u00e1s atrevida que tengas m\u00eda guardada",
    "Act\u00faa c\u00f3mo ser\u00eda seducirme si fuera un desconocido/a",
    "Mu\u00e9rdete el labio mirando a la c\u00e1mara por 10 segundos",
    "Dime con detalle c\u00f3mo me besar\u00edas ahora",
    "Ponte tu prenda m\u00e1s sexy y mod\u00e9lamela",
    "M\u00e1ndame un mensaje de texto como si fuera nuestra primera vez",
  ],
  spicy: [
    "Mu\u00e9strame algo que normalmente no muestras \u{1F60F}",
    "Haz tu fantas\u00eda como si yo estuviera ah\u00ed \u2014 act\u00fala",
    "Descr\u00edbeme paso a paso qu\u00e9 est\u00e1s pensando hacerme",
    "Qu\u00edtate una prenda cada vez que pierdas este round",
    "Graba un audio de 30 segundos dici\u00e9ndome exactamente qu\u00e9 quieres",
    "Mu\u00e9strame c\u00f3mo te tocar\u00edas pensando en m\u00ed",
    "Ponte en tu pose m\u00e1s provocadora",
    "Dime tu fantas\u00eda m\u00e1s guardada, sin censura",
    "Haz que me sonroje \u2014 tienes 30 segundos",
    "La pr\u00f3xima vez que nos veamos, cumple lo que digas ahora",
  ],
};

const FORFEITS = {
  mild: [
    "Manda una selfie graciosa ahora",
    "Tienes que decir 'te amo' de 3 formas diferentes",
    "Canta el coro de una canci\u00f3n rom\u00e1ntica",
    "Haz 10 sentadillas frente a la c\u00e1mara",
    "Deja que tu pareja elija tu foto de perfil por 24h",
  ],
  medium: [
    "Qu\u00edtate una prenda a elecci\u00f3n del ganador",
    "El ganador elige tu reto para la pr\u00f3xima ronda",
    "Haz un baile sexy de 20 segundos",
    "Manda un audio diciendo lo que el ganador quiera",
    "El ganador elige qu\u00e9 te pones (de lo que tengas)",
  ],
  spicy: [
    "Qu\u00edtate dos prendas \u2014 sin negociar",
    "El ganador tiene control total del pr\u00f3ximo reto",
    "Cumple una fantas\u00eda del ganador (dentro de lo acordado)",
    "30 segundos haciendo lo que el ganador diga",
    "Prenda de tu elecci\u00f3n... o verdad sin censura del ganador",
  ],
};

const DRAW_COLORS = ["#000000","#e74c3c","#e67e22","#f1c40f","#2ecc71","#3498db","#9b59b6","#ffffff"];
const BRUSH_SIZES = [3, 6, 12, 20];

// ===== HELPERS =====
function generateRoomCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
function generatePlayerId() { return "p_" + Math.random().toString(36).substring(2, 10); }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ===== PARTYKIT HOOK =====
function usePartySocket(roomId) {
  const [connected, setConnected] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const socketRef = useRef(null);
  const handlers = useRef(new Map());

  useEffect(() => {
    if (!roomId) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(protocol + "://" + PARTYKIT_HOST + "/party/" + roomId);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setPlayerCount(0); };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "player-count") setPlayerCount(data.count);
      const handler = handlers.current.get(data.type);
      if (handler) handler(data);
    };
    socketRef.current = ws;
    return () => ws.close();
  }, [roomId]);

  const send = useCallback((data) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  }, []);

  const on = useCallback((type, handler) => {
    handlers.current.set(type, handler);
    return () => handlers.current.delete(type);
  }, []);

  return { connected, playerCount, send, on };
}

// ===== COMPONENTS =====

function DrawingCanvas({ isDrawer, party }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(6);
  const lastPoint = useRef(null);
  const dims = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.offsetWidth;
    const h = Math.round(w * 1.1);
    canvas.width = w * 2; canvas.height = h * 2;
    canvas.style.height = h + "px";
    dims.current = { w, h };
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (isDrawer) return;
    const c1 = party.on("draw-stroke", (d) => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = d.color; ctx.lineWidth = d.size;
      ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke();
    });
    const c2 = party.on("draw-clear", () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, dims.current.w, dims.current.h);
    });
    return () => { c1(); c2(); };
  }, [isDrawer]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }
  function startDraw(e) { if (!isDrawer) return; e.preventDefault(); setIsDrawing(true); lastPoint.current = getPos(e); }
  function draw(e) {
    if (!isDrawing || !isDrawer) return; e.preventDefault();
    const pos = getPos(e); const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color; ctx.lineWidth = brushSize;
    ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    party.send({ type: "draw-stroke", x1: lastPoint.current.x, y1: lastPoint.current.y, x2: pos.x, y2: pos.y, color, size: brushSize });
    lastPoint.current = pos;
  }
  function endDraw() { setIsDrawing(false); lastPoint.current = null; }
  function clearCanvas() {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, dims.current.w, dims.current.h);
    party.send({ type: "draw-clear" });
  }

  return (
    <div>
      <div className="canvas-container">
        <canvas ref={canvasRef} style={{ width: "100%", cursor: isDrawer ? "crosshair" : "default" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      </div>
      {isDrawer && (<>
        <div className="color-picker mt-8">
          {DRAW_COLORS.map(c => (
            <div key={c} className={"color-dot " + (color === c ? "active" : "")}
              style={{ background: c, border: c === "#ffffff" ? "2px solid #ccc" : undefined }}
              onClick={() => setColor(c)} />
          ))}
        </div>
        <div className="brush-sizes mt-8">
          {BRUSH_SIZES.map(s => (
            <div key={s} className={"brush-size " + (brushSize === s ? "active" : "")}
              style={{ width: s + 10, height: s + 10 }} onClick={() => setBrushSize(s)} />
          ))}
          <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 16px", fontSize: "0.8rem", marginLeft: "8px" }}
            onClick={clearCanvas}>Borrar</button>
        </div>
      </>)}
    </div>
  );
}

function RulesCard({ onClose }) {
  return (
    <div className="card gap-12 animate-in" style={{ border: "1px solid rgba(233,69,96,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ textAlign: "left", fontSize: "1.1rem", margin: 0 }}>Reglas del Juego</h2>
        {onClose && <button className="back-btn" style={{ padding: 0, fontSize: "1.2rem" }} onClick={onClose}>×</button>}
      </div>

      <div className="gap-8">
        <div>
          <p style={{ fontWeight: 600, color: "var(--accent-soft)", fontSize: "0.9rem" }}>🎨 Dibujar</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
            Uno dibuja, el otro adivina. Tienes 60 segundos. Si adivinan: +10 pts para quien adivina, +5 pts para quien dibuja. Puedes saltar palabras.
          </p>
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "var(--accent-soft)", fontSize: "0.9rem" }}>🤔😈 Verdad o Reto</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
            Por turnos, elige verdad o reto. Las preguntas y retos dependen del nivel de picante. Completar da +5 pts.
          </p>
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "var(--accent-soft)", fontSize: "0.9rem" }}>⚡ Penitencias</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
            Cada 3 rondas, quien va perdiendo recibe una penitencia. La intensidad depende del nivel de picante elegido.
          </p>
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "var(--accent-soft)", fontSize: "0.9rem" }}>📝 Palabras Secretas</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
            Cada uno agrega hasta 10 palabras secretas. Tu pareja las dibujará sin saber qué son. Pueden ser apodos, bromas internas, lugares, memorias...
          </p>
        </div>
      </div>
    </div>
  );
}

function RulesButton() {
  const [open, setOpen] = useState(false);
  return (<>
    <button onClick={() => setOpen(true)} style={{
      position: "fixed", bottom: "16px", right: "16px", zIndex: 50,
      width: "44px", height: "44px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
      background: "var(--bg-card)", color: "var(--text-dim)", fontSize: "1.2rem",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    }}>?</button>
    {open && (
      <div className="celebration" onClick={() => setOpen(false)}>
        <div style={{ maxWidth: "440px", width: "90%", padding: "16px" }} onClick={e => e.stopPropagation()}>
          <RulesCard onClose={() => setOpen(false)} />
        </div>
      </div>
    )}
  </>);
}

function LandingScreen() {
  const g = useGame();
  return (
    <div className="gap-24 animate-in" style={{ justifyContent: "center", flex: 1 }}>
      <div className="text-center">
        <div className="animate-float" style={{ fontSize: "3.5rem", marginBottom: "12px" }}>🌙</div>
        <h1>Noche de Juegos</h1>
        <h1 style={{ color: "var(--accent)" }}>en Pareja</h1>
        <p className="subtitle mt-8">Dibuja, reta, y diviértanse juntos</p>
      </div>
      <RulesCard />
      <div className="gap-12">
        <button className="btn btn-primary" onClick={() => { g.setIsHost(true); g.setPhase("create"); }}>Crear Sala</button>
        <button className="btn btn-secondary" onClick={() => g.setPhase("join")}>Unirse a Sala</button>
      </div>
    </div>
  );
}

function CreateScreen() {
  const g = useGame();
  const [name, setName] = useState("");
  function handleCreate() { if (!name.trim()) return; g.setMyName(name.trim()); g.setRoomId(generateRoomCode()); g.setPhase("lobby"); }
  return (
    <div className="gap-24 animate-in" style={{ flex: 1 }}>
      <button className="back-btn" onClick={() => g.setPhase("landing")}>← Volver</button>
      <div><h2>Crear Sala</h2><p className="subtitle">Ingresa tu nombre para empezar</p></div>
      <div className="gap-12">
        <input className="input" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()} autoFocus />
        <button className={"btn btn-primary " + (!name.trim() ? "btn-disabled" : "")} onClick={handleCreate}>Crear Sala</button>
      </div>
    </div>
  );
}

function JoinScreen() {
  const g = useGame();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  function handleJoin() { if (!name.trim() || code.length < 6) return; g.setMyName(name.trim()); g.setRoomId(code.toUpperCase()); g.setPhase("lobby"); }
  return (
    <div className="gap-24 animate-in" style={{ flex: 1 }}>
      <button className="back-btn" onClick={() => g.setPhase("landing")}>← Volver</button>
      <div><h2>Unirse a Sala</h2><p className="subtitle">Ingresa el código que te compartieron</p></div>
      <div className="gap-12">
        <input className="input" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <input className="input" placeholder="Código de sala" value={code}
          onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleJoin()}
          maxLength={6} style={{ textAlign: "center", letterSpacing: "8px", fontSize: "1.3rem" }} />
        <button className={"btn btn-primary " + (!name.trim() || code.length < 6 ? "btn-disabled" : "")} onClick={handleJoin}>Unirse</button>
      </div>
    </div>
  );
}

function LobbyScreen() {
  const g = useGame();
  const announced = useRef(false);
  useEffect(() => {
    if (!g.party.connected || announced.current) return;
    announced.current = true;
    g.party.send({ type: "announce", name: g.myName, playerId: g.playerId, isHost: g.isHost });
  }, [g.party.connected]);

  function updateSettings(spice, strip) {
    g.setSpiceLevel(spice); g.setStripMode(strip);
    g.party.send({ type: "settings-update", spiceLevel: spice, stripMode: strip });
  }
  const bothConnected = g.party.playerCount >= 2;

  return (
    <div className="gap-16 animate-in" style={{ flex: 1 }}>
      <div className="text-center">
        <h2>{g.isHost ? "Sala Creada" : "Conectado"}</h2>
        {g.isHost && <div className="room-code animate-glow">{g.roomId}</div>}
        {g.isHost && <p className="subtitle">Comparte este código con tu pareja</p>}
      </div>
      <div className="card gap-12">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>👤 {g.myName}</span>
          <span style={{ color: "var(--success)", fontSize: "0.8rem" }}>Conectado/a</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>💕 {g.partnerName || "Esperando..."}</span>
          {g.partnerName ? (
            <span style={{ color: "var(--success)", fontSize: "0.8rem" }}>Conectado/a</span>
          ) : (
            <span className="waiting-dots" style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}><span>.</span><span>.</span><span>.</span></span>
          )}
        </div>
      </div>
      {g.isHost && (
        <div className="card gap-12">
          <h2 style={{ textAlign: "left", fontSize: "1rem" }}>Nivel de Picante</h2>
          <div className="spice-options">
            {[{ id: "mild", label: "😊 Suave" }, { id: "medium", label: "🌶️ Medio" }, { id: "spicy", label: "🔥 Picante" }].map(s => (
              <button key={s.id} className={"spice-btn " + (g.spiceLevel === s.id ? "active" : "")}
                onClick={() => updateSettings(s.id, g.stripMode)}>{s.label}</button>
            ))}
          </div>
          <div className="toggle-row">
            <span>😏 Modo Strip Forfeit</span>
            <button className={"toggle " + (g.stripMode ? "active" : "")} onClick={() => updateSettings(g.spiceLevel, !g.stripMode)} />
          </div>
        </div>
      )}
      {!g.isHost && (
        <div className="card gap-8">
          <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
            Nivel: {g.spiceLevel === "mild" ? "😊 Suave" : g.spiceLevel === "medium" ? "🌶️ Medio" : "🔥 Picante"}
          </p>
          {g.stripMode && <p style={{ fontSize: "0.9rem", color: "var(--accent-soft)" }}>😏 Modo Strip activado</p>}
        </div>
      )}
      <button className={"btn btn-primary " + (!bothConnected ? "btn-disabled" : "")} onClick={() => g.setPhase("words")}>
        {bothConnected ? "Agregar Palabras Secretas →" : "Esperando a tu pareja..."}
      </button>
    </div>
  );
}

function WordsScreen() {
  const g = useGame();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [wordInput, setWordInput] = useState("");
  const [localWords, setLocalWords] = useState([]);

  function addWord() {
    if (!wordInput.trim() || localWords.length >= 10) return;
    setLocalWords(prev => [...prev, { word: wordInput.trim(), category: activeCategory }]);
    setWordInput("");
  }
  function removeWord(i) { setLocalWords(prev => prev.filter((_, idx) => idx !== i)); }
  function submitWords() {
    g.party.send({ type: "submit-words", playerId: g.playerId, words: localWords.length > 0 ? localWords : DEFAULT_WORDS });
  }
  function startGame() {
    // Pattern: draw, draw, truthordare, truthordare — so both players draw and both get truth/dare
    const order = [];
    for (let i = 0; i < 4; i++) order.push("drawing", "drawing", "truthordare", "truthordare");
    g.party.send({ type: "start-game", gameOrder: order });
    g.setGameOrder(order); g.setGameIndex(0); g.setRound(1); g.setTurnPlayer(1);
    g.setScores({ p1: 0, p2: 0 }); g.setPhase(order[0]);
  }
  const ph = { apodos: "Ej: Osito, Mi vida...", bromas: "Ej: Lo del supermercado...", lugares: "Ej: Aquel café...", memorias: "Ej: Nuestra primera cita...", secretos: "Ej: Aquello que pasó..." };

  return (
    <div className="gap-16 animate-in" style={{ flex: 1 }}>
      <div>
        <h2>Tus Palabras Secretas</h2>
        <p className="subtitle">Tu pareja las dibujará sin saber qué son 😏</p>
        <p className="text-center" style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{localWords.length}/10 palabras</p>
      </div>
      <div className="category-tabs">
        {CATEGORIES.map(c => {
          const count = localWords.filter(w => w.category === c.id).length;
          return (<button key={c.id} className={"category-tab " + (activeCategory === c.id ? "active" : "")}
            onClick={() => setActiveCategory(c.id)}>{c.icon} {c.label} {count > 0 && "(" + count + ")"}</button>);
        })}
      </div>
      {localWords.length < 10 && (
        <div className="guess-bar">
          <input className="input" placeholder={ph[activeCategory]} value={wordInput}
            onChange={e => setWordInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addWord()} />
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={addWord}>+</button>
        </div>
      )}
      <div className="word-chips">
        {localWords.map((w, i) => {
          const cat = CATEGORIES.find(c => c.id === w.category);
          return (<span key={i} className="word-chip">{cat ? cat.icon : ""} {w.word}<button onClick={() => removeWord(i)}>×</button></span>);
        })}
      </div>
      {!g.myWordsSubmitted ? (
        <button className="btn btn-primary" onClick={submitWords}>
          {localWords.length > 0 ? "Enviar Mis Palabras (" + localWords.length + ")" : "Usar Palabras Por Defecto"}
        </button>
      ) : (
        <div className="card text-center gap-8">
          <p style={{ color: "var(--success)" }}>✓ Tus palabras están listas</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
            {g.partnerWordsReady ? "✓ Tu pareja también está lista" : "Esperando a que tu pareja termine..."}
          </p>
        </div>
      )}
      {g.isHost && g.myWordsSubmitted && g.partnerWordsReady && (
        <button className="btn btn-primary animate-pulse mt-8" onClick={startGame}>🌙 Empezar la Noche</button>
      )}
    </div>
  );
}

function DrawingScreen() {
  const g = useGame();
  const [guessInput, setGuessInput] = useState("");
  const timerRef = useRef(null);
  const requestedWord = useRef(false);
  const isDrawer = g.amITurnPlayer;

  useEffect(() => {
    if (isDrawer && !requestedWord.current) {
      requestedWord.current = true;
      g.party.send({ type: "request-word", requesterId: g.playerId, wordIndex: g.wordIndexCounter });
      g.setWordIndexCounter(prev => prev + 1);
    }
    g.setTimeLeft(60); g.setDrawingFinished(false); g.setGuesses([]);
    return () => { requestedWord.current = false; };
  }, [g.round, g.turnPlayer]);

  useEffect(() => {
    if (g.drawingFinished) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      g.setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (g.isHost) {
            g.party.send({ type: "time-up", word: g.currentWord });
            g.setDrawingFinished(true);
            g.setCelebration({ type: "timeup" });
            setTimeout(() => g.setCelebration(null), 2500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [g.drawingFinished, g.round, g.turnPlayer]);

  function submitGuess() {
    if (!guessInput.trim() || isDrawer || g.drawingFinished) return;
    const guess = guessInput.trim(); setGuessInput("");
    g.party.send({ type: "guess", text: guess, name: g.myName });
    g.setGuesses(prev => [...prev, { text: guess, name: g.myName }]);
  }

  function skipWord() {
    g.party.send({ type: "skip-word" });
    requestedWord.current = false;
    g.setWordIndexCounter(prev => {
      const next = prev + 1;
      g.party.send({ type: "request-word", requesterId: g.playerId, wordIndex: next });
      requestedWord.current = true;
      return next;
    });
    // Clear canvas for both
    g.party.send({ type: "draw-clear" });
  }

  const tc = g.timeLeft <= 10 ? "timer critical" : g.timeLeft <= 30 ? "timer warning" : "timer";
  const p1 = g.isHost ? g.myName : g.partnerName;
  const p2 = g.isHost ? g.partnerName : g.myName;

  return (
    <div className="gap-12 animate-in" style={{ flex: 1 }}>
      <div className="score-bar">
        <span>{p1}: <span className="score">{g.scores.p1}</span></span>
        <span className={tc}>{g.timeLeft}s</span>
        <span>{p2}: <span className="score">{g.scores.p2}</span></span>
      </div>
      {isDrawer && g.currentWord && (
        <div className="card text-center" style={{ background: "rgba(233,69,96,0.1)", border: "1px solid var(--accent)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: "4px" }}>
            {g.currentCategory && g.currentCategory !== "default" && CATEGORIES.find(c => c.id === g.currentCategory) ? CATEGORIES.find(c => c.id === g.currentCategory).icon + " " : ""}Dibuja:
          </p>
          <p style={{ fontSize: "1.4rem", fontWeight: "700" }}>{g.currentWord}</p>
          {!g.drawingFinished && (
            <button className="btn btn-secondary mt-8" style={{ width: "auto", padding: "8px 16px", fontSize: "0.8rem" }}
              onClick={skipWord}>Saltar →</button>
          )}
        </div>
      )}
      {!isDrawer && (
        <div className="card text-center">
          <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
            {g.currentCategory && g.currentCategory !== "default" && CATEGORIES.find(c => c.id === g.currentCategory)
              ? CATEGORIES.find(c => c.id === g.currentCategory).icon + " " + CATEGORIES.find(c => c.id === g.currentCategory).label
              : "🎨 Adivina el dibujo"}
          </p>
        </div>
      )}
      <DrawingCanvas isDrawer={isDrawer} party={g.party} />
      {!isDrawer && !g.drawingFinished && (
        <div className="guess-bar">
          <input className="input" placeholder="Tu respuesta..." value={guessInput}
            onChange={e => setGuessInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submitGuess()} autoFocus />
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={submitGuess}>→</button>
        </div>
      )}
      {g.guesses.length > 0 && (
        <div className="card" style={{ maxHeight: "100px", overflowY: "auto" }}>
          {g.guesses.map((q, i) => (
            <p key={i} style={{ fontSize: "0.85rem", padding: "2px 0", color: "var(--text-dim)" }}>
              <strong style={{ color: "var(--text)" }}>{q.name}:</strong> {q.text}
            </p>
          ))}
        </div>
      )}
      {g.drawingFinished && (
        <div className="gap-8 mt-8">
          {g.currentWord && <p className="text-center" style={{ color: "var(--accent-soft)" }}>La palabra era: <strong>{g.currentWord}</strong></p>}
          {g.isHost ? <button className="btn btn-primary" onClick={g.advanceRound}>Siguiente Ronda →</button>
            : <p className="text-center subtitle">Esperando...</p>}
        </div>
      )}
    </div>
  );
}

function TruthOrDareScreen() {
  const g = useGame();
  const isMyTurn = g.amITurnPlayer;
  const turnName = g.turnPlayer === 1 ? (g.isHost ? g.myName : g.partnerName) : (g.isHost ? g.partnerName : g.myName);

  function chooseTod(choice) {
    g.setTodChoice(choice); g.party.send({ type: "tod-choice", choice });
    const deck = choice === "truth" ? TRUTHS[g.spiceLevel] : DARES[g.spiceLevel];
    const used = choice === "truth" ? g.usedTruths : g.usedDares;
    const available = deck.filter(c => !used.includes(c));
    const card = available.length > 0 ? pickRandom(available) : pickRandom(deck);
    if (choice === "truth") g.setUsedTruths(prev => [...prev, card]);
    else g.setUsedDares(prev => [...prev, card]);
    g.setTodCard(card); g.setTodRevealed(true); g.party.send({ type: "tod-card", card });
  }

  function handleDone() {
    const ns = { ...g.scores };
    if (g.turnPlayer === 1) ns.p1 += 5; else ns.p2 += 5;
    g.setScores(ns); g.party.send({ type: "tod-done", scores: ns }); g.advanceRound();
  }

  const p1 = g.isHost ? g.myName : g.partnerName;
  const p2 = g.isHost ? g.partnerName : g.myName;

  return (
    <div className="gap-16 animate-in" style={{ flex: 1 }}>
      <div className="score-bar">
        <span>{p1}: <span className="score">{g.scores.p1}</span></span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Ronda {g.round}</span>
        <span>{p2}: <span className="score">{g.scores.p2}</span></span>
      </div>
      <h2>{turnName}</h2>
      {!g.todChoice && (
        <div>
          <p className="text-center subtitle mb-16">{isMyTurn ? "¿Qué prefieres?" : "Esperando a que " + turnName + " elija..."}</p>
          {isMyTurn && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => chooseTod("truth")}>🤔 Verdad</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => chooseTod("dare")}>😈 Reto</button>
            </div>
          )}
        </div>
      )}
      {g.todRevealed && g.todCard && (
        <div className="tod-card animate-flip">
          <p className="card-type">{g.todChoice === "truth" ? "🤔 Verdad" : "😈 Reto"}</p>
          <p className="card-text">{g.todCard}</p>
        </div>
      )}
      {g.todRevealed && (
        <div className="mt-16">
          {g.isHost ? <button className="btn btn-primary" onClick={handleDone}>Hecho ✓ Siguiente</button>
            : <p className="text-center subtitle">Esperando...</p>}
        </div>
      )}
    </div>
  );
}

function ForfeitScreen() {
  const g = useGame();
  const [revealed, setRevealed] = useState(false);
  const [card] = useState(() => pickRandom(FORFEITS[g.spiceLevel]));
  const loserIsP1 = g.scores.p1 < g.scores.p2;
  const loserName = loserIsP1 ? (g.isHost ? g.myName : g.partnerName) : (g.isHost ? g.partnerName : g.myName);

  return (
    <div className="gap-24 animate-in" style={{ flex: 1, justifyContent: "center" }}>
      <div className="text-center">
        <div style={{ fontSize: "3rem" }}>⚡</div>
        <h1 style={{ color: "var(--accent)" }}>Penitencia</h1>
        <p className="subtitle mt-8">{loserName} va perdiendo...</p>
      </div>
      {!revealed ? (
        <button className="btn btn-primary animate-pulse" onClick={() => setRevealed(true)}>Revelar Penitencia 😏</button>
      ) : (
        <div className="forfeit-card animate-flip">
          <p style={{ fontSize: "0.8rem", color: "var(--accent-soft)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "2px" }}>{loserName} debe:</p>
          <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>{card}</p>
        </div>
      )}
      {revealed && g.isHost && <button className="btn btn-secondary mt-16" onClick={g.advanceFromForfeit}>Continuar Jugando →</button>}
      {revealed && !g.isHost && <p className="text-center subtitle">Esperando...</p>}
    </div>
  );
}

function ResultsScreen() {
  const g = useGame();
  const p1 = g.isHost ? g.myName : g.partnerName;
  const p2 = g.isHost ? g.partnerName : g.myName;
  const winner = g.scores.p1 > g.scores.p2 ? p1 : g.scores.p2 > g.scores.p1 ? p2 : null;

  return (
    <div className="gap-24 animate-in" style={{ flex: 1, justifyContent: "center" }}>
      <div className="text-center">
        <div style={{ fontSize: "4rem", marginBottom: "8px" }}>{winner ? "🏆" : "💕"}</div>
        <h1>{winner ? "¡" + winner + " Gana!" : "¡Empate!"}</h1>
        <p className="subtitle mt-8">{winner ? "Pero ambos ganaron esta noche 💕" : "Los dos son ganadores 🌙"}</p>
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div><p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{p1}</p><p style={{ fontSize: "2rem", fontWeight: "800", color: "var(--gold)" }}>{g.scores.p1}</p></div>
          <div style={{ fontSize: "1.5rem", color: "var(--text-dim)", alignSelf: "center" }}>vs</div>
          <div><p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{p2}</p><p style={{ fontSize: "2rem", fontWeight: "800", color: "var(--gold)" }}>{g.scores.p2}</p></div>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => {
        g.setPhase("lobby"); g.setRound(1); g.setScores({ p1: 0, p2: 0 }); g.setGameIndex(0);
        g.setMyWordsSubmitted(false); g.setPartnerWordsReady(false);
        g.setUsedTruths([]); g.setUsedDares([]); g.setWordIndexCounter(0);
      }}>🌙 Otra Ronda</button>
    </div>
  );
}

function CelebrationOverlay() {
  const g = useGame();
  if (!g.celebration) return null;
  return (
    <div className="celebration" onClick={() => g.setCelebration(null)}>
      <div className="celebration-content">
        {g.celebration.type === "correct" ? (<>
          <div className="celebration-emoji">🎉</div>
          <h1>¡Correcto!</h1>
          <p className="subtitle mt-8">{g.celebration.guesser} adivinó</p>
        </>) : (<>
          <div className="celebration-emoji">⏰</div>
          <h1>¡Se acabó el tiempo!</h1>
        </>)}
      </div>
    </div>
  );
}

// ===== MAIN APP =====
function App() {
  const [phase, setPhase] = useState("landing");
  const [playerId] = useState(generatePlayerId);
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("medium");
  const [stripMode, setStripMode] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [turnPlayer, setTurnPlayer] = useState(1);
  const [gameOrder, setGameOrder] = useState([]);
  const [gameIndex, setGameIndex] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [myWordsSubmitted, setMyWordsSubmitted] = useState(false);
  const [partnerWordsReady, setPartnerWordsReady] = useState(false);
  const [wordIndexCounter, setWordIndexCounter] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [guesses, setGuesses] = useState([]);
  const [drawingFinished, setDrawingFinished] = useState(false);
  const [todChoice, setTodChoice] = useState(null);
  const [todCard, setTodCard] = useState(null);
  const [todRevealed, setTodRevealed] = useState(false);
  const [usedTruths, setUsedTruths] = useState([]);
  const [usedDares, setUsedDares] = useState([]);

  const party = usePartySocket(roomId);
  const amITurnPlayer = (isHost && turnPlayer === 1) || (!isHost && turnPlayer === 2);

  const stateRef = useRef({});
  stateRef.current = { round, turnPlayer, gameIndex, gameOrder, scores, isHost, phase };

  useEffect(() => {
    const cleanups = [
      party.on("roster", (d) => { const p = d.players.find(p => p.playerId !== playerId); if (p) setPartnerName(p.name); }),
      party.on("settings-update", (d) => { if (d.spiceLevel) setSpiceLevel(d.spiceLevel); if (d.stripMode !== undefined) setStripMode(d.stripMode); }),
      party.on("partner-words-ready", () => setPartnerWordsReady(true)),
      party.on("words-received", () => setMyWordsSubmitted(true)),
      party.on("start-game", (d) => { setGameOrder(d.gameOrder); setGameIndex(0); setRound(1); setTurnPlayer(1); setScores({ p1: 0, p2: 0 }); setPhase(d.gameOrder[0]); }),
      party.on("word-to-draw", (d) => { setCurrentWord(d.word); setCurrentCategory(d.category); }),
      party.on("guess", (d) => setGuesses(prev => [...prev, d])),
      party.on("correct-guess", (d) => {
        setDrawingFinished(true);
        setCurrentWord(d.word);
        setScores(prev => {
          const ns = { ...prev };
          // Guesser gets 10, drawer gets 5. Guesser is always the non-turn player.
          // turnPlayer=1 means host draws, so p2 (guest) guesses
          // We use stateRef to get current turnPlayer
          const tp = stateRef.current.turnPlayer;
          if (tp === 1) { ns.p2 += 10; ns.p1 += 5; } else { ns.p1 += 10; ns.p2 += 5; }
          return ns;
        });
        setCelebration({ type: "correct", guesser: d.guesserName });
        setTimeout(() => setCelebration(null), 2500);
      }),
      party.on("time-up", (d) => { setDrawingFinished(true); if (d && d.word) setCurrentWord(d.word); setCelebration({ type: "timeup" }); setTimeout(() => setCelebration(null), 2500); }),
      party.on("next-round", (d) => { setRound(d.round); setTurnPlayer(d.turnPlayer); setGameIndex(d.gameIndex !== undefined ? d.gameIndex : 0); if (d.scores) setScores(d.scores); setPhase(d.game === "forfeit" ? "forfeit" : d.game); setDrawingFinished(false); setGuesses([]); setCurrentWord(null); setCurrentCategory(null); setTimeLeft(60); setTodChoice(null); setTodCard(null); setTodRevealed(false); }),
      party.on("tod-choice", (d) => setTodChoice(d.choice)),
      party.on("tod-card", (d) => { setTodCard(d.card); setTodRevealed(true); }),
      party.on("skip-word", () => { setCurrentWord(null); setCurrentCategory(null); setGuesses([]); }),
      party.on("tod-done", (d) => setScores(d.scores)),
      party.on("game-over", (d) => { setScores(d.scores); setPhase("results"); }),
    ];
    return () => cleanups.forEach(fn => fn && fn());
  }, [party.on]);

  const advanceRound = useCallback(() => {
    const s = stateRef.current; if (!s.isHost) return;
    const newTurn = s.turnPlayer === 1 ? 2 : 1, newRound = s.round + 1, nextIdx = s.gameIndex + 1;
    if (s.round % 3 === 0 && s.scores.p1 !== s.scores.p2) {
      party.send({ type: "next-round", round: newRound, turnPlayer: newTurn, game: "forfeit", gameIndex: s.gameIndex, scores: s.scores });
      setRound(newRound); setTurnPlayer(newTurn); setPhase("forfeit"); return;
    }
    if (nextIdx >= s.gameOrder.length) { party.send({ type: "game-over", scores: s.scores }); setPhase("results"); return; }
    const ng = s.gameOrder[nextIdx];
    party.send({ type: "next-round", round: newRound, turnPlayer: newTurn, game: ng, gameIndex: nextIdx, scores: s.scores });
    setGameIndex(nextIdx); setRound(newRound); setTurnPlayer(newTurn); setPhase(ng);
  }, [party.send]);

  const advanceFromForfeit = useCallback(() => {
    const s = stateRef.current; if (!s.isHost) return;
    const nextIdx = s.gameIndex + 1;
    if (nextIdx >= s.gameOrder.length) { party.send({ type: "game-over", scores: s.scores }); setPhase("results"); return; }
    const ng = s.gameOrder[nextIdx];
    party.send({ type: "next-round", round: s.round, turnPlayer: s.turnPlayer, game: ng, gameIndex: nextIdx });
    setGameIndex(nextIdx); setPhase(ng);
  }, [party.send]);

  const ctx = useMemo(() => ({
    phase, setPhase, playerId, roomId, setRoomId, isHost, setIsHost,
    myName, setMyName, partnerName, spiceLevel, setSpiceLevel,
    stripMode, setStripMode, scores, setScores, round, setRound,
    turnPlayer, setTurnPlayer, gameOrder, setGameOrder, gameIndex, setGameIndex,
    celebration, setCelebration, myWordsSubmitted, setMyWordsSubmitted,
    partnerWordsReady, setPartnerWordsReady, wordIndexCounter, setWordIndexCounter,
    currentWord, setCurrentWord, currentCategory, setCurrentCategory,
    timeLeft, setTimeLeft, guesses, setGuesses, drawingFinished, setDrawingFinished,
    todChoice, setTodChoice, todCard, setTodCard, todRevealed, setTodRevealed,
    usedTruths, setUsedTruths, usedDares, setUsedDares,
    party, amITurnPlayer, advanceRound, advanceFromForfeit,
  }), [phase, playerId, roomId, isHost, myName, partnerName, spiceLevel, stripMode,
    scores, round, turnPlayer, gameOrder, gameIndex, celebration,
    myWordsSubmitted, partnerWordsReady, wordIndexCounter,
    currentWord, currentCategory, timeLeft, guesses, drawingFinished,
    todChoice, todCard, todRevealed, usedTruths, usedDares,
    party, amITurnPlayer, advanceRound, advanceFromForfeit]);

  return (
    <GameCtx.Provider value={ctx}>
      {phase === "landing" && <LandingScreen />}
      {phase === "create" && <CreateScreen />}
      {phase === "join" && <JoinScreen />}
      {phase === "lobby" && <LobbyScreen />}
      {phase === "words" && <WordsScreen />}
      {phase === "drawing" && <DrawingScreen />}
      {phase === "truthordare" && <TruthOrDareScreen />}
      {phase === "forfeit" && <ForfeitScreen />}
      {phase === "results" && <ResultsScreen />}
      {phase !== "landing" && <RulesButton />}
      <CelebrationOverlay />
    </GameCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
