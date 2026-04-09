import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';

interface ChampionRoundEndProps {
  winnerId: number;
  winnerStreak: number;
  winnerSide: 'left' | 'right';
  winnerScore: number;
  onNextChallenger: () => void;
}

const PLAYER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];

function WinnerPanel({ winnerId, winnerStreak, winnerScore }: { winnerId: number; winnerStreak: number; winnerScore: number }) {
  const color = PLAYER_COLORS[winnerId % 4];
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
        position: 'relative',
        background: `radial-gradient(ellipse at center, ${color}18 0%, rgba(0,0,0,0) 70%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
        <EmojiEventsIcon
          sx={{
            fontSize: 80,
            color: '#FFD700',
            filter: `drop-shadow(0 0 24px #FFD70099) drop-shadow(0 0 8px ${color}88)`,
            animation: 'trophy-pulse 2s ease-in-out infinite',
            '@keyframes trophy-pulse': {
              '0%, 100%': { filter: `drop-shadow(0 0 20px #FFD70099) drop-shadow(0 0 8px ${color}88)` },
              '50%': { filter: `drop-shadow(0 0 40px #FFD700cc) drop-shadow(0 0 20px ${color}aa)` },
            },
          }}
        />

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color,
              textShadow: `0 0 32px ${color}aa, 0 2px 8px rgba(0,0,0,0.8)`,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            P{winnerId + 1}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#fff',
              textShadow: `0 0 20px ${color}66, 0 2px 8px rgba(0,0,0,0.8)`,
              letterSpacing: '0.04em',
              lineHeight: 1.1,
            }}
          >
            WINNER!
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {winnerScore.toLocaleString()} pts
          </Typography>
        </Box>

        {winnerStreak >= 2 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2,
              py: 0.75,
              borderRadius: 4,
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.4)',
            }}
          >
            <WhatshotIcon sx={{ color: '#FFD700', fontSize: 18 }} />
            <Typography
              variant="body2"
              sx={{ color: '#FFD700', fontWeight: 800, letterSpacing: '0.05em' }}
            >
              {winnerStreak}x CHAMPION STREAK
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ChallengerPanel({ onNextChallenger }: { onNextChallenger: () => void }) {
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        position: 'relative',
        background: 'rgba(0,0,0,0.0)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.72)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Step Aside
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={onNextChallenger}
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            px: 5,
            py: 2,
            borderRadius: 3,
            border: '2px solid rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
            backdropFilter: 'blur(8px)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
            },
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          Next Challenger
        </Button>
      </Box>
    </Box>
  );
}

export default function ChampionRoundEnd({ winnerId, winnerStreak, winnerSide, winnerScore, onNextChallenger }: ChampionRoundEndProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {winnerSide === 'left' ? (
        <>
          <WinnerPanel winnerId={winnerId} winnerStreak={winnerStreak} winnerScore={winnerScore} />
          <Box sx={{ width: '2px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <ChallengerPanel onNextChallenger={onNextChallenger} />
        </>
      ) : (
        <>
          <ChallengerPanel onNextChallenger={onNextChallenger} />
          <Box sx={{ width: '2px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <WinnerPanel winnerId={winnerId} winnerStreak={winnerStreak} winnerScore={winnerScore} />
        </>
      )}
    </Box>
  );
}
