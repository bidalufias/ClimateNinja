import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CountdownOverlayProps {
  onDone: () => void;
}

export default function CountdownOverlay({ onDone }: CountdownOverlayProps) {
  const [value, setValue] = useState<number | string>(3);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sequence: Array<number | string> = [3, 2, 1, 'GO!'];
    let idx = 0;

    const advance = () => {
      idx++;
      if (idx < sequence.length) {
        setValue(sequence[idx]);
      } else {
        setVisible(false);
        onDone();
      }
    };

    const timer = setInterval(advance, 900);
    return () => clearInterval(timer);
  }, [onDone]);

  if (!visible) return null;

  const isGo = value === 'GO!';

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        background: 'rgba(0,0,0,0.35)',
        pointerEvents: 'none',
      }}
    >
      <Typography
        sx={{
          fontSize: isGo ? '7rem' : '10rem',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          background: isGo
            ? 'linear-gradient(135deg, #4caf50, #80cbc4)'
            : 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          animation: 'countPop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          '@keyframes countPop': {
            from: { transform: 'scale(0.4)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          key: String(value),
        }}
        key={String(value)}
      >
        {value}
      </Typography>
    </Box>
  );
}
