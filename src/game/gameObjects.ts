import type { GameObjectDef } from '../types/game';
import { pickRandomPowerup } from './powerups';

export const POLLUTANTS: GameObjectDef[] = [
  { id: 'coal', emoji: '⛏️', label: 'Coal', kind: 'pollutant', color: '#333333', splatColor: '#1a1a1a', size: 55, points: 10 },
  { id: 'oil_barrel', emoji: '🛢️', label: 'Oil Barrel', kind: 'pollutant', color: '#1a1a1a', splatColor: '#000000', size: 58, points: 15 },
  { id: 'factory', emoji: '🏭', label: 'Pollution', kind: 'pollutant', color: '#666666', splatColor: '#888888', size: 62, points: 20 },
  { id: 'car', emoji: '🚗', label: 'Gas Car', kind: 'pollutant', color: '#c0392b', splatColor: '#e74c3c', size: 60, points: 10 },
  { id: 'plastic', emoji: '🛍️', label: 'Plastic Bag', kind: 'pollutant', color: '#ecf0f1', splatColor: '#bdc3c7', size: 50, points: 10 },
  { id: 'smog', emoji: '💨', label: 'Smog', kind: 'pollutant', color: '#7f8c8d', splatColor: '#95a5a6', size: 52, points: 10 },
  { id: 'gascan', emoji: '⛽', label: 'Fossil Fuel', kind: 'pollutant', color: '#e67e22', splatColor: '#d35400', size: 54, points: 15 },
  { id: 'thermometer', emoji: '🌡️', label: 'Global Warming', kind: 'pollutant', color: '#e74c3c', splatColor: '#c0392b', size: 48, points: 25 },
];

export const PROTECTED: GameObjectDef[] = [
  { id: 'tree', emoji: '🌳', label: 'Tree', kind: 'protected', color: '#27ae60', splatColor: '#2ecc71', size: 60, points: 0 },
  { id: 'solar', emoji: '🌞', label: 'Solar Panel', kind: 'protected', color: '#f39c12', splatColor: '#f1c40f', size: 58, points: 0 },
  { id: 'earth', emoji: '🌍', label: 'Earth', kind: 'protected', color: '#2980b9', splatColor: '#3498db', size: 62, points: 0 },
  { id: 'recycle', emoji: '♻️', label: 'Recycling', kind: 'protected', color: '#27ae60', splatColor: '#2ecc71', size: 54, points: 0 },
];

export function pickRandomObject(score: number, isFrenzy = false): GameObjectDef {
  const rand = Math.random();

  if (!isFrenzy && rand < 0.06) {
    return pickRandomPowerup();
  }

  const difficultyLevel = Math.floor(score / 50);
  const protectedChance = isFrenzy ? 0 : Math.min(0.05 + difficultyLevel * 0.02, 0.18);

  if (!isFrenzy && rand - 0.06 < protectedChance) {
    return PROTECTED[Math.floor(Math.random() * PROTECTED.length)];
  }

  return POLLUTANTS[Math.floor(Math.random() * POLLUTANTS.length)];
}
