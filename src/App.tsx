import { useState, useCallback, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import type { GameScreen, GameMode, PlayerState, PlayerResults } from './types/game';
import StartScreen from './components/StartScreen';
import NameEntryScreen from './components/NameEntryScreen';
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';
import GameOver from './components/GameOver';
import PauseMenu from './components/PauseMenu';
import Leaderboard from './components/Leaderboard';

const DEFAULT_PLAYERS: PlayerState[] = [];

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('modeselect');
  const prevScreenRef = useRef<GameScreen>('modeselect');
  const [gameMode, setGameMode] = useState<GameMode>('1p');
  const [gameKey, setGameKey] = useState(0);
  const [players, setPlayers] = useState<PlayerState[]>(DEFAULT_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [slowMo, setSlowMo] = useState(false);
  const [frenzy, setFrenzy] = useState(false);
  const [results, setResults] = useState<PlayerResults[]>([]);
  const [gameSpeed, setGameSpeed] = useState(1.0);

  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setPlayers(DEFAULT_PLAYERS);
    setSlowMo(false);
    setFrenzy(false);
    setResults([]);
    setScreen('nameentry');
  }, []);

  const handleNamesConfirmed = useCallback((names: string[]) => {
    setPlayerNames(names);
    setGameKey((k) => k + 1);
    setScreen('playing');
  }, []);

  const handleBackToModeSelect = useCallback(() => {
    setScreen('modeselect');
  }, []);

  const handlePause = useCallback(() => {
    setScreen('paused');
  }, []);

  const handleResume = useCallback(() => {
    setScreen('playing');
  }, []);

  const handleStateUpdate = useCallback((updatedPlayers: PlayerState[], updatedSlowMo: boolean, updatedFrenzy: boolean) => {
    setPlayers(updatedPlayers);
    setSlowMo(updatedSlowMo);
    setFrenzy(updatedFrenzy);
  }, []);

  const handleGameOver = useCallback((gameResults: PlayerResults[], _mode: GameMode) => {
    setResults(gameResults);
    setScreen('gameover');
  }, []);

  const handleChallengerNameConfirmed = useCallback((index: number, name: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPlayers(DEFAULT_PLAYERS);
    setSlowMo(false);
    setFrenzy(false);
    setResults([]);
    setGameKey((k) => k + 1);
    setScreen('playing');
  }, []);

  const handleLeaderboard = useCallback(() => {
    setScreen((current) => {
      prevScreenRef.current = current;
      return 'leaderboard';
    });
  }, []);

  const handleHome = useCallback(() => {
    setScreen('modeselect');
  }, []);

  const isPlaying = screen === 'playing';
  const isPaused = screen === 'paused';
  const isGameRunning = isPlaying || isPaused;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        {screen === 'modeselect' && (
          <Box
            key="modeselect"
            sx={{
              width: '100%', height: '100%', position: 'absolute', inset: 0,
              animation: 'screenEnter 0.25s ease',
              '@keyframes screenEnter': {
                from: { opacity: 0, transform: 'scale(0.97)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <StartScreen
              onSelectMode={handleSelectMode}
              onLeaderboard={handleLeaderboard}
              speed={gameSpeed}
              onSpeedChange={setGameSpeed}
            />
          </Box>
        )}

        {screen === 'nameentry' && (
          <Box
            key="nameentry"
            sx={{
              width: '100%', height: '100%', position: 'absolute', inset: 0,
              animation: 'screenEnter 0.25s ease',
              '@keyframes screenEnter': {
                from: { opacity: 0, transform: 'scale(0.97)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <NameEntryScreen
              mode={gameMode}
              onStart={handleNamesConfirmed}
              onBack={handleBackToModeSelect}
            />
          </Box>
        )}

        {isGameRunning && (
          <>
            <GameCanvas
              key={gameKey}
              mode={gameMode}
              playerNames={playerNames}
              onStateUpdate={handleStateUpdate}
              onGameOver={handleGameOver}
              onChallengerNameConfirmed={handleChallengerNameConfirmed}
              isPaused={isPaused}
              speed={gameSpeed}
            />
            <GameHUD
              players={players}
              playerNames={playerNames}
              mode={gameMode}
              slowMo={slowMo}
              frenzy={frenzy}
              onPause={handlePause}
            />
            {isPaused && (
              <PauseMenu onResume={handleResume} onQuit={handleHome} />
            )}
          </>
        )}

        {screen === 'gameover' && (
          <Box
            key="gameover"
            sx={{
              width: '100%', height: '100%', position: 'absolute', inset: 0,
              bgcolor: '#12213a',
              animation: 'screenEnter 0.25s ease',
              '@keyframes screenEnter': {
                from: { opacity: 0, transform: 'scale(0.97)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <GameOver
              results={results}
              mode={gameMode}
              playerNames={playerNames}
              onPlayAgain={handlePlayAgain}
              onLeaderboard={handleLeaderboard}
              onHome={handleHome}
            />
          </Box>
        )}

        {screen === 'leaderboard' && (
          <Box
            key="leaderboard"
            sx={{
              width: '100%', height: '100%', position: 'absolute', inset: 0,
              animation: 'screenEnter 0.25s ease',
              '@keyframes screenEnter': {
                from: { opacity: 0, transform: 'scale(0.97)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <Leaderboard onBack={() => setScreen(prevScreenRef.current === 'gameover' ? 'gameover' : 'modeselect')} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
