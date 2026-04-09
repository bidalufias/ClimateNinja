import type { GameObjectDef, PowerupType } from '../types/game';

export const POWERUP_DEFS: Record<PowerupType, GameObjectDef> = {
  extralife: {
    id: 'powerup_extralife',
    emoji: '💚',
    label: 'Extra Life',
    kind: 'powerup',
    color: '#2ecc71',
    splatColor: '#27ae60',
    size: 54,
    points: 0,
    powerupType: 'extralife',
  },
  slowmo: {
    id: 'powerup_slowmo',
    emoji: '⏳',
    label: 'Slow Motion',
    kind: 'powerup',
    color: '#40c4ff',
    splatColor: '#0288d1',
    size: 54,
    points: 0,
    powerupType: 'slowmo',
  },
  doublepoints: {
    id: 'powerup_doublepoints',
    emoji: '✨',
    label: '2x Points',
    kind: 'powerup',
    color: '#FFD700',
    splatColor: '#FFA000',
    size: 54,
    points: 0,
    powerupType: 'doublepoints',
  },
  shield: {
    id: 'powerup_shield',
    emoji: '🛡️',
    label: 'Shield',
    kind: 'powerup',
    color: '#448aff',
    splatColor: '#1565c0',
    size: 54,
    points: 0,
    powerupType: 'shield',
  },
  cleansweep: {
    id: 'powerup_cleansweep',
    emoji: '🌪️',
    label: 'Clean Sweep',
    kind: 'powerup',
    color: '#b2dfdb',
    splatColor: '#26a69a',
    size: 54,
    points: 0,
    powerupType: 'cleansweep',
  },
};

export const POWERUP_DURATION_MS: Record<PowerupType, number> = {
  extralife: 0,
  slowmo: 7000,
  doublepoints: 10000,
  shield: 0,
  cleansweep: 0,
};

const POWERUP_TYPES = Object.keys(POWERUP_DEFS) as PowerupType[];

export function pickRandomPowerup(): GameObjectDef {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  return POWERUP_DEFS[type];
}

export function getPowerupLabel(type: PowerupType): string {
  const labels: Record<PowerupType, string> = {
    extralife: '+1 Life',
    slowmo: 'Slow-Mo!',
    doublepoints: '2x Points!',
    shield: 'Shield!',
    cleansweep: 'CLEAN SWEEP!',
  };
  return labels[type];
}

export function getPowerupColor(type: PowerupType): string {
  return POWERUP_DEFS[type].color;
}
