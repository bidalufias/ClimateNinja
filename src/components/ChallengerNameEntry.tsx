import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';

const PLAYER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];
const PLAYER_SHORTLABELS = ['P1', 'P2', 'P3', 'P4'];

interface ChallengerNameEntryProps {
  challengerIndex: number;
  onConfirm: (name: string) => void;
}

export default function ChallengerNameEntry({ challengerIndex, onConfirm }: ChallengerNameEntryProps) {
  const [name, setName] = useState('');
  const color = PLAYER_COLORS[challengerIndex % 4];

  const handleConfirm = () => {
    onConfirm(name.trim() || PLAYER_SHORTLABELS[challengerIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleConfirm();
  };

  const isTopPlayer = challengerIndex >= 1;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isTopPlayer ? 'flex-start' : 'center',
        background: 'rgba(4, 10, 24, 0.92)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 5,
          borderRadius: 3,
          background: 'rgba(10, 22, 40, 0.9)',
          border: `1px solid ${color}44`,
          boxShadow: `0 0 60px ${color}22, 0 24px 80px rgba(0,0,0,0.6)`,
          minWidth: 360,
          ...(isTopPlayer && { transform: 'rotate(180deg)', mt: 4 }),
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <SportsKabaddiIcon
            sx={{
              fontSize: 56,
              color,
              filter: `drop-shadow(0 0 16px ${color}88)`,
              mb: 0.5,
            }}
          />
          <Typography
            variant="overline"
            sx={{
              color,
              letterSpacing: '0.3em',
              fontSize: '0.7rem',
              fontWeight: 800,
            }}
          >
            New Challenger
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            Who Dares
            <br />
            Challenge?
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: color,
                boxShadow: `0 0 8px ${color}`,
                flexShrink: 0,
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
              Challenger Name
            </Typography>
          </Box>
          <TextField
            autoFocus
            placeholder={`${PLAYER_SHORTLABELS[challengerIndex]} (optional)`}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'text.primary',
                '& fieldset': { borderColor: `${color}44` },
                '&:hover fieldset': { borderColor: `${color}88` },
                '&.Mui-focused fieldset': { borderColor: color },
              },
              '& .MuiInputBase-input': { py: 1 },
              '& .MuiInputBase-input::placeholder': {
                color: 'text.disabled',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleConfirm}
          fullWidth
          sx={{
            background: `linear-gradient(135deg, ${color}cc 0%, ${color} 100%)`,
            py: 1.5,
            fontWeight: 800,
            letterSpacing: '0.08em',
            fontSize: '1rem',
            boxShadow: `0 4px 24px ${color}44`,
            '&:hover': {
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              boxShadow: `0 6px 32px ${color}66`,
            },
          }}
        >
          Enter the Arena
        </Button>
      </Box>
    </Box>
  );
}
