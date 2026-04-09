import type { GameObject, Particle, BladePoint, ScorePopup, ZoneConfig, PlayerState } from '../types/game';

export const PLAYER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];

let _shakeStrength = 0;
let _shakeFrames = 0;

export function triggerShake(strength: number, frames = 8): void {
  _shakeStrength = Math.max(_shakeStrength, strength);
  _shakeFrames = Math.max(_shakeFrames, frames);
}

export function beginFrame(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  if (_shakeFrames > 0) {
    const dx = (Math.random() - 0.5) * _shakeStrength * 2;
    const dy = (Math.random() - 0.5) * _shakeStrength * 2;
    ctx.translate(dx, dy);
    _shakeStrength *= 0.80;
    _shakeFrames--;
  }
}

export function endFrame(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a2e4a');
  gradient.addColorStop(0.5, '#1e3558');
  gradient.addColorStop(1, '#12213a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  drawStars(ctx, width, height);
  drawHorizonGlow(ctx, width, height);
}

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  const seed = Math.floor(width * height);
  let s = seed;
  for (let i = 0; i < 60; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const x = Math.abs(s) % width;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const y = Math.abs(s) % (height * 0.6);
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const r = 0.5 + (Math.abs(s) % 100) / 100;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const a = 0.3 + (Math.abs(s) % 100) / 150;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fill();
  }
  ctx.restore();
}

function drawHorizonGlow(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, width * 0.8);
  gradient.addColorStop(0, 'rgba(39,174,96,0.14)');
  gradient.addColorStop(1, 'rgba(39,174,96,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawZoneDividers(
  ctx: CanvasRenderingContext2D,
  zones: ZoneConfig[],
  _players: PlayerState[],
  now: number,
): void {
  if (zones.length <= 1) return;
  ctx.save();
  const dashOffset = (now * 0.05) % 20;
  ctx.setLineDash([10, 10]);
  ctx.lineDashOffset = -dashOffset;
  ctx.lineWidth = 2;

  const seen = new Set<number>();
  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    const rightX = z.x + z.width;
    const bottomY = z.y + z.height;
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;

    if (rightX < canvasW && !seen.has(rightX)) {
      seen.add(rightX);
      const c1 = PLAYER_COLORS[i % 4];
      const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
      grad.addColorStop(0, c1 + '66');
      grad.addColorStop(1, c1 + '22');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(rightX, 0);
      ctx.lineTo(rightX, canvasH);
      ctx.stroke();
    }

    if (bottomY < canvasH && !seen.has(bottomY + 10000)) {
      seen.add(bottomY + 10000);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(0, bottomY);
      ctx.lineTo(canvasW, bottomY);
      ctx.stroke();
    }
  }

  ctx.setLineDash([]);
  ctx.restore();
}

export function drawObject(ctx: CanvasRenderingContext2D, obj: GameObject, now: number): void {
  if (obj.sliced) return;
  ctx.save();
  ctx.translate(obj.x, obj.y);

  const isPowerup = obj.def.kind === 'powerup';
  const isProtected = obj.def.kind === 'protected';
  const pulseScale = (isProtected || isPowerup) ? 1 + Math.sin(now * 0.004) * 0.05 : 1;
  const size = obj.def.size * pulseScale;

  if (isPowerup) {
    ctx.shadowColor = obj.def.color;
    ctx.shadowBlur = 20 + Math.sin(now * 0.005) * 8;
    const orbitAngle = now * 0.003;
    ctx.save();
    ctx.rotate(-obj.rotation);
    for (let i = 0; i < 4; i++) {
      const angle = orbitAngle + (Math.PI * 2 * i) / 4;
      const ox = Math.cos(angle) * (size * 0.7);
      const oy = Math.sin(angle) * (size * 0.7);
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fillStyle = obj.def.color + 'cc';
      ctx.fill();
    }
    ctx.restore();
  } else if (isProtected) {
    ctx.shadowColor = '#27ae60';
    ctx.shadowBlur = 18;
  } else {
    ctx.shadowColor = obj.def.color;
    ctx.shadowBlur = 8;
  }

  ctx.rotate(obj.rotation);
  ctx.font = `${size}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(obj.def.emoji, 0, 0);

  if (isProtected) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,80,80,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    const cs = size * 0.25;
    ctx.strokeStyle = 'rgba(255,80,80,0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-cs, -cs); ctx.lineTo(cs, cs);
    ctx.moveTo(cs, -cs); ctx.lineTo(-cs, cs);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    if (p.alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    if (p.emoji) {
      ctx.font = `${p.radius}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, p.x, p.y);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.restore();
  }
}

export function drawBlade(
  ctx: CanvasRenderingContext2D,
  points: BladePoint[],
  playerColor = '#ffffff',
): void {
  if (points.length < 2) return;
  const now = performance.now();
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const age = now - p2.time;
    const alpha = Math.max(0, 1 - age / 180);
    const segProgress = i / points.length;
    const width = 4 + segProgress * 14;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.lineWidth = width;
    ctx.shadowColor = playerColor;
    ctx.shadowBlur = 15;
    ctx.stroke();

    const hexAlpha = Math.round(alpha * 0.6 * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `${playerColor}${hexAlpha}`;
    ctx.lineWidth = width * 0.4;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }

  const tip = points[points.length - 1];
  if (tip) {
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowColor = playerColor;
    ctx.shadowBlur = 20;
    ctx.fill();
  }

  ctx.restore();
}

export function drawScorePopups(ctx: CanvasRenderingContext2D, popups: ScorePopup[]): void {
  for (const popup of popups) {
    if (popup.alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = popup.alpha;
    ctx.font = 'bold 28px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = popup.color;
    ctx.shadowColor = popup.color;
    ctx.shadowBlur = 12;
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  }
}

export function drawComboIndicator(ctx: CanvasRenderingContext2D, combo: number, zone: ZoneConfig): void {
  if (combo < 2) return;
  ctx.save();
  const text = `${combo}x COMBO!`;
  ctx.font = 'bold 32px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const color = combo >= 5 ? '#FFD700' : combo >= 3 ? '#FF6B35' : '#4CAF50';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillText(text, zone.x + zone.width / 2, zone.y + 60);
  ctx.restore();
}

export function drawFrenzyOverlay(ctx: CanvasRenderingContext2D, zone: ZoneConfig, now: number): void {
  ctx.save();
  const alpha = 0.06 + Math.sin(now * 0.008) * 0.04;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
  ctx.globalAlpha = 0.5 + Math.sin(now * 0.01) * 0.2;
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3;
  ctx.strokeRect(zone.x + 2, zone.y + 2, zone.width - 4, zone.height - 4);
  ctx.restore();
}

export function drawSlowMoOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#40c4ff';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function drawProtectedWarning(ctx: CanvasRenderingContext2D, zone: ZoneConfig, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
  ctx.restore();
}

export function drawPowerupAnnouncement(
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  zone: ZoneConfig,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 36px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.fillText(text, zone.x + zone.width / 2, zone.y + zone.height / 2);
  ctx.restore();
}

export function drawChampionBadge(ctx: CanvasRenderingContext2D, zone: ZoneConfig, streak: number): void {
  if (streak < 2) return;
  ctx.save();
  ctx.font = 'bold 13px Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8;
  ctx.fillText(`${streak}x CHAMP`, zone.x + zone.width - 8, zone.y + 8);
  ctx.restore();
}
