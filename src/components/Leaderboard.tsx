import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PublicIcon from '@mui/icons-material/Public';
import { fetchTopScores, type LeaderboardEntry } from '../lib/supabase';

interface LeaderboardProps {
  onBack: () => void;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopScores(10)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load leaderboard. Please try again.');
        setLoading(false);
      });
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #0a1628 0%, #0d2137 60%, #071020 100%)',
        overflowY: 'auto',
        px: 2,
        py: 4,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
        >
          Back
        </Button>
      </Box>

      <Box sx={{ maxWidth: 560, width: '100%', mt: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
            <PublicIcon sx={{ color: 'primary.light', fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #4caf50 0%, #80cbc4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Climate Ninjas
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Top 10 Global Scores
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'primary.light' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && entries.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 3,
              border: '1px solid rgba(39,174,96,0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No scores yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Be the first Climate Ninja to save the planet!
            </Typography>
          </Box>
        )}

        {!loading && entries.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <LeaderboardHeader />
            {entries.map((entry, index) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function LeaderboardHeader() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 90px 70px 70px',
        gap: 1,
        px: 2,
        py: 1,
        mb: 0.5,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>#</Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Player</Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>
        <EmojiEventsIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />Score
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>
        <ContentCutIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />Sliced
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>
        <LocalFireDepartmentIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />Combo
      </Typography>
    </Box>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const medalColor = MEDAL_COLORS[rank - 1];
  const isTopThree = rank <= 3;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 90px 70px 70px',
        gap: 1,
        px: 2,
        py: 1.5,
        background: isTopThree
          ? `rgba(${rank === 1 ? '255,215,0' : rank === 2 ? '192,192,192' : '205,127,50'}, 0.06)`
          : 'rgba(255,255,255,0.03)',
        borderRadius: 2,
        border: `1px solid ${isTopThree ? `${medalColor}33` : 'rgba(255,255,255,0.05)'}`,
        alignItems: 'center',
        transition: 'background 0.2s',
        '&:hover': {
          background: 'rgba(39, 174, 96, 0.06)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isTopThree ? (
          <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600, textAlign: 'center' }}>
            {rank}
          </Typography>
        )}
      </Box>

      <Typography
        variant="body1"
        sx={{
          fontWeight: isTopThree ? 700 : 500,
          color: isTopThree ? medalColor : 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.player_name}
      </Typography>

      <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.light', textAlign: 'right' }}>
        {entry.score.toLocaleString()}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right' }}>
        {entry.items_sliced}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right' }}>
        {entry.max_combo}x
      </Typography>
    </Box>
  );
}
