import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './App.css';
import gameost from './ost/game.mp3';
import inputost from './ost/input.mp3';
import loseost from './ost/lose.mp3';
import victoryost from './ost/victory.mp3';
//import menuost from './ost/menu.mp3';

const TARGET_NUMBERS = Array.from({ length: 16 }, (_, i) => i);
const GAME_TIME = 50; 
const INITIAL_FALL_SPEED = 30;

function MatrixBackground({ timeLeft, totalTime }) {
  const canvasRef = useRef(null);
  const timeRef = useRef(timeLeft);

  useEffect(() => { timeRef.current = timeLeft; }, [timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン0123456789';
    const letters = katakana.split('');
    const fontSize = 18;
    let columns = canvas.width / fontSize;
    let drops = Array.from({ length: columns }).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 2, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const dangerRatio = 1 - (timeRef.current / totalTime); 
      const r = Math.min(255, Math.floor(dangerRatio * 255 * 2));
      const g = Math.max(0, Math.floor((1 - dangerRatio) * 255 * 1.5));
      ctx.fillStyle = `rgb(${r}, ${g}, 0)`; 
      ctx.font = fontSize + 'px "Share Tech Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 35);
    return () => { clearInterval(interval); window.removeEventListener('resize', resizeCanvas); };
  }, [totalTime]);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

export default function BinaryPresentationApp() {
  const [mode, setMode] = useState('menu'); 
  const [timeLeftGlobal, setTimeLeftGlobal] = useState(GAME_TIME);
  const [globalVolume, setGlobalVolume] = useState(0.4); 
  /*const menuBgmRef = useRef(new Audio(menuost));

  useEffect(() => {
    const bgm = menuBgmRef.current;
    bgm.loop = true;
    bgm.volume = globalVolume;
    if (mode === 'menu') bgm.play().catch(() => {});
    else { bgm.pause(); bgm.currentTime = 0; }
  }, [mode, globalVolume]); */

  const dangerRatio = 1 - (timeLeftGlobal / GAME_TIME);
  const r = Math.min(255, Math.floor(dangerRatio * 255 * 2));
  const g = Math.max(0, Math.floor((1 - dangerRatio) * 255 * 1.2));
  
  const dynamicStyle = {
    '--primary-color': `rgb(${r}, ${g}, 0)`,
    '--border-color': `rgba(${r}, ${g}, 0, 0.6)`,
    '--shadow-glow': `0 0 ${10 + (dangerRatio * 20)}px rgba(${r}, ${g}, 0, ${0.4 + (dangerRatio * 0.4)})`
  };

  let glitchClass = mode === 'game' ? (dangerRatio > 0.8 ? 'glitch-extreme' : dangerRatio > 0.5 ? 'glitch-heavy' : dangerRatio > 0.3 ? 'glitch-light' : '') : '';

  const volBars = Math.round(globalVolume * 10);
  const volumeVisual = '[' + '|'.repeat(volBars) + '.'.repeat(10 - volBars) + ']';

  return (
    <>
      <MatrixBackground timeLeft={timeLeftGlobal} totalTime={GAME_TIME} />
      <div className={`app-container ${glitchClass}`} style={dynamicStyle}>
        <div className="scanline"></div> 
        
        {/* Barra de volumen solo en el juego */}
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
              <button onClick={() => setMode('game')} className="btn btn-primary">[ EJECUTAR_SIMULADOR ]</button>
              <button onClick={() => setMode('credits')} className="btn btn-secondary">[ CREDITOS ]</button>
            </div>
          </div>
        )}

        {mode === 'credits' && <CreditsMode onExit={() => setMode('menu')} />}
        {mode === 'presentation' && <PresentationMode onExit={() => setMode('menu')} />}
        {mode === 'game' && (
          <GameMode 
            onExit={() => { setMode('menu'); setTimeLeftGlobal(GAME_TIME); }} 
            updateGlobalTime={setTimeLeftGlobal} 
            globalVolume={globalVolume}
          />
        )}
      </div>
    </>
  );
}

// --- MODO CRÉDITOS ---
function CreditsMode({ onExit }) {
  const team = [
    { name: "Cruz Segovia Lautaro Ismael", id: "47082972" },
    { name: "Vedia Lautaro Agustin", id: "47316562" },
    { name: "Tiziana Florencia Gallardo", id: "48142456" },
    { name: "Luciano Alberto Fernández", id: "48142006" },
    { name: "Lucila Giuliana Rocco", id: "44281509" },
    { name: "Agustin Nicolas Zerpa", id: "47316999" }
  ];

  return (
    <div className="presentation-container fade-in content-layer terminal-box">
      <h2 className="slide-title mb-6 border-b border-gray-700 pb-2">:// NODOS_OPERADORES (CRÉDITOS)</h2>
      
      <div className="credits-list">
        {team.map(member => (
          <div key={member.id} className="credit-item">
            <span className="credit-name">{member.name}</span>
            <span className="credit-dni">DNI: {member.id}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={onExit} className="btn btn-secondary">[ VOLVER AL MENÚ ]</button>
      </div>
    </div>
  );
}

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
      `
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
      `
    },
    {
      title: "0x03: TABLA DE PESOS",
      content: (
        <>
          Es un sistema posicional. Cada bit tiene un peso intrínseco determinado por <InlineMath math="2^n" />, 
          donde <InlineMath math="n" /> es la posición de derecha a izquierda, comenzando desde 0.
        </>
      ),
      details: {
        text1: "El rango dinámico para ", math: "n", text2: " bits se calcula con la fórmula ", formula: "[0, 2^n - 1]"
      },
      example: {
        text: "Tabla posicional para 4 bits y formación del número 13:",
        formula: "1101_2 = (1 \\times 8) + (1 \\times 4) + (0 \\times 2) + (1 \\times 1) = 13_{10}"
      },
      ascii: `
 POTENCIA: |  2³ |  2² |  2¹ |  2⁰ |
 ----------+-----+-----+-----+-----+
 PESO DEC: |  8  |  4  |  2  |  1  |
 ----------+-----+-----+-----+-----+
 BITS (13):|  1  |  1  |  0  |  1  |
 ----------+-----+-----+-----+-----+
      `
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
      `
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
      `
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
      `
    }
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="presentation-container fade-in content-layer terminal-box">
      <div className="slide-header">
        <h2 className="slide-title">{slides[currentSlide].title}</h2>
        <span className="slide-indicator">NODO [{currentSlide + 1}/6]</span>
      </div>
      <div className="slide-body">
        <p className="slide-content terminal-text mb-2">{slides[currentSlide].content}</p>
        {slides[currentSlide].ascii && (
          <pre className="ascii-art terminal-box">{slides[currentSlide].ascii}</pre>
        )}
        <div className="slide-details-wrapper mt-2">
          <p className="slide-content terminal-text text-gray-400">
            <strong>[INFO]:</strong>{' '}
            {typeof slides[currentSlide].details === 'object' ? (
              <>
                {slides[currentSlide].details.text1}
                <InlineMath math={slides[currentSlide].details.math} />
                {slides[currentSlide].details.text2}
                <InlineMath math={slides[currentSlide].details.formula} />
              </>
            ) : slides[currentSlide].details}
          </p>
          <div className="mt-1 text-gray-400">
            {typeof slides[currentSlide].example === 'object' ? (
              <>
                <p className="slide-content terminal-text"><strong>[EJEMPLO]:</strong> {slides[currentSlide].example.text}</p>
                <BlockMath math={slides[currentSlide].example.formula} />
              </>
            ) : <p className="slide-content terminal-text"><strong>[EJEMPLO]:</strong> {slides[currentSlide].example}</p>}
          </div>
        </div>
      </div>
      <div className="presentation-controls">
        <button disabled={currentSlide === 0} onClick={() => setCurrentSlide(prev => prev - 1)} className="btn btn-secondary">&lt; ANTERIOR</button>
        <button onClick={onExit} className="btn-text-danger-strong">[ ABORTAR ]</button>
        <button disabled={currentSlide === slides.length - 1} onClick={() => setCurrentSlide(prev => prev + 1)} className="btn btn-primary">SIGUIENTE &gt;</button>
      </div>
    </div>
  );
}

const OST_JUEGO = gameost; 
const SFX_COLOCAR_BIT = inputost;
const SFX_GANAR = victoryost;
const SFX_PERDER = loseost;

function GameMode({ onExit, updateGlobalTime, globalVolume }) {
  const [targets, setTargets] = useState([...TARGET_NUMBERS]);
  const [completed, setCompleted] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isPlaying, setIsPlaying] = useState(true);
  const [board, setBoard] = useState([null, null, null, null]); 
  const [fallingBit, setFallingBit] = useState(null); 
  const bgmRef = useRef(new Audio(OST_JUEGO));
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // FIX: ref para comunicar el aterrizaje fuera del state updater puro
  const landedBitRef = useRef(null);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
  }, []);

  const playSfx = useCallback((rutaAudio) => {
    const sfx = new Audio(rutaAudio);
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

  useEffect(() => { updateGlobalTime(timeLeft); }, [timeLeft, updateGlobalTime]);

  const generateSmartBit = useCallback((currentBoard, currentTargets) => {
    if (currentTargets.length === 0) return { value: Math.random() > 0.5 ? 1 : 0, col: 1, y: 0 };
    const possibleTargets = currentTargets.filter(target => {
      const tBits = [(target & 8) ? 1 : 0, (target & 4) ? 1 : 0, (target & 2) ? 1 : 0, (target & 1) ? 1 : 0];
      return currentBoard.every((boardBit, idx) => boardBit === null || boardBit === tBits[idx]);
    });
    if (possibleTargets.length === 0) {
      const emptyCols = [0, 1, 2, 3].filter(i => currentBoard[i] === null);
      const col = emptyCols.length > 0 ? emptyCols[Math.floor(Math.random() * emptyCols.length)] : 1;
      return { value: Math.random() > 0.5 ? 1 : 0, col, y: 0 };
    }
    const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    const targetBits = [(target & 8) ? 1 : 0, (target & 4) ? 1 : 0, (target & 2) ? 1 : 0, (target & 1) ? 1 : 0];
    const availableCols = [0, 1, 2, 3].filter(i => currentBoard[i] === null);
    let colToDrop = availableCols[Math.floor(Math.random() * availableCols.length)];
    return { value: targetBits[colToDrop], col: colToDrop, y: 0 };
  }, []);

  useEffect(() => {
    if (fallingBit === null && isPlaying) setFallingBit(generateSmartBit(board, targets));
  }, [fallingBit, isPlaying, board, targets, generateSmartBit]);

  // FIX: handleBitLanding en useCallback para evitar stale closure en el interval
  const handleBitLanding = useCallback((bit) => {
    playSfx(SFX_COLOCAR_BIT);
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      newBoard[bit.col] = bit.value;
      if (!newBoard.includes(null)) {
        const decimalValue = (newBoard[0] * 8) + (newBoard[1] * 4) + (newBoard[2] * 2) + (newBoard[3] * 1);
        setTargets(currentTargets => {
          if (currentTargets.includes(decimalValue)) {
            const newTargets = currentTargets.filter(t => t !== decimalValue);
            setCompleted(prevComp => [...prevComp, decimalValue]);
            if (newTargets.length === 0) {
              setIsPlaying(false);
              playSfx(SFX_GANAR);
            }
            return newTargets;
          }
          return currentTargets;
        });
        return [null, null, null, null];
      }
      return newBoard;
    });
  }, [playSfx]);

  const moveLeft = useCallback(() => { if (!isPlaying) return; setFallingBit(prev => prev ? { ...prev, col: Math.max(0, prev.col - 1) } : null); }, [isPlaying]);
  const moveRight = useCallback(() => { if (!isPlaying) return; setFallingBit(prev => prev ? { ...prev, col: Math.min(3, prev.col + 1) } : null); }, [isPlaying]);
  const dropDown = useCallback(() => { if (!isPlaying) return; setFallingBit(prev => prev ? { ...prev, y: Math.min(90, prev.y + 15) } : null); }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowDown') dropDown();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, dropDown]);

  // FIX: el state updater ahora es puro: solo actualiza posición o marca aterrizaje en el ref
  useEffect(() => {
    if (!isPlaying || fallingBit === null) return;
    const currentSpeed = Math.max(5, INITIAL_FALL_SPEED - (GAME_TIME - timeLeft) * 0.8);
    const interval = setInterval(() => {
      setFallingBit(prev => {
        if (!prev) return null;
        if (prev.y >= 90) {
          landedBitRef.current = prev; // marcar aterrizaje sin side effects
          return null;
        }
        return { ...prev, y: prev.y + 2 };
      });
    }, currentSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, fallingBit, timeLeft]);

  // FIX: efecto separado para procesar el aterrizaje una vez que fallingBit es null
  useEffect(() => {
    if (fallingBit === null && landedBitRef.current) {
      const landed = landedBitRef.current;
      landedBitRef.current = null;
      handleBitLanding(landed);
    }
  }, [fallingBit, handleBitLanding]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { setIsPlaying(false); playSfx(SFX_PERDER); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, playSfx]);

  return (
    <div className="game-layout fade-in content-layer">
      <button onClick={onExit} className="btn-exit-game">[X] SALIR AL MENÚ</button>
      
      {/* --- NUEVO CONTENEDOR: Mantiene el tablero y las flechas apilados --- */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        
        {/* Le sacamos el flex original al tablero para que no pelee por espacio */}
        <div className="game-board terminal-box" style={{ flex: 'unset', width: '100%' }}>
          <div className="game-header">
            <span className="timer blink dynamic-text">T-{timeLeft}s</span>
            <span className="counter dynamic-text">NODOS: {targets.length}</span>
          </div>
          <div className="falling-area">
             {isPlaying && fallingBit && (
              <div className="falling-bit" style={{ left: `${fallingBit.col * 25}%`, top: `${fallingBit.y}%` }}>
                <div className="bit-box">{fallingBit.value}</div>
              </div>
             )}
          </div>
          <div className="receptors-area">
            {[8, 4, 2, 1].map((peso, index) => (
              <div key={peso} className="receptor-col">
                <span className="peso-label">x{peso}</span>
                <div className="receptor-box">
                  {board[index] !== null ? <span className="filled-bit">{board[index]}</span> : <span className="empty-bit">_</span>}
                </div>
              </div>
            ))}
          </div>
          {!isPlaying && (
            <div className="game-over-screen terminal-box">
              <h2 className={targets.length === 0 ? 'win-text' : 'lose-text'}>
                {targets.length === 0 ? 'SYSTEM_OVERRIDE_SUCCESS' : 'SYSTEM_FAILURE'}
              </h2>
              <button onClick={onExit} className="btn mt-6 p-4">REINICIAR_SISTEMA</button>
            </div>
          )}
        </div>

        {/* Las flechas ahora viven abajo del tablero, dentro de la misma columna */}
        {isPlaying && isTouchDevice && (
          <div className="mobile-controls" style={{ display: 'flex', marginTop: '1rem' }}>
            <button onPointerDown={moveLeft} className="mobile-btn terminal-box">&lt;</button>
            <button onPointerDown={dropDown} className="mobile-btn terminal-box">v</button>
            <button onPointerDown={moveRight} className="mobile-btn terminal-box">&gt;</button>
          </div>
        )}

      </div>
      {/* --- FIN DEL CONTENEDOR --- */}

      <div className="side-panel">
        <div className="array-card terminal-box">
          <h3 className="array-title targets-title"># TARGET_HASHES</h3>
          <div className="array-grid">
            {targets.map(num => <span key={num} className="array-item item-target">{num}</span>)}
          </div>
        </div>
        <div className="array-card terminal-box">
          <h3 className="array-title completed-title"># DECODIFICADOS</h3>
          <div className="array-grid">
            {completed.map(num => <span key={num} className="array-item item-completed">{num}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}