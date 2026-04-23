'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type GamePhase = 'idle' | 'running' | 'gameover';

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

const HIGH_SCORE_KEY = 'cnc_car_runner_high_score';
const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 180;
const GROUND_Y = 142;
const CAR_X = 48;
const CAR_WIDTH = 46;
const CAR_HEIGHT = 22;
const GRAVITY = 1700;
const JUMP_FORCE = 620;

/**
 * Draws a rounded rectangle used by the mini-game renderer.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Renders a footer mini-game where a car jumps over incoming obstacles.
 */
export function CarRunnerMiniGame(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<GamePhase>('idle');
  const jumpHeightRef = useRef(0);
  const jumpVelocityRef = useRef(0);
  const scoreRef = useRef(0);
  const displayScoreRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const spawnTimerRef = useRef(0);

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Syncs React game phase into a mutable ref for animation-loop access.
   */
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /**
   * Loads persisted local high score once the component mounts.
   */
  useEffect(() => {
    const persisted = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (!persisted) {
      return;
    }

    const parsed = Number.parseInt(persisted, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setHighScore(parsed);
    }
  }, []);

  /**
   * Saves a new high score to local storage and React state.
   */
  const persistHighScore = useCallback((value: number): void => {
    setHighScore(value);
    window.localStorage.setItem(HIGH_SCORE_KEY, String(value));
  }, []);

  /**
   * Resets all game-loop refs to start a new run.
   */
  const resetRun = useCallback((): void => {
    jumpHeightRef.current = 0;
    jumpVelocityRef.current = 0;
    obstaclesRef.current = [];
    spawnTimerRef.current = 0.8;
    scoreRef.current = 0;
    displayScoreRef.current = 0;
    setScore(0);
  }, []);

  /**
   * Starts a new game from idle or game-over state.
   */
  const startGame = useCallback((): void => {
    resetRun();
    setPhase('running');
  }, [resetRun]);

  /**
   * Opens the mini-game panel and starts a fresh run.
   */
  const handleOpen = useCallback((): void => {
    setIsOpen(true);
    startGame();
  }, [startGame]);

  /**
   * Hides the mini-game panel and resets active run state.
   */
  const handleClose = useCallback((): void => {
    setIsOpen(false);
    setPhase('idle');
    resetRun();
  }, [resetRun]);

  /**
   * Applies jump input for keyboard, touch, and button controls.
   */
  const jump = useCallback((): void => {
    if (phaseRef.current !== 'running') {
      startGame();
      jumpVelocityRef.current = JUMP_FORCE;
      return;
    }

    if (jumpHeightRef.current > 1) {
      return;
    }

    jumpVelocityRef.current = JUMP_FORCE;
  }, [startGame]);

  /**
   * Finalizes game-over state and records high score if beaten.
   */
  const handleGameOver = useCallback((): void => {
    setPhase('gameover');
    const finalScore = displayScoreRef.current;
    if (finalScore > highScore) {
      persistHighScore(finalScore);
    }
  }, [highScore, persistHighScore]);

  /**
   * Advances obstacle and jump physics for one animation frame.
   */
  const stepSimulation = useCallback(
    (dt: number): void => {
      jumpVelocityRef.current -= GRAVITY * dt;
      jumpHeightRef.current += jumpVelocityRef.current * dt;

      if (jumpHeightRef.current < 0) {
        jumpHeightRef.current = 0;
        jumpVelocityRef.current = 0;
      }

      scoreRef.current += dt * 11;
      const nextScore = Math.floor(scoreRef.current);
      if (nextScore !== displayScoreRef.current) {
        displayScoreRef.current = nextScore;
        setScore(nextScore);
      }

      const speed = 240 + Math.min(displayScoreRef.current * 1.4, 120);

      spawnTimerRef.current -= dt;
      if (spawnTimerRef.current <= 0) {
        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 24,
          width: 18 + Math.random() * 24,
          height: 24 + Math.random() * 34,
        });

        const baseDelay = 0.9 + Math.random() * 0.7;
        spawnTimerRef.current = Math.max(0.42, baseDelay - displayScoreRef.current / 240);
      }

      obstaclesRef.current = obstaclesRef.current
        .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed * dt }))
        .filter((obstacle) => obstacle.x + obstacle.width > -5);

      const carTop = GROUND_Y - CAR_HEIGHT - jumpHeightRef.current;
      const collided = obstaclesRef.current.some((obstacle) => {
        const obstacleTop = GROUND_Y - obstacle.height;
        const xOverlap = CAR_X < obstacle.x + obstacle.width && CAR_X + CAR_WIDTH > obstacle.x;
        const yOverlap = carTop < obstacleTop + obstacle.height && carTop + CAR_HEIGHT > obstacleTop;
        return xOverlap && yOverlap;
      });

      if (collided) {
        handleGameOver();
      }
    },
    [handleGameOver],
  );

  /**
   * Draws the current game frame to canvas.
   */
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D): void => {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#111111');
    gradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(143, 188, 210, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      const y = 18 + i * 14;
      ctx.beginPath();
      ctx.moveTo(12 + i * 6, y);
      ctx.lineTo(CANVAS_WIDTH - 20 - i * 10, y + 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, GROUND_Y + 1, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    const carTop = GROUND_Y - CAR_HEIGHT - jumpHeightRef.current;

    ctx.fillStyle = '#2f2f2f';
    drawRoundedRect(ctx, CAR_X, carTop + 4, CAR_WIDTH, CAR_HEIGHT - 4, 6);
    ctx.fill();

    ctx.fillStyle = '#a3a3a3';
    drawRoundedRect(ctx, CAR_X + 8, carTop - 5, 24, 12, 4);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(CAR_X + 10, carTop + CAR_HEIGHT - 1, 5, 0, Math.PI * 2);
    ctx.arc(CAR_X + CAR_WIDTH - 10, carTop + CAR_HEIGHT - 1, 5, 0, Math.PI * 2);
    ctx.fill();

    for (const obstacle of obstaclesRef.current) {
      const obstacleTop = GROUND_Y - obstacle.height;
      ctx.fillStyle = '#525252';
      drawRoundedRect(ctx, obstacle.x, obstacleTop, obstacle.width, obstacle.height, 4);
      ctx.fill();
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(obstacle.x + 4, obstacleTop + 4, Math.max(4, obstacle.width - 8), 3);
    }

    ctx.fillStyle = '#d1d5db';
    ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(`Score: ${displayScoreRef.current}`, 18, 24);
    ctx.fillText(`Best: ${highScore}`, 18, 44);

    if (phaseRef.current === 'idle') {
      ctx.fillStyle = 'rgba(2, 8, 6, 0.62)';
      drawRoundedRect(ctx, 214, 58, 330, 64, 10);
      ctx.fill();
      ctx.fillStyle = '#d1d5db';
      ctx.font = '700 18px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText('Car Runner', 332, 84);
      ctx.font = '500 13px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText('Press Start or tap Jump to begin', 276, 105);
    }

    if (phaseRef.current === 'gameover') {
      ctx.fillStyle = 'rgba(2, 8, 6, 0.62)';
      drawRoundedRect(ctx, 230, 52, 296, 70, 10);
      ctx.fill();
      ctx.fillStyle = '#d4d4d8';
      ctx.font = '700 19px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText('Crash! Try again.', 312, 82);
      ctx.fillStyle = '#d1d5db';
      ctx.font = '500 13px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText('Hit Restart for another run', 304, 104);
    }
  }, [highScore]);

  /**
   * Runs the animation loop and binds keyboard controls for the mini-game.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let animationFrame = 0;
    let previousTime = performance.now();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        jump();
      }

      if (event.code === 'Enter' && phaseRef.current !== 'running') {
        event.preventDefault();
        startGame();
      }
    };

    const tick = (time: number): void => {
      const dt = Math.min(0.045, (time - previousTime) / 1000);
      previousTime = time;

      if (phaseRef.current === 'running') {
        stepSimulation(dt);
      }

      drawFrame(context);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [drawFrame, isOpen, jump, startGame, stepSimulation]);

  if (!isOpen) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-semibold text-white">Footer Mini-Game</h3>
            <p className="mt-1 text-xs text-white/65">Hidden by default. Tap to play Car Runner.</p>
          </div>
          <button
            type="button"
            onClick={handleOpen}
            className="rounded-full bg-deepRed px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#303030]"
          >
            Play Mini-Game
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">Footer Mini-Game: Car Runner</h3>
          <p className="mt-1 text-xs text-white/65">Jump over cones while your score climbs. Space/Up/W or tap Jump.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-waterBlue/40 bg-waterBlue/10 px-3 py-1 text-waterBlue">Score {score}</span>
          <span className="rounded-full border border-white/20 px-3 py-1 text-white/80">Best {highScore}</span>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block h-[180px] w-full bg-black"
          aria-label="Car runner mini game"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10"
        >
          Hide
        </button>
        <button
          type="button"
          onClick={startGame}
          className="rounded-full bg-deepRed px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#303030]"
        >
          {phase === 'running' ? 'Restart' : 'Start'}
        </button>
        <button
          type="button"
          onClick={jump}
          className="rounded-full border border-waterBlue bg-waterBlue/15 px-4 py-2 text-xs font-semibold text-waterBlue transition hover:bg-waterBlue/25"
        >
          Jump
        </button>
      </div>
    </section>
  );
}
