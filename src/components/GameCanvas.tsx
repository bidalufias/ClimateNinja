import { useEffect, useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import { GameEngine, type GameCallbacks } from '../game/gameEngine';
import type { GameMode, PlayerState, PlayerResults } from '../types/game';
import CountdownOverlay from './CountdownOverlay';
import ChampionRoundEnd from './ChampionRoundEnd';
import ChallengerNameEntry from './ChallengerNameEntry';

interface GameCanvasProps {
  mode: GameMode;
  playerNames: string[];
  onStateUpdate: (players: PlayerState[], slowMo: boolean, frenzy: boolean) => void;
  onGameOver: (results: PlayerResults[], mode: GameMode) => void;
  onChallengerNameConfirmed: (index: number, name: string) => void;
  isPaused: boolean;
}

type Phase = 'countdown' | 'playing' | 'champion-round-end' | 'champion-name-entry' | 'champion-countdown';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function GameCanvas({ mode, playerNames, onStateUpdate, onGameOver, onChallengerNameConfirmed, isPaused }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const callbacksRef = useRef({ onStateUpdate, onGameOver });
  callbacksRef.current = { onStateUpdate, onGameOver };

  const [phase, setPhase] = useState<Phase>('countdown');
  const [championRound, setChampionRound] = useState<{
    winnerId: number;
    winnerStreak: number;
    winnerSide: 'left' | 'right';
    winnerScore: number;
  } | null>(null);

  const handleChampionRoundEnd = useCallback((winnerId: number, winnerStreak: number, winnerSide: 'left' | 'right', winnerScore: number) => {
    setChampionRound({ winnerId, winnerStreak, winnerSide, winnerScore });
    setPhase('champion-round-end');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const callbacks: GameCallbacks = {
      onStateUpdate: (players, slowMo, frenzy) => callbacksRef.current.onStateUpdate(players, slowMo, frenzy),
      onGameOver: (results, m) => callbacksRef.current.onGameOver(results, m),
      onChampionRoundEnd: handleChampionRoundEnd,
    };

    const engine = new GameEngine(canvas, mode, callbacks, playerNames);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // playerNames intentionally omitted: name changes are synced via updatePlayerName
    // below, so we must not recreate the engine on every challenger name update or
    // the pending champion round state (pendingChallenger) will be lost.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, handleChampionRoundEnd]);

  // Sync player name changes to the engine without recreating it
  useEffect(() => {
    if (!engineRef.current) return;
    playerNames.forEach((name, i) => {
      engineRef.current?.updatePlayerName(i, name);
    });
  }, [playerNames]);

  useEffect(() => {
    if (!engineRef.current) return;
    if (phase !== 'playing') return;
    if (isPaused) {
      engineRef.current.pause();
    } else {
      engineRef.current.resume();
    }
  }, [isPaused, phase]);

  const handleInitialCountdownDone = useCallback(() => {
    setPhase('playing');
    engineRef.current?.start();
  }, []);

  const handleNextChallenger = useCallback(() => {
    setPhase('champion-name-entry');
  }, []);

  const handleChallengerNameEntry = useCallback((name: string) => {
    if (!championRound) return;
    const challengerIndex = championRound.winnerSide === 'left' ? 1 : 0;
    engineRef.current?.updatePlayerName(challengerIndex, name);
    onChallengerNameConfirmed(challengerIndex, name);
    setPhase('champion-countdown');
  }, [championRound, onChallengerNameConfirmed]);

  const handleChampionCountdownDone = useCallback(() => {
    setPhase('playing');
    setChampionRound(null);
    engineRef.current?.startNextChampionRound();
  }, []);

  const challengerIndex = championRound
    ? championRound.winnerSide === 'left' ? 1 : 0
    : 0;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'crosshair',
        userSelect: 'none',
        touchAction: 'none',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {phase === 'countdown' && (
        <CountdownOverlay onDone={handleInitialCountdownDone} />
      )}

      {phase === 'champion-round-end' && championRound && (
        <ChampionRoundEnd
          winnerId={championRound.winnerId}
          winnerStreak={championRound.winnerStreak}
          winnerSide={championRound.winnerSide}
          winnerScore={championRound.winnerScore}
          onNextChallenger={handleNextChallenger}
        />
      )}

      {phase === 'champion-name-entry' && (
        <ChallengerNameEntry
          challengerIndex={challengerIndex}
          onConfirm={handleChallengerNameEntry}
        />
      )}

      {phase === 'champion-countdown' && (
        <CountdownOverlay onDone={handleChampionCountdownDone} />
      )}
    </Box>
  );
}
