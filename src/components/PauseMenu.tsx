import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HomeIcon from '@mui/icons-material/Home';

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(12px)',
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 5,
          background: 'rgba(13, 33, 55, 0.95)',
          borderRadius: 4,
          border: '1px solid rgba(39, 174, 96, 0.3)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          maxWidth: 360,
          width: '90%',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: 'primary.light',
            textShadow: '0 0 30px rgba(76, 175, 80, 0.5)',
          }}
        >
          Paused
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Take a breath. The planet is waiting.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={onResume}
            sx={{
              background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
              py: 1.5,
              boxShadow: '0 4px 20px rgba(39, 174, 96, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              },
            }}
          >
            Resume
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={onQuit}
            sx={{
              borderColor: 'rgba(39, 174, 96, 0.4)',
              color: 'text.secondary',
              py: 1.5,
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(39, 174, 96, 0.08)',
              },
            }}
          >
            Quit to Menu
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
