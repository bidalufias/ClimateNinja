import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { GameMode } from '../types/game';

const PLAYER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];
const PLAYER_LABELS = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const PLAYER_SHORTLABELS = ['P1', 'P2', 'P3', 'P4'];

function getPlayerCount(mode: GameMode): number {
  if (mode === '1p') return 1;
  if (mode === '2p' || mode === 'champion') return 2;
  return 4;
}

interface NameFieldProps {
  index: number;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
  mirrored?: boolean;
}

function NameField({ index, value, onChange, compact = false, mirrored = false }: NameFieldProps) {
  const color = PLAYER_COLORS[index];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: mirrored ? 'flex-end' : 'flex-start',
        minWidth: compact ? 200 : 240,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: mirrored ? 'row-reverse' : 'row' }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
          }}
        >
          {PLAYER_LABELS[index]}
        </Typography>
      </Box>
      <TextField
        placeholder={`${PLAYER_SHORTLABELS[index]} name (optional)`}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        variant="outlined"
        size="small"
        onKeyDown={(e) => e.stopPropagation()}
        sx={{
          width: compact ? 200 : 240,
          '& .MuiOutlinedInput-root': {
            color: 'text.primary',
            '& fieldset': { borderColor: `${color}44` },
            '&:hover fieldset': { borderColor: `${color}88` },
            '&.Mui-focused fieldset': { borderColor: color },
          },
          '& .MuiInputBase-input': {
            py: 1,
            textAlign: mirrored ? 'right' : 'left',
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'text.disabled',
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}

interface NameEntryScreenProps {
  mode: GameMode;
  onStart: (names: string[]) => void;
  onBack: () => void;
}

export default function NameEntryScreen({ mode, onStart, onBack }: NameEntryScreenProps) {
  const count = getPlayerCount(mode);
  const [names, setNames] = useState<string[]>(Array(count).fill(''));

  const updateName = (i: number, v: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const handleStart = () => {
    const resolved = names.map((n, i) => n.trim() || PLAYER_SHORTLABELS[i]);
    onStart(resolved);
  };

  const is4P = mode === '4p';
  const is1P = mode === '1p';
  const is2P = mode === '2p' || mode === 'champion';

  if (is2P) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'radial-gradient(ellipse at center, #0d2140 0%, #060e1c 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(33,150,243,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(39,174,96,0.07) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(180deg)',
            px: 4,
            py: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Enter your name — appears on the leaderboard
            </Typography>
            <NameField index={1} value={names[1]} onChange={(v) => updateName(1, v)} />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 3,
            py: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.25)',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                letterSpacing: '0.25em',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'block',
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              {mode === 'champion' ? 'Champion Mode' : '2 Player Mode'}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1, letterSpacing: '-0.01em' }}
            >
              VS
            </Typography>
          </Box>
          <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 4,
            py: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <NameField index={0} value={names[0]} onChange={(v) => updateName(0, v)} />
          <Box sx={{ display: 'flex', gap: 1.5, width: '100%', maxWidth: 300 }}>
            <Button
              variant="text"
              onClick={onBack}
              sx={{ color: 'text.secondary', flex: 0, px: 2 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleStart}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                py: 1.5,
                fontWeight: 800,
                letterSpacing: '0.06em',
                fontSize: '1rem',
                boxShadow: '0 4px 24px rgba(39,174,96,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                  boxShadow: '0 6px 32px rgba(39,174,96,0.5)',
                },
              }}
            >
              Start Game
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0d2140 0%, #060e1c 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(39,174,96,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(33,150,243,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          px: 4,
          py: 5,
          maxWidth: is4P ? 640 : 420,
          width: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              letterSpacing: '0.25em',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'block',
              mb: 0.5,
            }}
          >
            {mode === '4p' ? '4 Player Mode' : 'Solo Mode'}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Enter Player Names
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 1, fontSize: '0.85rem' }}
          >
            Names will appear on the leaderboard
          </Typography>
        </Box>

        {is4P ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                p: 2,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <NameField index={0} value={names[0]} onChange={(v) => updateName(0, v)} compact />
              <NameField index={1} value={names[1]} onChange={(v) => updateName(1, v)} compact mirrored />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                vs
              </Typography>
              <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                p: 2,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <NameField index={2} value={names[2]} onChange={(v) => updateName(2, v)} compact />
              <NameField index={3} value={names[3]} onChange={(v) => updateName(3, v)} compact mirrored />
            </Box>
          </Box>
        ) : is1P ? (
          <Box sx={{ width: '100%', maxWidth: 280 }}>
            <NameField index={0} value={names[0]} onChange={(v) => updateName(0, v)} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, width: '100%', justifyContent: 'center' }}>
            <NameField index={0} value={names[0]} onChange={(v) => updateName(0, v)} />
            <NameField index={1} value={names[1]} onChange={(v) => updateName(1, v)} mirrored />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', maxWidth: 340 }}>
          <Button
            variant="text"
            onClick={onBack}
            sx={{ color: 'text.secondary', flex: 0, px: 2 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleStart}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
              py: 1.5,
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontSize: '1rem',
              boxShadow: '0 4px 24px rgba(39,174,96,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                boxShadow: '0 6px 32px rgba(39,174,96,0.5)',
              },
            }}
          >
            Start Game
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
