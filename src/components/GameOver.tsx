import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { submitScore } from '../lib/supabase';
import type { PlayerResults, GameMode } from '../types/game';

const PLAYER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];
const PLAYER_LABELS = ['P1', 'P2', 'P3', 'P4'];

interface GameOverProps {
  results: PlayerResults[];
  mode: GameMode;
  playerNames: string[];
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        p: 1.5,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

function SinglePlayerSubmit({
  initialName,
  result,
}: {
  initialName: string;
  result: PlayerResults;
}) {
  const [playerName, setPlayerName] = useState(initialName);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const name = playerName.trim();
    if (!name || name.length > 20) return;
    setSubmitting(true);
    setError('');
    try {
      await submitScore({
        player_name: name,
        score: result.score,
        items_sliced: result.itemsSliced,
        max_combo: result.maxCombo,
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box
        sx={{
          py: 1.5, px: 3, background: 'rgba(39, 174, 96, 0.1)', borderRadius: 2,
          border: '1px solid rgba(39, 174, 96, 0.3)', textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: 'primary.light', fontWeight: 600 }}>
          Score submitted! Check the leaderboard.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Submit your score
      </Typography>
      <TextField
        placeholder="Enter name (max 20 chars)"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
        variant="outlined"
        size="small"
        fullWidth
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(39, 174, 96, 0.3)' },
            '&:hover fieldset': { borderColor: 'primary.main' },
          },
        }}
      />
      {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!playerName.trim() || submitting}
        fullWidth
        sx={{ background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', py: 1.25 }}
      >
        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Score'}
      </Button>
    </Box>
  );
}

function MultiPlayerSubmit({
  results,
  playerNames,
}: {
  results: PlayerResults[];
  playerNames: string[];
}) {
  const [names, setNames] = useState<string[]>(
    results.map((r, i) => {
      const originalIdx = parseInt(r.playerName.replace('P', '')) - 1;
      const idx = isNaN(originalIdx) ? i : originalIdx;
      return playerNames[idx] || r.playerName || `P${i + 1}`;
    })
  );
  const [submitting, setSubmitting] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleSubmitOne = async (idx: number) => {
    const name = names[idx]?.trim();
    if (!name) return;
    setSubmitting((prev) => new Set(prev).add(idx));
    setErrors((prev) => ({ ...prev, [idx]: '' }));
    try {
      await submitScore({
        player_name: name,
        score: results[idx].score,
        items_sliced: results[idx].itemsSliced,
        max_combo: results[idx].maxCombo,
      });
      setSubmitted((prev) => new Set(prev).add(idx));
    } catch {
      setErrors((prev) => ({ ...prev, [idx]: 'Failed' }));
    } finally {
      setSubmitting((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Submit scores to leaderboard
      </Typography>
      {results.map((result, idx) => {
        const color = PLAYER_COLORS[idx % 4];
        const isSubmitted = submitted.has(idx);
        const isSubmitting = submitting.has(idx);
        const hasError = !!errors[idx];

        return (
          <Box
            key={result.playerId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1.5,
              background: isSubmitted ? 'rgba(39,174,96,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isSubmitted ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <TextField
              value={names[idx]}
              onChange={(e) => {
                const v = e.target.value.slice(0, 20);
                setNames((prev) => { const n = [...prev]; n[idx] = v; return n; });
              }}
              variant="outlined"
              size="small"
              disabled={isSubmitted}
              placeholder={PLAYER_LABELS[idx]}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: `${color}33` },
                  '&:hover fieldset': { borderColor: `${color}66` },
                  '&.Mui-focused fieldset': { borderColor: color },
                },
                '& .MuiInputBase-input': { py: 0.75, fontSize: '0.8rem' },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, minWidth: 48, textAlign: 'right', fontSize: '0.75rem' }}>
              {result.score.toLocaleString()}
            </Typography>
            {isSubmitted ? (
              <Tooltip title="Submitted">
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
              </Tooltip>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleSubmitOne(idx)}
                disabled={!names[idx]?.trim() || isSubmitting}
                sx={{
                  borderColor: `${color}55`,
                  color,
                  minWidth: 56,
                  py: 0.5,
                  fontSize: '0.7rem',
                  '&:hover': { borderColor: color, background: `${color}11` },
                  ...(hasError && { borderColor: 'error.main', color: 'error.main' }),
                }}
              >
                {isSubmitting ? <CircularProgress size={14} color="inherit" /> : hasError ? 'Retry' : 'Save'}
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default function GameOver({ results, mode, playerNames, onPlayAgain, onLeaderboard, onHome }: GameOverProps) {
  const isSinglePlayer = mode === '1p';
  const winner = results.find((r) => r.isWinner) ?? results.reduce((a, b) => (a.score >= b.score ? a : b));
  const winnerIndex = results.indexOf(winner);
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  const impactMessage = (() => {
    if (winner.itemsSliced >= 50) return 'Climate Hero! Catastrophic pollution stopped!';
    if (winner.itemsSliced >= 30) return 'Eco Warrior! Significant emissions reduced!';
    if (winner.itemsSliced >= 15) return 'Green Defender! Real difference made today!';
    return 'Every slash counts. Keep fighting for the planet!';
  })();

  const winnerDisplayName = winner.playerName || PLAYER_LABELS[winnerIndex] || `P${winnerIndex + 1}`;
  const winnerColor = PLAYER_COLORS[winnerIndex % 4];

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 20,
        px: 2,
        overflowY: 'auto',
        py: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: { xs: 3, sm: 4 },
          background: 'rgba(13, 33, 55, 0.98)',
          borderRadius: 4,
          border: '1px solid rgba(39, 174, 96, 0.25)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.8)',
          maxWidth: isSinglePlayer ? 440 : 560,
          width: '100%',
        }}
      >
        {isSinglePlayer ? (
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, color: 'error.light', textShadow: '0 0 30px rgba(255, 107, 53, 0.5)', textAlign: 'center' }}
          >
            Game Over
          </Typography>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.4)', lineHeight: 1 }}>
              {winnerDisplayName} Wins!
            </Typography>
            <Typography variant="caption" sx={{ color: winnerColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {winner.streak > 1 ? `${winner.streak}x Champion Streak` : 'Champion'}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic', maxWidth: 320 }}>
          {impactMessage}
        </Typography>

        {isSinglePlayer ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, width: '100%' }}>
            <StatCard icon={<EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 28 }} />} label="Score" value={winner.score.toLocaleString()} />
            <StatCard icon={<ContentCutIcon sx={{ color: 'primary.light', fontSize: 28 }} />} label="Sliced" value={winner.itemsSliced.toString()} />
            <StatCard icon={<LocalFireDepartmentIcon sx={{ color: '#FF6B35', fontSize: 28 }} />} label="Max Combo" value={`${winner.maxCombo}x`} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, width: '100%' }}>
            {sortedResults.map((result, sortedIdx) => {
              const originalIndex = results.indexOf(result);
              const color = PLAYER_COLORS[originalIndex % 4];
              const isWinner = sortedIdx === 0;
              const displayName = result.playerName || PLAYER_LABELS[originalIndex] || `P${originalIndex + 1}`;
              return (
                <Box
                  key={result.playerId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    background: isWinner ? `${color}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isWinner ? color + '55' : 'rgba(255,255,255,0.06)'}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {isWinner && (
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: color, borderRadius: '2px 0 0 2px' }} />
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 56 }}>
                    {isWinner && <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 16 }} />}
                    <Typography variant="caption" sx={{ color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem' }}>
                      {displayName}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', flex: 1, lineHeight: 1, fontSize: '1rem' }}>
                    {result.score.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1, fontSize: '0.65rem' }}>Sliced</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.72rem' }}>{result.itemsSliced}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1, fontSize: '0.65rem' }}>Combo</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.72rem' }}>{result.maxCombo}x</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        <Divider sx={{ width: '100%', borderColor: 'rgba(39, 174, 96, 0.15)' }} />

        {isSinglePlayer ? (
          <SinglePlayerSubmit initialName={playerNames[0] || ''} result={winner} />
        ) : (
          <MultiPlayerSubmit results={sortedResults} playerNames={playerNames} />
        )}

        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onPlayAgain}
            sx={{ flex: 1, background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', py: 1.25, minWidth: 120 }}
          >
            Play Again
          </Button>
          <Button
            variant="outlined"
            startIcon={<LeaderboardIcon />}
            onClick={onLeaderboard}
            sx={{ flex: 1, borderColor: 'rgba(39, 174, 96, 0.3)', color: 'primary.light', py: 1.25, minWidth: 120 }}
          >
            Leaderboard
          </Button>
          <Button
            variant="text"
            startIcon={<HomeIcon />}
            onClick={onHome}
            sx={{ width: '100%', color: 'text.secondary', py: 1 }}
          >
            Main Menu
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
