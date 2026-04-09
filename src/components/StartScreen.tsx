import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { GameMode } from '../types/game';

interface StartScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onLeaderboard: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
}

const POLLUTANTS = ['⛏️', '🛢️', '🏭', '🚗', '🛍️', '💨', '⛽', '🌡️'];
const PROTECTED_ITEMS = ['🌳', '🌞', '🌍', '♻️'];
const POWERUPS = ['💚', '⏳', '✨', '🛡️', '🌪️'];

const SPEEDS = [
  { value: 0.5,  label: 'Very Slow' },
  { value: 0.75, label: 'Slow' },
  { value: 1.0,  label: 'Standard' },
  { value: 1.25, label: 'Fast' },
  { value: 1.5,  label: 'Very Fast' },
];

const MODES: Array<{ mode: GameMode; label: string; subtitle: string; description: string; icon: React.ReactNode; color: string }> = [
  { mode: '1p', label: '1 Player', subtitle: 'Solo Challenge', description: 'Play alone against the planet. Beat your high score.', icon: <PersonIcon sx={{ fontSize: 32 }} />, color: '#4CAF50' },
  { mode: '2p', label: '2 Players', subtitle: 'Versus Mode', description: 'Split screen head-to-head. Last one standing wins.', icon: <GroupIcon sx={{ fontSize: 32 }} />, color: '#2196F3' },
  { mode: '4p', label: '4 Players', subtitle: 'Battle Royale', description: 'Four zones, four players. Highest score takes glory.', icon: <GroupsIcon sx={{ fontSize: 32 }} />, color: '#FF9800' },
  { mode: 'champion', label: 'Champion', subtitle: 'Winner Stays', description: 'Defend your throne. Win and keep your streak alive.', icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />, color: '#FFD700' },
];

export default function StartScreen({ onSelectMode, onLeaderboard, speed, onSpeedChange }: StartScreenProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #1a2e4a 0%, #1e3558 50%, #12213a 100%)',
        position: 'relative',
        overflow: 'hidden',
        gap: 3,
        px: 4,
        py: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120%',
            height: '40%',
            background: 'radial-gradient(ellipse at center bottom, rgba(39,174,96,0.16) 0%, transparent 70%)',
          },
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <PublicIcon sx={{ color: 'primary.light', fontSize: 30 }} />
        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Save the Planet
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
            fontWeight: 900,
            background: 'linear-gradient(135deg, #4caf50 0%, #80cbc4 50%, #26a69a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textShadow: 'none',
          }}
        >
          CLIMATE NINJA
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.4 }}>
          Slash pollution, protect nature. Select a game mode to begin.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
          width: '100%',
          maxWidth: 900,
        }}
      >
        {MODES.map(({ mode, label, subtitle, description, icon, color }) => (
          <Card
            key={mode}
            sx={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${color}33`,
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                border: `1px solid ${color}88`,
                background: `${color}11`,
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 32px ${color}33`,
              },
            }}
          >
            <CardActionArea
              onClick={() => onSelectMode(mode)}
              sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}
            >
              <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>{label}</Typography>
              <Typography variant="caption" sx={{ color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>{subtitle}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, mt: 0.5 }}>{description}</Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Speed selector */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Game Speed
        </Typography>
        <ToggleButtonGroup
          value={speed}
          exclusive
          onChange={(_e, v) => { if (v !== null) onSpeedChange(v as number); }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: 'text.secondary',
              borderColor: 'rgba(255,255,255,0.12)',
              px: 2,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              '&.Mui-selected': {
                color: '#4caf50',
                bgcolor: 'rgba(76,175,80,0.15)',
                borderColor: 'rgba(76,175,80,0.5)',
              },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            },
          }}
        >
          {SPEEDS.map((s) => (
            <ToggleButton key={s.value} value={s.value}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          p: 2,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 3,
          border: '1px solid rgba(39,174,96,0.15)',
          maxWidth: 700,
          width: '100%',
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
            Slash Pollutants
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {POLLUTANTS.map((e) => (
              <Chip key={e} label={e} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(102,102,102,0.3)', fontSize: '1rem', height: 32 }} />
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'error.light', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
            Protect Nature
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {PROTECTED_ITEMS.map((e) => (
              <Chip key={e} label={e} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,80,80,0.3)', fontSize: '1rem', height: 32 }} />
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
            Power-Ups
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {POWERUPS.map((e) => (
              <Chip key={e} label={e} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.3)', fontSize: '1rem', height: 32 }} />
            ))}
          </Box>
        </Box>
      </Box>

      <Button
        variant="outlined"
        size="large"
        startIcon={<LeaderboardIcon />}
        onClick={onLeaderboard}
        sx={{
          fontSize: '1rem',
          py: 1.25,
          px: 4,
          borderColor: 'rgba(39,174,96,0.4)',
          color: 'primary.light',
          '&:hover': { borderColor: 'primary.main', background: 'rgba(39,174,96,0.1)' },
        }}
      >
        Leaderboard
      </Button>

      <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
        Hold & drag to slash  •  Lose a life for each pollutant that escapes
      </Typography>
    </Box>
  );
}
