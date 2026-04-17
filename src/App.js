import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './App.css';
import gameost from './ost/game.mp3';
import inputost from './ost/input.mp3';
import loseost from './ost/lose.mp3';
import victoryost from './ost/victory.mp3';

// ─── Game constants ────────────────────────────────────────────────────────────
const TARGET_NUMBERS   = Array.from({ length: 16 }, (_, i) => i);
const GAME_TIME        = 120;   // seconds (was 50)
const FALL_INTERVAL_MS = 60;    // ms per physics tick — constant speed
const NORMAL_FALL_STEP = 2;     // % of fall-area per tick
const FAST_FALL_STEP   = 14;    // % per tick while holding ArrowDown / mobile ▼

// Pure helper — defined outside component so it never triggers re-renders
const getBits = (n) => [(n >> 3) & 1, (n >> 2) & 1, (n >> 1) & 1, n & 1];

// ─── Matrix background ─────────────────────────────────────────────────────────
function MatrixBackground({ timeLeft, totalTime }) {
  const canvasRef = useRef(null);
  const timeRef   = useRef(timeLeft);

  useEffect(() => { timeRef.current = timeLeft; }, [timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン0123456789';
    const letters  = katakana.split('');
    const fontSize = 18;
    let drops = Array.from({ length: Math.floor(canvas.width / fontSize) }).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(2,2,2,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const danger = 1 - (timeRef.current / totalTime);
      const r = Math.min(255, Math.floor(danger * 255 * 2));
      const g = Math.max(0,   Math.floor((1 - danger) * 255 * 1.5));
      ctx.fillStyle = `rgb(${r},${g},0)`;
      ctx.font      = `${fontSize}px "Share Tech Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(letters[Math.floor(Math.random() * letters.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const id = setInterval(draw, 35);
    return () => { clearInterval(id); window.removeEventListener('resize', resize); };
  }, [totalTime]);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

// ─── Root app ──────────────────────────────────────────────────────────────────
export default function BinaryPresentationApp() {
  const [mode, setMode]               = useState('menu');
  const [timeLeftGlobal, setTLG]      = useState(GAME_TIME);
  const [globalVolume, setGlobalVolume] = useState(0.4);

  const dangerRatio = 1 - (timeLeftGlobal / GAME_TIME);
  const r = Math.min(255, Math.floor(dangerRatio * 255 * 2));
  const g = Math.max(0,   Math.floor((1 - dangerRatio) * 255 * 1.2));

  const dynamicStyle = {
    '--primary-color': `rgb(${r},${g},0)`,
    '--border-color':  `rgba(${r},${g},0,0.6)`,
    '--shadow-glow':   `0 0 ${10 + dangerRatio * 20}px rgba(${r},${g},0,${0.4 + dangerRatio * 0.4})`,
  };

  const glitchClass = mode === 'game'
    ? dangerRatio > 0.8 ? 'glitch-extreme'
    : dangerRatio > 0.5 ? 'glitch-heavy'
    : dangerRatio > 0.3 ? 'glitch-light' : ''
    : '';

  const volBars      = Math.round(globalVolume * 10);
  const volumeVisual = '[' + '|'.repeat(volBars) + '.'.repeat(10 - volBars) + ']';

  return (
    <>
      <MatrixBackground timeLeft={timeLeftGlobal} totalTime={GAME_TIME} />
      <div className={`app-container ${glitchClass}`} style={dynamicStyle}>
        <div className="scanline" />

        {mode === 'game' && (
          <div className="volume-container content-layer terminal-box">
            <label className="dynamic-text">VOL {volumeVisual}</label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={globalVolume}
              onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        )}

        {mode === 'menu' && (
          <div className="menu-screen fade-in content-layer terminal-box">
            <h1 className="title">BINARIOS_NATURALES</h1>
            <p className="subtitle">:// INICIANDO SECUENCIA_</p>
            <div className="button-group">
              <button onClick={() => setMode('presentation')} className="btn btn-primary">[ INICIAR_EXPOSICION ]</button>
              <button onClick={() => setMode('game')}         className="btn btn-primary">[ EJECUTAR_SIMULADOR ]</button>
              <button onClick={() => setMode('credits')}      className="btn btn-secondary">[ CREDITOS ]</button>
            </div>
          </div>
        )}

        {mode === 'credits'      && <CreditsMode      onExit={() => setMode('menu')} />}
        {mode === 'presentation' && <PresentationMode onExit={() => setMode('menu')} />}
        {mode === 'game' && (
          <GameMode
            onExit={() => { setMode('menu'); setTLG(GAME_TIME); }}
            updateGlobalTime={setTLG}
            globalVolume={globalVolume}
          />
        )}
      </div>
    </>
  );
}

// ─── Credits ───────────────────────────────────────────────────────────────────
function CreditsMode({ onExit }) {
  const team = [
    { name: "Cruz Segovia Lautaro Ismael",  id: "47082972" },
    { name: "Vedia Lautaro Agustin",        id: "47316562" },
    { name: "Tiziana Florencia Gallardo",   id: "48142456" },
    { name: "Luciano Alberto Fernández",    id: "48142006" },
    { name: "Lucila Giuliana Rocco",        id: "44281509" },
    { name: "Agustin Nicolas Zerpa",        id: "47316999" },
  ];

  return (
    <div className="presentation-container fade-in content-layer terminal-box">
      <h2 className="slide-title mb-6 border-b border-gray-700 pb-2">:// NODOS_OPERADORES (CRÉDITOS)</h2>
      <div className="credits-list">
        {team.map(m => (
          <div key={m.id} className="credit-item">
            <span className="credit-name">{m.name}</span>
            <span className="credit-dni">DNI: {m.id}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button onClick={onExit} className="btn btn-secondary">[ VOLVER AL MENÚ ]</button>
      </div>
    </div>
  );
}

// ─── Presentation ──────────────────────────────────────────────────────────────
function PresentationMode({ onExit }) {
  const slides = [
    {
      title: "0x01: DEFINICIÓN",
      content: "El sistema Binario Natural es la codificación digital fundamental donde los valores numéricos se representan mediante dos estados físicos: tensión alta (1) y tensión baja (0). Es un sistema 'sin signo', todos los bits representan magnitud absoluta.",
      details: "Se basa estrictamente en el álgebra de Boole. A diferencia del sistema decimal (base 10), este funciona en Base 2.",
      example: "Analogía física: Un banco de interruptores.",
      ascii: `
 [ESTADO FÍSICO] -> [LÓGICA]
      ___
     |   | OFF   ->   0
     |___|
      ___
     | X | ON    ->   1
     |___|
      `,
    },
    {
      title: "0x02: USO DEL CÓDIGO",
      content: "Es el lenguaje nativo del hardware. Se utiliza para el direccionamiento de celdas de memoria RAM, ejecución de operaciones lógicas en la ALU y control de registros del procesador.",
      details: "Define la 'palabra' del sistema (ej. procesadores de 64-bit).",
      example: "Caso Real: Representación de color RGB. Cada canal usa 8 bits para 256 niveles.",
      ascii: `
 CPU REGISTER (8-bit)
 +-------------------------------+
 | 1 | 0 | 0 | 1 | 1 | 1 | 0 | 0 |
 +-------------------------------+
 MSB                           LSB
 (Most Significant) (Least Significant)
      `,
    },
    {
      title: "0x03: TABLA DE PESOS",
      content: (
        <>
          Es un sistema posicional. Cada bit tiene un peso intrínseco determinado por{' '}
          <InlineMath math="2^n" />, donde <InlineMath math="n" /> es la posición de derecha a
          izquierda, comenzando desde 0.
        </>
      ),
      details: { text1: "El rango dinámico para ", math: "n", text2: " bits se calcula con la fórmula ", formula: "[0, 2^n - 1]" },
      example: {
        text: "Tabla posicional para 4 bits y formación del número 13:",
        formula: "1101_2 = (1 \\times 8) + (1 \\times 4) + (0 \\times 2) + (1 \\times 1) = 13_{10}",
      },
      ascii: `
 POTENCIA: |  2³ |  2² |  2¹ |  2⁰ |
 ----------+-----+-----+-----+-----+
 PESO DEC: |  8  |  4  |  2  |  1  |
 ----------+-----+-----+-----+-----+
 BITS (13):|  1  |  1  |  0  |  1  |
 ----------+-----+-----+-----+-----+
      `,
    },
    {
      title: "0x04: CASO PRÁCTICO: MEMORIA",
      content: "El binario natural permite a la CPU identificar y acceder a ubicaciones físicas únicas en un chip de silicio de manera determinista.",
      details: "Un bus de direcciones de 4 bits mapea exactamente 16 celdas de memoria.",
      example: "Punteros de Memoria: Si la CPU envía la instrucción a '1010', el decodificador activa el hardware de esa celda.",
      ascii: `
 BUS DE DIRECCIONES -> RAM MEMORY
 [1000] -------------> [ CELL 08 ]
 [1001] -------------> [ CELL 09 ]
 [1010] ==(ACTIVO)===> [ CELL 10 ] (DATA I/O)
 [1011] -------------> [ CELL 11 ]
      `,
    },
    {
      title: "0x05: VENTAJAS",
      content: "Proporciona la máxima eficiencia de hardware y velocidad de procesamiento a nivel de silicio, superando a representaciones intermedias como BCD o Gray.",
      details: "No requiere puertas lógicas adicionales para decodificar signos, optimizando la densidad de transistores.",
      example: "Comparativa de compresión de datos:",
      ascii: `
 DATO: "15"

 BCD (Binary-Coded Decimal):
 [0001] [0101] -> Requiere 8 bits

 BINARIO NATURAL:
 [1111]        -> Requiere 4 bits
 (Ahorro del 50% de espacio)
      `,
    },
    {
      title: "0x06: DESVENTAJAS",
      content: "Carece de soporte nativo para números negativos (requiere Complemento a 2) o fracciones (requiere coma flotante). Es vulnerable a fallos de hardware.",
      details: "Alta sensibilidad (bit-flips): La alteración de un solo bit por radiación electromagnética corrompe el dato completo sin forma nativa de detectarlo.",
      example: "Riesgo Crítico: Desbordamiento (Overflow). Sumar más del límite reinicia el contador físico.",
      ascii: `
 OVERFLOW EXCEPTION:
   [1] [1] [1] (Valor 7)
 +         [1] (Suma 1)
 --------------
   [0] [0] [0] (Colapso a 0)
 ^
 |__ ¡Bit perdido por falta de espacio!
      `,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  return (
    <div className="presentation-container fade-in content-layer terminal-box">
      <div className="slide-header">
        <h2 className="slide-title">{slide.title}</h2>
        <span className="slide-indicator">NODO [{currentSlide + 1}/6]</span>
      </div>
      <div className="slide-body">
        <p className="slide-content terminal-text mb-2">{slide.content}</p>
        {slide.ascii && <pre className="ascii-art terminal-box">{slide.ascii}</pre>}
        <div className="slide-details-wrapper mt-2">
          <p className="slide-content terminal-text text-gray-400">
            <strong>[INFO]:</strong>{' '}
            {typeof slide.details === 'object' ? (
              <>
                {slide.details.text1}
                <InlineMath math={slide.details.math} />
                {slide.details.text2}
                <InlineMath math={slide.details.formula} />
              </>
            ) : slide.details}
          </p>
          <div className="mt-1 text-gray-400">
            {typeof slide.example === 'object' ? (
              <>
                <p className="slide-content terminal-text"><strong>[EJEMPLO]:</strong> {slide.example.text}</p>
                <BlockMath math={slide.example.formula} />
              </>
            ) : (
              <p className="slide-content terminal-text"><strong>[EJEMPLO]:</strong> {slide.example}</p>
            )}
          </div>
        </div>
      </div>
      <div className="presentation-controls">
        <button disabled={currentSlide === 0}                  onClick={() => setCurrentSlide(p => p - 1)} className="btn btn-secondary">&lt; ANTERIOR</button>
        <button onClick={onExit} className="btn-text-danger-strong">[ ABORTAR ]</button>
        <button disabled={currentSlide === slides.length - 1}  onClick={() => setCurrentSlide(p => p + 1)} className="btn btn-primary">SIGUIENTE &gt;</button>
      </div>
    </div>
  );
}

// ─── Game ──────────────────────────────────────────────────────────────────────
function GameMode({ onExit, updateGlobalTime, globalVolume }) {
  const [targets,   setTargets]   = useState([...TARGET_NUMBERS]);
  const [completed, setCompleted] = useState([]);
  const [timeLeft,  setTimeLeft]  = useState(GAME_TIME);
  const [isPlaying, setIsPlaying] = useState(true);
  const [board,     setBoard]     = useState([null, null, null, null]);
  const [fallingBit, setFallingBit] = useState(null);
  // Flash feedback when a number is decoded successfully
  const [flashMsg,  setFlashMsg]  = useState(null);

  const bgmRef          = useRef(new Audio(gameost));
  const landedBitRef    = useRef(null);
  // FIX: ref tracks fast-fall state — avoids adding fallingBit to interval deps
  const isFastFallingRef = useRef(false);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // ── Audio ──────────────────────────────────────────────────────────────
  const playSfx = useCallback((src) => {
    const sfx = new Audio(src);
    sfx.volume = globalVolume;
    sfx.play().catch(() => {});
  }, [globalVolume]);

  useEffect(() => {
    const bgm = bgmRef.current;
    bgm.loop = true;
    bgm.volume = globalVolume;
    if (isPlaying) bgm.play().catch(() => {});
    else bgm.pause();
    return () => { bgm.pause(); bgm.currentTime = 0; };
  }, [isPlaying, globalVolume]);

  // Sync matrix color
  useEffect(() => { updateGlobalTime(timeLeft); }, [timeLeft, updateGlobalTime]);

  // ── Smart bit generation — always solvable ─────────────────────────────
  const generateSmartBit = useCallback((currentBoard, currentTargets) => {
    if (currentTargets.length === 0) return null;

    // Find targets still compatible with the bits already on the board
    const compatible = currentTargets.filter(target => {
      const bits = getBits(target);
      return currentBoard.every((b, i) => b === null || b === bits[i]);
    });

    // FIX: if no compatible target exists the board is a dead-end — signal reset
    if (compatible.length === 0) return { resetBoard: true };

    // Pick a random compatible target and drop the correct bit for one empty column
    const target     = compatible[Math.floor(Math.random() * compatible.length)];
    const targetBits = getBits(target);
    const emptyCols  = [0, 1, 2, 3].filter(i => currentBoard[i] === null);
    if (emptyCols.length === 0) return null; // board is full, shouldn't reach here

    const col = emptyCols[Math.floor(Math.random() * emptyCols.length)];
    return { value: targetBits[col], col, y: 0 };
  }, []);

  // Spawn next bit (or reset board silently when stuck)
  useEffect(() => {
    if (fallingBit !== null || !isPlaying) return;

    const result = generateSmartBit(board, targets);
    if (!result) return;

    if (result.resetBoard) {
      // Board is incompatible with remaining targets — quietly clear and retry
      setBoard([null, null, null, null]);
      return; // board state change re-triggers this effect with a clean board
    }

    setFallingBit(result);
  }, [fallingBit, isPlaying, board, targets, generateSmartBit]);

  // ── Landing handler ────────────────────────────────────────────────────
  const handleBitLanding = useCallback((bit) => {
    playSfx(inputost);
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      newBoard[bit.col] = bit.value;

      if (!newBoard.includes(null)) {
        // All 4 slots filled — evaluate the binary number
        const val = (newBoard[0] * 8) + (newBoard[1] * 4) + (newBoard[2] * 2) + (newBoard[3] * 1);
        setTargets(prev => {
          if (prev.includes(val)) {
            const next = prev.filter(t => t !== val);
            setCompleted(c => [...c, val]);
            // Flash feedback
            setFlashMsg(`+${val} DECODIFICADO`);
            setTimeout(() => setFlashMsg(null), 900);
            if (next.length === 0) {
              setIsPlaying(false);
              playSfx(victoryost);
            }
            return next;
          }
          // Wrong value — board clears silently, no penalty
          return prev;
        });
        return [null, null, null, null];
      }
      return newBoard;
    });
  }, [playSfx]);

  // ── FIX: Constant-speed fall interval — NO fallingBit in deps ──────────
  //    Previously fallingBit was in deps, causing the interval to reset on
  //    every single tick. Now it's stable for the entire playing session.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setFallingBit(prev => {
        if (!prev) return null;
        const step = isFastFallingRef.current ? FAST_FALL_STEP : NORMAL_FALL_STEP;
        const newY = prev.y + step;
        if (newY >= 90) {
          landedBitRef.current = { ...prev }; // mark landing without side-effects
          return null;
        }
        return { ...prev, y: newY };
      });
    }, FALL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying]); // stable — intentionally no fallingBit dep

  // Process landing in a separate effect once fallingBit becomes null
  useEffect(() => {
    if (fallingBit === null && landedBitRef.current) {
      const landed = landedBitRef.current;
      landedBitRef.current = null;
      handleBitLanding(landed);
    }
  }, [fallingBit, handleBitLanding]);

  // ── Movement ───────────────────────────────────────────────────────────
  const moveLeft  = useCallback(() => setFallingBit(p => p ? { ...p, col: Math.max(0, p.col - 1) } : null), []);
  const moveRight = useCallback(() => setFallingBit(p => p ? { ...p, col: Math.min(3, p.col + 1) } : null), []);

  // ── Keyboard — ArrowDown held = fast fall, released = normal ──────────
  useEffect(() => {
    if (!isPlaying) return;
    const onDown = (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); moveLeft();  }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); isFastFallingRef.current = true; }
    };
    const onUp = (e) => {
      if (e.key === 'ArrowDown') isFastFallingRef.current = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
      isFastFallingRef.current = false; // reset on game-over / exit
    };
  }, [isPlaying, moveLeft, moveRight]);

  // ── Countdown timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          playSfx(loseost);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, playSfx]);

  // ── Helpers for display ────────────────────────────────────────────────
  // Show the decimal value of whatever is currently on the board (partial or full)
  const partialValue = board.reduce((acc, b, i) => {
    if (b === null) return acc;
    return acc + b * [8, 4, 2, 1][i];
  }, 0);
  const filledCount = board.filter(b => b !== null).length;

  return (
    <div className="game-layout fade-in content-layer">
      <button onClick={onExit} className="btn-exit-game">[X] SALIR AL MENÚ</button>

      <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        <div className="game-board terminal-box" style={{ flex: 'unset', width: '100%' }}>

          {/* Header */}
          <div className="game-header">
            <span className="timer blink dynamic-text">T-{timeLeft}s</span>
            {/* Live partial board value */}
            <span className="dynamic-text board-live-val">
              {filledCount > 0 ? `[${board.map(b => b ?? '_').join('')}] = ${partialValue}` : '[____]'}
            </span>
            <span className="counter dynamic-text">NODOS: {targets.length}/16</span>
          </div>

          {/* Flash feedback */}
          {flashMsg && (
            <div className="flash-msg dynamic-text">{flashMsg}</div>
          )}

          {/* Fall area */}
          <div className="falling-area">
            {isPlaying && fallingBit && (
              <div
                className="falling-bit"
                style={{ left: `${fallingBit.col * 25}%`, top: `${fallingBit.y}%` }}
              >
                <div className="bit-box">{fallingBit.value}</div>
              </div>
            )}
          </div>

          {/* Receptors */}
          <div className="receptors-area">
            {[8, 4, 2, 1].map((peso, index) => (
              <div key={peso} className="receptor-col">
                <span className="peso-label">×{peso}</span>
                <div className={`receptor-box ${board[index] !== null ? 'receptor-filled' : ''}`}>
                  {board[index] !== null
                    ? <span className="filled-bit">{board[index]}</span>
                    : <span className="empty-bit">_</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Game-over overlay */}
          {!isPlaying && (
            <div className="game-over-screen terminal-box">
              <h2 className={targets.length === 0 ? 'win-text' : 'lose-text'}>
                {targets.length === 0 ? '✓ SYSTEM_OVERRIDE_SUCCESS' : '✗ SYSTEM_FAILURE'}
              </h2>
              <p style={{ color: '#aaa', marginTop: '1rem', fontSize: '0.95rem', letterSpacing: 1 }}>
                DECODIFICADOS: {completed.length} / 16
              </p>
              {targets.length > 0 && (
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  PENDIENTES: {targets.join(', ')}
                </p>
              )}
              <button onClick={onExit} className="btn mt-6 p-4">[ REINICIAR_SISTEMA ]</button>
            </div>
          )}
        </div>

        {/* Mobile controls — ▼ triggers fast-fall while held */}
        {isPlaying && isTouchDevice && (
          <div className="mobile-controls" style={{ display: 'flex', marginTop: '1rem' }}>
            <button onPointerDown={moveLeft}  className="mobile-btn terminal-box">&lt;</button>
            <button
              onPointerDown={()  => { isFastFallingRef.current = true;  }}
              onPointerUp={()    => { isFastFallingRef.current = false; }}
              onPointerLeave={()  => { isFastFallingRef.current = false; }}
              className="mobile-btn terminal-box"
            >▼</button>
            <button onPointerDown={moveRight} className="mobile-btn terminal-box">&gt;</button>
          </div>
        )}
      </div>

      {/* Side panel */}
      <div className="side-panel">
        <div className="array-card terminal-box">
          <h3 className="array-title targets-title"># TARGET_HASHES</h3>
          <div className="array-grid">
            {targets.map(num => (
              <span key={num} className="array-item item-target" title={`${getBits(num).join('')}`}>
                {num}
              </span>
            ))}
          </div>
        </div>
        <div className="array-card terminal-box">
          <h3 className="array-title completed-title"># DECODIFICADOS</h3>
          <div className="array-grid">
            {completed.map(num => (
              <span key={num} className="array-item item-completed">{num}</span>
            ))}
          </div>
        </div>

        {/* Controls hint */}
        <div className="controls-hint terminal-box">
          <p>← → mover bit</p>
          <p>↓ caída rápida</p>
          <p>Hover target: ver binario</p>
        </div>
      </div>
    </div>
  );
}