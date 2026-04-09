import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import PauseIcon from '@mui/icons-material/Pause';
import PublicIcon from '@mui/icons-material/Public';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import type { PlayerState, GameMode } from '../types/game';

const PLAYER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];
const MAX_LIVES = 5;

const POWERUP_ICONS: Record<string, string> = {
  slowmo: '⏳',
  doublepoints: '✨',
  shield: '🛡️',
  extralife: '💚',
  cleansweep: '🌪️',
};

interface GameHUDProps {
  players: PlayerState[];
  playerNames: string[];
  mode: GameMode;
  slowMo: boolean;
  frenzy: boolean;
  onPause: () => void;
}

function PlayerPanel({
  player,
  color,
  compact,
  mirrored = false,
  name,
}: {
  player: PlayerState;
  color: string;
  compact: boolean;
  mirrored?: boolean;
  name?: string;
}) {
  const activePowerupTypes = player.activePowerups.map((p) => p.type);
  const displayName = name || `P${player.id + 1}`;

  return (
    <Box
      sx={{
        background: 'rgba(10, 22, 40, 0.82)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        px: compact ? 1.5 : 2,
        py: compact ? 1 : 1.5,
        border: `1px solid ${color}55`,
        minWidth: compact ? 100 : 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        opacity: player.isAlive ? 1 : 0.45,
        alignItems: mirrored ? 'flex-end' : 'flex-start',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexDirection: mirrored ? 'row-reverse' : 'row' }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
        <Typography
          variant="caption"
          sx={{
            color,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1,
            fontSize: compact ? '0.6rem' : '0.7rem',
            maxWidth: compact ? 80 : 100,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </Typography>
      </Box>

      <Typography
        variant={compact ? 'h6' : 'h5'}
        sx={{ color: 'text.primary', fontWeight: 900, lineHeight: 1, textShadow: `0 0 16px ${color}88`, textAlign: mirrored ? 'right' : 'left' }}
      >
        {player.score.toLocaleString()}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flexDirection: mirrored ? 'row-reverse' : 'row' }}>
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <Box key={i} sx={{ color: i < player.lives ? '#2ecc71' : 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center' }}>
            {i < player.lives ? (
              <PublicIcon sx={{ fontSize: compact ? 16 : 20 }} />
            ) : (
              <HeartBrokenIcon sx={{ fontSize: compact ? 16 : 20, color: 'rgba(255,100,100,0.25)' }} />
            )}
          </Box>
        ))}
      </Box>

      {player.combo >= 2 && (
        <Typography
          variant="caption"
          sx={{
            color: player.combo >= 5 ? '#FFD700' : player.combo >= 3 ? '#FF6B35' : '#4CAF50',
            fontWeight: 700,
            lineHeight: 1,
            fontSize: compact ? '0.6rem' : '0.7rem',
            textAlign: mirrored ? 'right' : 'left',
          }}
        >
          {player.combo}x COMBO!
        </Typography>
      )}

      {activePowerupTypes.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', flexDirection: mirrored ? 'row-reverse' : 'row' }}>
          {activePowerupTypes.map((type) => (
            <Typography key={type} sx={{ fontSize: compact ? '0.75rem' : '0.85rem', lineHeight: 1 }}>
              {POWERUP_ICONS[type] ?? '?'}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

function StatusChips({ frenzy, slowMo, mode, players }: { frenzy: boolean; slowMo: boolean; mode: GameMode; players: PlayerState[] }) {
  const isMulti = mode !== '1p';
  const compact = mode === '4p' || mode === 'champion';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
      {frenzy && (
        <Chip
          icon={<LocalFireDepartmentIcon sx={{ fontSize: '0.9rem !important', color: '#FF6B35 !important' }} />}
          label="FRENZY"
          size="small"
          sx={{
            bgcolor: 'rgba(255,68,0,0.2)',
            border: '1px solid rgba(255,107,53,0.6)',
            color: '#FF6B35',
            fontWeight: 800,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            height: 22,
            animation: 'pulse 0.8s ease-in-out infinite alternate',
            '@keyframes pulse': { from: { boxShadow: '0 0 6px rgba(255,107,53,0.4)' }, to: { boxShadow: '0 0 16px rgba(255,107,53,0.8)' } },
          }}
        />
      )}
      {slowMo && !frenzy && (
        <Chip
          label="SLOW MO"
          size="small"
          sx={{
            bgcolor: 'rgba(64,196,255,0.15)',
            border: '1px solid rgba(64,196,255,0.5)',
            color: '#40c4ff',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            height: 22,
          }}
        />
      )}
      {isMulti && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {mode === 'champion' ? 'Champion' : `${players.length}P`}
        </Typography>
      )}
      {compact && <Box sx={{ height: 4 }} />}
    </Box>
  );
}

export default function GameHUD({ players, playerNames, mode, slowMo, frenzy, onPause }: GameHUDProps) {
  const compact = mode === '4p' || mode === 'champion';

  if (mode === '4p') {
    const p = (i: number) => players[i];
    const name = (i: number) => playerNames[i] || `P${i + 1}`;
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {p(0) && (
          <Box sx={{ position: 'absolute', top: 8, left: 8, transform: 'rotate(180deg)' }}>
            <PlayerPanel player={p(0)} color={PLAYER_COLORS[0]} compact name={name(0)} />
          </Box>
        )}
        {p(1) && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, transform: 'rotate(180deg)' }}>
            <PlayerPanel player={p(1)} color={PLAYER_COLORS[1]} compact mirrored name={name(1)} />
          </Box>
        )}
        {p(2) && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
            <PlayerPanel player={p(2)} color={PLAYER_COLORS[2]} compact name={name(2)} />
          </Box>
        )}
        {p(3) && (
          <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
            <PlayerPanel player={p(3)} color={PLAYER_COLORS[3]} compact mirrored name={name(3)} />
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            pointerEvents: 'auto',
          }}
        >
          <IconButton
            onClick={onPause}
            size="medium"
            sx={{
              background: 'rgba(10, 22, 40, 0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(39, 174, 96, 0.3)',
              color: 'primary.light',
              '&:hover': { background: 'rgba(39, 174, 96, 0.2)' },
            }}
          >
            <PauseIcon />
          </IconButton>
          <StatusChips frenzy={frenzy} slowMo={slowMo} mode={mode} players={players} />
        </Box>
      </Box>
    );
  }

  if (mode === '2p' || mode === 'champion') {
    return (
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        {players[1] && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, transform: 'rotate(180deg)' }}>
            <PlayerPanel player={players[1]} color={PLAYER_COLORS[1]} compact={compact} mirrored name={playerNames[1] || 'P2'} />
          </Box>
        )}
        {players[0] && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
            <PlayerPanel player={players[0]} color={PLAYER_COLORS[0]} compact={compact} name={playerNames[0] || 'P1'} />
          </Box>
        )}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            pointerEvents: 'auto',
          }}
        >
          <StatusChips frenzy={frenzy} slowMo={slowMo} mode={mode} players={players} />
          <IconButton
            onClick={onPause}
            size={compact ? 'medium' : 'large'}
            sx={{
              background: 'rgba(10, 22, 40, 0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(39, 174, 96, 0.3)',
              color: 'primary.light',
              '&:hover': { background: 'rgba(39, 174, 96, 0.2)' },
            }}
          >
            <PauseIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        px: 1.5,
        pt: 1.5,
        pointerEvents: 'none',
        zIndex: 10,
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
        {players.map((player, i) => (
          <PlayerPanel
            key={player.id}
            player={player}
            color={PLAYER_COLORS[i % 4]}
            compact={compact}
            name={playerNames[i] || `P${i + 1}`}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          pointerEvents: 'auto',
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={onPause}
          size={compact ? 'medium' : 'large'}
          sx={{
            background: 'rgba(10, 22, 40, 0.82)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(39, 174, 96, 0.3)',
            color: 'primary.light',
            '&:hover': { background: 'rgba(39, 174, 96, 0.2)' },
          }}
        >
          <PauseIcon />
        </IconButton>
        <StatusChips frenzy={frenzy} slowMo={slowMo} mode={mode} players={players} />
      </Box>
    </Box>
  );
}
