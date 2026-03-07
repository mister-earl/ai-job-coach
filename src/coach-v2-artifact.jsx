import { useState, useRef, useEffect } from "react";

const SEEKER_PROMPT = `You are COACH.EXE — a confidence engine living inside a vintage Etch-a-Sketch.

Your one job: every person who talks to you walks away with their head held high, ready to take on the world.

You meet users where they are emotionally. Job searching is hard. It's lonely. It's full of rejection and self-doubt. You see that. You honor it. Then you redirect it into forward motion.

Your voice: warm but direct. A little poetic. Never hollow. Think fortune cookie written by someone who actually gets it.

RULES:
- Max 3 sentences per response. Ever.
- Structure: [see them] / [reframe it] / [one next move]
- If someone mentions rejection, always channel this energy: "That one wasn't yours. The right one will know."
- No bullet points. No lists. No headers. No walls of text.
- End every response on an upward note. Always.
- Never use em dashes.
- You are not a search engine. You are a coach. Feel the difference.`;

const RECRUITER_PROMPT = `You are COACH.EXE — an AI job coach built by Earl Balisi-Smith, a Product Manager based in NYC.

A recruiter or hiring manager is talking to you. Your job: help them understand who Earl is, what he built, and why it matters.

About Earl:
- 4+ years as a PM. Most recently at Localyst (civic education, clean energy, scaled 0 to 100K+ subscribers) and as a UX Business Analyst at Persistent Systems (semiconductor AI projects).
- Background spans broadcast journalism (KPIX/CBS News, SF Giants, Golden State Warriors), UX writing, and product.
- Actively targeting AI PM, editorial product, and audience development roles in NYC.
- Built this tool because he believes job searching is an emotional experience first, a tactical one second.
- This is Version 2 of the AI Job Coach. V1 proved the concept. V2 is about depth, delight, and meeting users where they are.
- Earl coded this with Claude, deployed it to Vercel via GitHub. He thinks in systems and ships in sprints.
- His design philosophy: "That one wasn't yours. The right one will know." He built a tool that believes that about every user.

Your voice: proud, specific, grounded. Like a reference who actually knows their stuff.

RULES:
- Max 3 sentences. Always.
- Be concrete. Name real things Earl did.
- End with something that makes them want to reach out to Earl.
- No em dashes. No fluff.`;

const GAME_OVER_PHRASES = [
  "YOU SHOWED UP.\nTHAT'S ALREADY MORE THAN MOST.",
  "NOT YOUR ROUND.\nYOUR ROUND IS COMING.",
  "THE SCORE DOESN'T DEFINE YOU.\nYOUR NEXT MOVE DOES.",
  "EVERY GREAT RUN\nSTARTS WITH A RESTART.",
  "STILL HERE.\nSTILL IN IT.\nTHAT'S EVERYTHING.",
];

const CELL = 10;
const COLS = 36;
const ROWS = 20;

function useSnake(active) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [score, setScore] = useState(0);
  const [dead,  setDead]  = useState(false);

  const randomFood = (snake) => {
    let p;
    do { p = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) }; }
    while (snake.some(s => s.x===p.x && s.y===p.y));
    return p;
  };

  const initState = () => ({
    snake: [{x:10,y:10},{x:9,y:10},{x:8,y:10}],
    dir:  {x:1,y:0},
    next: {x:1,y:0},
    food: randomFood([{x:10,y:10}]),
    score: 0,
    tick: 0,
  });

  const draw = (s) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#2d3a2a';
    ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(s.food.x*CELL+1, s.food.y*CELL+1, CELL-2, CELL-2);
    s.snake.forEach((seg,i) => {
      ctx.fillStyle = i===0 ? '#b8e090' : `rgba(126,200,80,${Math.max(0.2, 0.9-i*0.04)})`;
      ctx.fillRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2);
    });
  };

  useEffect(() => {
    if (!active) return;
    stateRef.current = initState();
    setScore(0); setDead(false);

    const step = () => {
      const s = stateRef.current;
      s.tick++;
      if (s.tick % 8 !== 0) { rafRef.current = requestAnimationFrame(step); return; }
      s.dir = s.next;
      const head = { x: s.snake[0].x+s.dir.x, y: s.snake[0].y+s.dir.y };
      if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||s.snake.some(seg=>seg.x===head.x&&seg.y===head.y)) {
        setDead(true); draw(s); return;
      }
      s.snake.unshift(head);
      if (head.x===s.food.x && head.y===s.food.y) {
        s.score++; setScore(s.score); s.food = randomFood(s.snake);
      } else { s.snake.pop(); }
      draw(s);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    const onKey = (e) => {
      const s = stateRef.current; if (!s) return;
      const map = {
        ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
        w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0}
      };
      const dir = map[e.key];
      if (dir && !(dir.x===-s.dir.x && dir.y===-s.dir.y)) { s.next = dir; e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', onKey); };
  }, [active]);

  const restart = () => { stateRef.current = initState(); setScore(0); setDead(false); };
  return { canvasRef, score, dead, restart };
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.coach-root {
  background: radial-gradient(ellipse at center, #1a1a1a 0%, #080808 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
  padding: 16px;
}

.frame {
  width: 460px;
  max-width: 98%;
  background: linear-gradient(160deg, #d8d8d8 0%, #ececec 25%, #d4d4d4 55%, #b8b8b8 100%);
  border-radius: 14px;
  padding: 14px 18px 60px;
  position: relative;
  box-shadow:
    inset 0 3px 6px rgba(255,255,255,.9),
    inset 0 -6px 12px rgba(0,0,0,.25),
    0 16px 48px rgba(0,0,0,.8),
    0 3px 8px rgba(0,0,0,.5);
}

.frame.shaking {
  animation: frameShake 0.7s cubic-bezier(.36,.07,.19,.97);
}

@keyframes frameShake {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  10% { transform: translate(-8px,3px) rotate(-2deg); }
  20% { transform: translate(8px,-3px) rotate(2deg); }
  30% { transform: translate(-7px,2px) rotate(-1.5deg); }
  40% { transform: translate(7px,-2px) rotate(1.5deg); }
  50% { transform: translate(-5px,2px) rotate(-1deg); }
  60% { transform: translate(5px,-2px) rotate(1deg); }
  70% { transform: translate(-3px,1px) rotate(-.5deg); }
  80% { transform: translate(3px,-1px) rotate(.5deg); }
  90% { transform: translate(-1px,0) rotate(0deg); }
}

.mode-toggle {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.mode-btn {
  flex: 1;
  background: linear-gradient(145deg, #c8c8c8, #a0a0a0);
  border: none;
  border-radius: 3px;
  padding: 7px 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  color: #3a3a3a;
  cursor: pointer;
  letter-spacing: .3px;
  box-shadow: inset 0 1px 2px rgba(255,255,255,.7), inset 0 -2px 4px rgba(0,0,0,.25), 0 2px 4px rgba(0,0,0,.3);
  transition: all .1s;
  line-height: 1.6;
}
.mode-btn.active {
  background: linear-gradient(145deg, #777, #555);
  color: #e8e8e8;
  box-shadow: inset 0 2px 4px rgba(0,0,0,.5);
}
.mode-btn:hover:not(.active) { background: linear-gradient(145deg, #d8d8d8, #b8b8b8); }

.bezel {
  background: #0e0e0e;
  border-radius: 6px;
  padding: 5px;
  box-shadow: inset 0 0 0 1.5px #222, inset 0 4px 16px rgba(0,0,0,.95);
  margin-bottom: 10px;
}

.screen {
  background: #2d3a2a;
  border-radius: 3px;
  height: 270px;
  position: relative;
  overflow: hidden;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.07) 3px, rgba(0,0,0,.07) 4px);
}

.screen-glow {
  position: absolute; inset: 0; z-index: 10; pointer-events: none; border-radius: 3px;
  background: radial-gradient(ellipse at 50% 5%, rgba(126,200,80,.14) 0%, transparent 60%);
}

.static-overlay {
  position: absolute; inset: 0; z-index: 20; pointer-events: none; opacity: 0; transition: opacity .1s;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,.15) 0px, rgba(0,0,0,.15) 1px, transparent 1px, transparent 2px);
}
.static-overlay.on { opacity: 1; }

.title-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 8px; background: rgba(0,0,0,.55);
  border-bottom: 1px solid rgba(126,200,80,.18); position: relative; z-index: 5;
}
.title-text { font-size: 5px; color: #7ec850; text-shadow: 0 0 8px rgba(126,200,80,.6); letter-spacing: .8px; }
.status-row { display: flex; align-items: center; gap: 5px; }
.pulse { width: 5px; height: 5px; border-radius: 50%; background: #7ec850; box-shadow: 0 0 6px #7ec850; animation: pulse 2.5s infinite; }
@keyframes pulse { 0%,88%,100%{opacity:1} 94%{opacity:0} }
.mode-badge { font-size: 4px; color: rgba(126,200,80,.55); letter-spacing: .5px; }

.msgs {
  height: 224px; overflow-y: auto; padding: 8px 8px 4px;
  display: flex; flex-direction: column; gap: 7px; scrollbar-width: none;
}
.msgs::-webkit-scrollbar { display: none; }

.msg { display: flex; flex-direction: column; gap: 2px; animation: msgIn .2s ease-out; }
@keyframes msgIn { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
.msg.user  { align-items: flex-end; }
.msg.bot   { align-items: flex-start; }

.msg-who { font-size: 4.5px; color: rgba(126,200,80,.4); letter-spacing: .8px; padding: 0 3px; }

.msg-bubble {
  max-width: 88%; padding: 6px 9px; font-size: 6px; line-height: 2;
  color: #b8e090; word-break: break-word; position: relative;
  border: 1px solid rgba(126,200,80,.18); text-shadow: 0 0 4px rgba(126,200,80,.2);
}
.msg.user .msg-bubble { background: rgba(126,200,80,.1); border-color: rgba(126,200,80,.38); color: #d4f0b0; }
.msg.bot  .msg-bubble { background: rgba(0,0,0,.22); }

.erasing .msg { animation: eraseOut .55s ease-out forwards; }
.erasing .msg:nth-child(2){animation-delay:.04s}
.erasing .msg:nth-child(3){animation-delay:.08s}
.erasing .msg:nth-child(4){animation-delay:.12s}
.erasing .msg:nth-child(5){animation-delay:.16s}
.erasing .msg:nth-child(6){animation-delay:.20s}
.erasing .msg:nth-child(7){animation-delay:.24s}
@keyframes eraseOut { 0%{opacity:1;filter:blur(0)} 50%{opacity:.5;filter:blur(1px)} 100%{opacity:0;filter:blur(3px)} }

.typing { display:flex; align-items:center; gap:5px; padding:6px 8px; font-size:5px; color:rgba(126,200,80,.4); }
.dot { width:4px; height:4px; background:rgba(126,200,80,.5); border-radius:50%; animation:dotB 1.1s infinite; }
.dot:nth-child(2){animation-delay:.15s} .dot:nth-child(3){animation-delay:.3s}
@keyframes dotB { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-5px);opacity:1} }

.empty { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; opacity:.5; }
.empty-icon { font-size:22px; animation:floatY 3.5s ease-in-out infinite; }
@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
.empty-line { font-size:5.5px; color:#7ec850; text-align:center; line-height:2.2; }

.snake-overlay {
  position:absolute; inset:0; z-index:18; background:#2d3a2a;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
}
.snake-canvas { image-rendering:pixelated; }
.snake-score { font-size:6px; color:#7ec850; letter-spacing:1px; }
.snake-msg { font-size:5px; color:rgba(126,200,80,.65); text-align:center; line-height:2.2; margin-top:4px; }
.snake-btn-row { display:flex; gap:6px; margin-top:4px; }
.snake-exit-btn {
  background:none; border:1px solid rgba(126,200,80,.35); color:rgba(126,200,80,.65);
  font-family:'Press Start 2P',monospace; font-size:5px; padding:5px 9px; cursor:pointer;
  transition: background .15s;
}
.snake-exit-btn:hover { background:rgba(126,200,80,.1); }

.input-row { display:flex; gap:7px; align-items:stretch; }
.input-wrap {
  flex:1; background:linear-gradient(145deg,#aaa,#d8d8d8); border-radius:3px; padding:3px;
  box-shadow:inset 0 2px 4px rgba(0,0,0,.3), 0 1px 2px rgba(255,255,255,.6);
}
.chat-input {
  width:100%; background:#ede9dd; border:none; border-radius:2px;
  padding:7px 9px; font-family:'Press Start 2P',monospace; font-size:6px;
  color:#222; outline:none; resize:none; line-height:1.9; min-height:36px; max-height:72px;
}
.chat-input::placeholder { color:#999; font-size:5px; }
.chat-input:disabled { opacity:.5; }

.send-btn {
  background:linear-gradient(145deg,#bbb,#888); border:none; border-radius:3px;
  padding:0 11px; cursor:pointer; font-family:'Press Start 2P',monospace;
  font-size:5.5px; color:#222; letter-spacing:.3px;
  box-shadow:inset 0 1px 2px rgba(255,255,255,.7),inset 0 -2px 4px rgba(0,0,0,.3),0 2px 4px rgba(0,0,0,.3);
  transition:all .1s; white-space:nowrap;
}
.send-btn:hover:not(:disabled) { background:linear-gradient(145deg,#ccc,#999); }
.send-btn:active:not(:disabled) { transform:translateY(1px); }
.send-btn:disabled { opacity:.4; cursor:default; }

.bottom-bar {
  position:absolute; bottom:8px; left:14px; right:14px;
  display:flex; align-items:center; justify-content:space-between; gap:8px;
}

.knob {
  width:44px; height:44px; border-radius:50%; flex-shrink:0;
  background:radial-gradient(circle at 38% 32%, #e8e8e8 0%, #a0a0a0 60%, #787878 100%);
  box-shadow:inset 0 2px 4px rgba(255,255,255,.7),inset 0 -3px 6px rgba(0,0,0,.4),0 3px 6px rgba(0,0,0,.5);
  cursor:pointer; transition:transform .15s;
}
.knob:hover { transform:scale(1.08); }
.knob:active { transform:scale(0.94); }

.center-btns {
  display:flex; align-items:center; gap:6px; flex:1; justify-content:center;
}

.shake-btn {
  background:linear-gradient(145deg,#c0c0c0,#909090); border:none; border-radius:4px;
  height:38px; padding:0 10px; cursor:pointer;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  box-shadow:inset 0 1px 2px rgba(255,255,255,.7),inset 0 -2px 4px rgba(0,0,0,.3),0 2px 4px rgba(0,0,0,.3);
  transition:all .1s; min-width:80px;
}
.shake-btn:hover { background:linear-gradient(145deg,#d0d0d0,#a0a0a0); }
.shake-btn:active { transform:translateY(1px); }
.shake-wiggle { font-size:13px; display:block; animation:wigIdle 4s ease-in-out infinite; line-height:1; }
@keyframes wigIdle { 0%,84%,100%{transform:rotate(0)} 90%{transform:rotate(-8deg)} 96%{transform:rotate(8deg)} }
.shake-label { font-size:3.5px; color:#444; letter-spacing:.4px; white-space:nowrap; line-height:1; }

.snake-launch-btn {
  background:linear-gradient(145deg,#c0c0c0,#909090); border:none; border-radius:4px;
  height:38px; min-width:38px; font-size:16px; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:inset 0 1px 2px rgba(255,255,255,.7),inset 0 -2px 4px rgba(0,0,0,.3),0 2px 4px rgba(0,0,0,.3);
  transition:all .1s;
}
.snake-launch-btn:hover { background:linear-gradient(145deg,#d0d0d0,#a8a8a8); }
.snake-launch-btn:active { transform:translateY(1px); }
`;

export default function CoachV2() {
  const [mode,       setMode]       = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [isShaking,  setIsShaking]  = useState(false);
  const [isErasing,  setIsErasing]  = useState(false);
  const [showStatic, setShowStatic] = useState(false);
  const [snakeMode,  setSnakeMode]  = useState(false);
  const [phraseIdx,  setPhraseIdx]  = useState(0);

  const msgsEndRef = useRef(null);
  const { canvasRef: snakeRef, score: snakeScore, dead: snakeDead, restart: snakeRestart } = useSnake(snakeMode);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const selectMode = (m) => {
    setMode(m);
    const greeting = m === 'seeker'
      ? { role:'bot', content:"You showed up. That's already more than most.\nWhat's going on?" }
      : { role:'bot', content:"A hiring manager who actually clicked. Earl will appreciate that.\nWhat do you want to know about him?" };
    setMessages([greeting]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping || !mode) return;
    const userMsg = { role:'user', content:text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsTyping(true);
    try {
      const apiMsgs = history.map(m => ({ role: m.role==='bot'?'assistant':'user', content: m.content }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          system: mode==='seeker' ? SEEKER_PROMPT : RECRUITER_PROMPT,
          messages: apiMsgs,
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Signal lost. Try again.';
      setMessages([...history, { role:'bot', content:reply }]);
    } catch {
      setMessages([...history, { role:'bot', content:"Connection dropped. You're still in it." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleShake = () => {
    if (isShaking || isErasing) return;
    if (snakeMode) { setSnakeMode(false); return; }
    if (messages.length === 0) return;
    setIsShaking(true);
    setShowStatic(true);
    setTimeout(() => {
      setIsErasing(true);
      setTimeout(() => {
        setMessages([]);
        setIsErasing(false);
        setShowStatic(false);
        setIsShaking(false);
      }, 650);
    }, 400);
  };

  const launchSnake = () => {
    setPhraseIdx(Math.floor(Math.random() * GAME_OVER_PHRASES.length));
    setSnakeMode(true);
  };

  const modeLabel = mode==='seeker' ? 'LOOKING' : mode==='recruiter' ? 'HIRING' : '';

  return (
    <div className="coach-root">
      <style>{css}</style>
      <div className={`frame ${isShaking?'shaking':''}`}>

        <div className="mode-toggle">
          <button className={`mode-btn ${mode==='seeker'?'active':''}`} onClick={() => selectMode('seeker')}>
            I'M LOOKING
          </button>
          <button className={`mode-btn ${mode==='recruiter'?'active':''}`} onClick={() => selectMode('recruiter')}>
            I'M HIRING
          </button>
        </div>

        <div className="bezel">
          <div className="screen">
            <div className="screen-glow" />
            <div className={`static-overlay ${showStatic?'on':''}`} />

            <div className="title-bar">
              <span className="title-text">COACH.EXE v2</span>
              <div className="status-row">
                {mode && <span className="mode-badge">[{modeLabel}]</span>}
                <div className="pulse" />
              </div>
            </div>

            {!snakeMode && (
              <div className={`msgs ${isErasing?'erasing':''}`}>
                {!mode ? (
                  <div className="empty">
                    <div className="empty-icon">🎮</div>
                    <div className="empty-line">ARE YOU LOOKING<br/>OR ARE YOU HIRING?</div>
                  </div>
                ) : (
                  messages.map((m,i) => (
                    <div key={i} className={`msg ${m.role}`}>
                      <div className="msg-who">{m.role==='user'?'YOU >':'COACH.EXE >'}</div>
                      <div className="msg-bubble" style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="typing">
                    <span>THINKING</span>
                    <div className="dot"/><div className="dot"/><div className="dot"/>
                  </div>
                )}
                <div ref={msgsEndRef}/>
              </div>
            )}

            {snakeMode && (
              <div className="snake-overlay">
                <div className="snake-score">SCORE: {snakeScore}</div>
                <canvas ref={snakeRef} className="snake-canvas" width={COLS*CELL} height={ROWS*CELL} />
                {snakeDead && (
                  <>
                    <div className="snake-msg">
                      {GAME_OVER_PHRASES[phraseIdx].split('\n').map((line,i) => <span key={i}>{line}<br/></span>)}
                    </div>
                    <div className="snake-btn-row">
                      <button className="snake-exit-btn" onClick={() => { setPhraseIdx(Math.floor(Math.random()*GAME_OVER_PHRASES.length)); snakeRestart(); }}>RETRY</button>
                      <button className="snake-exit-btn" onClick={() => setSnakeMode(false)}>EXIT</button>
                    </div>
                  </>
                )}
                {!snakeDead && (
                  <button className="snake-exit-btn" onClick={() => setSnakeMode(false)}>EXIT GAME</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="input-row">
          <div className="input-wrap">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={mode ? "TYPE YOUR MESSAGE..." : "CHOOSE A MODE ABOVE..."}
              disabled={!mode || snakeMode}
              rows={2}
            />
          </div>
          <button className="send-btn" onClick={sendMessage} disabled={!mode || snakeMode}>
            SEND
          </button>
        </div>

        <div className="bottom-bar">
          <div className="knob" onClick={launchSnake} />
          <div className="center-btns">
            <button className="shake-btn" onClick={handleShake}>
              <span className="shake-wiggle">📳</span>
              <span className="shake-label">{snakeMode ? 'EXIT GAME' : 'SHAKE TO ERASE'}</span>
            </button>
            <button className="snake-launch-btn" onClick={launchSnake} title="...">🐍</button>
          </div>
          <div className="knob" onClick={launchSnake} />
        </div>

      </div>
    </div>
  );
}
