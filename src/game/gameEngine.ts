import type {
  GameObject,
  Particle,
  ScorePopup,
  ZoneConfig,
  PlayerState,
  PlayerResults,
  GameMode,
  ActivePowerup,
  FrenzyState,
} from '../types/game';
import { BladeTracker } from './blade';
import {
  spawnObjectInZone,
  updateObjects,
  updateParticles,
  updateScorePopups,
  createSplashParticles,
  createPowerupParticles,
  createScorePopup,
  checkSliceCollision,
} from './physics';
import {
  drawBackground,
  drawObject,
  drawParticles,
  drawBlade,
  drawScorePopups,
  drawComboIndicator,
  drawProtectedWarning,
  drawZoneDividers,
  drawFrenzyOverlay,
  drawSlowMoOverlay,
  drawPowerupAnnouncement,
  drawChampionBadge,
  PLAYER_COLORS,
  beginFrame,
  endFrame,
  triggerShake,
} from './renderer';
import { audio } from './audio';
import { getPowerupLabel, getPowerupColor, POWERUP_DURATION_MS } from './powerups';

const MAX_LIVES = 5;
const COMBO_RESET_FRAMES = 30;
const FRENZY_DURATION_MS = 8000;
const FRENZY_COMBO_THRESHOLD = 5;

export interface GameCallbacks {
  onStateUpdate: (players: PlayerState[], slowMo: boolean, frenzy: boolean) => void;
  onGameOver: (results: PlayerResults[], mode: GameMode) => void;
  onChampionRoundEnd?: (winnerId: number, winnerStreak: number, winnerSide: 'left' | 'right', winnerScore: number) => void;
}

interface ZoneState {
  zone: ZoneConfig;
  player: PlayerState;
  blade: BladeTracker;
  objects: GameObject[];
  particles: Particle[];
  scorePopups: ScorePopup[];
  spawnTimer: number;
  nextSpawnInterval: number;
  comboResetTimer: number;
  protectedHitAlpha: number;
  frenzy: FrenzyState;
  powerupAnnouncementText: string;
  powerupAnnouncementColor: string;
  powerupAnnouncementAlpha: number;
}

function makePlayer(id: number): PlayerState {
  return {
    id,
    score: 0,
    lives: MAX_LIVES,
    combo: 0,
    maxCombo: 0,
    itemsSliced: 0,
    isAlive: true,
    activePowerups: [],
    streak: 0,
    shieldActive: false,
  };
}

function buildZones(mode: GameMode, canvasW: number, canvasH: number): ZoneConfig[] {
  if (mode === '2p' || mode === 'champion') {
    const half = canvasW / 2;
    return [
      { playerId: 0, x: 0, y: 0, width: half, height: canvasH },
      { playerId: 1, x: half, y: 0, width: half, height: canvasH, spawnEdge: 'top' as const },
    ];
  }
  if (mode === '4p') {
    const hw = canvasW / 2;
    const hh = canvasH / 2;
    return [
      { playerId: 0, x: 0, y: 0, width: hw, height: hh, spawnEdge: 'top' as const },
      { playerId: 1, x: hw, y: 0, width: hw, height: hh, spawnEdge: 'top' as const },
      { playerId: 2, x: 0, y: hh, width: hw, height: hh, spawnEdge: 'bottom' as const },
      { playerId: 3, x: hw, y: hh, width: hw, height: hh, spawnEdge: 'bottom' as const },
    ];
  }
  return [{ playerId: 0, x: 0, y: 0, width: canvasW, height: canvasH }];
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: GameMode;
  private callbacks: GameCallbacks;
  private playerNames: string[];
  private animFrameId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  private zoneStates: ZoneState[] = [];
  private touchZoneMap = new Map<number, number>();
  private slowMoActive = false;
  private slowMoEndsAt = 0;
  private nextChallengerId = 2;
  private gameOverFired = false;
  private pendingChallenger: { zs: ZoneState; newPlayerId: number } | null = null;
  private speedMultiplier = 1;

  constructor(canvas: HTMLCanvasElement, mode: GameMode, callbacks: GameCallbacks, playerNames: string[] = [], speedMultiplier = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mode = mode;
    this.callbacks = callbacks;
    this.playerNames = playerNames;
    this.speedMultiplier = speedMultiplier;
  }

  start(): void {
    this.gameOverFired = false;
    this.setupZones();
    audio.startMusic();
    this.setupInputHandlers();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  pause(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audio.stopMusic();
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      audio.startMusic();
      this.loop(this.lastTime);
    }
  }

  destroy(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audio.stopMusic();
    this.removeInputHandlers();
  }

  private setupZones(): void {
    const zones = buildZones(this.mode, this.canvas.width, this.canvas.height);
    this.zoneStates = zones.map((zone) => ({
      zone,
      player: makePlayer(zone.playerId),
      blade: new BladeTracker(),
      objects: [],
      particles: [],
      scorePopups: [],
      spawnTimer: 0,
      nextSpawnInterval: Math.round(120 / this.speedMultiplier),
      comboResetTimer: 0,
      protectedHitAlpha: 0,
      frenzy: { active: false, endsAt: 0 },
      powerupAnnouncementText: '',
      powerupAnnouncementColor: '#ffffff',
      powerupAnnouncementAlpha: 0,
    }));
  }

  private loop(timestamp: number): void {
    if (!this.isRunning) return;
    const rawDt = timestamp - this.lastTime;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 50) / 16.67;

    this.updateSlowMo(timestamp);
    this.updateAllZones(dt, timestamp);
    this.renderAll(timestamp);
    this.emitState();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  private updateSlowMo(now: number): void {
    if (this.slowMoActive && now > this.slowMoEndsAt) {
      this.slowMoActive = false;
      audio.setSlowMo(false);
    }
  }

  private updateAllZones(dt: number, now: number): void {
    for (const zs of this.zoneStates) {
      if (!zs.player.isAlive) continue;
      this.updateZone(zs, dt, now);
    }
  }

  private updateZone(zs: ZoneState, dt: number, now: number): void {
    const isFrenzy = zs.frenzy.active && now < zs.frenzy.endsAt;
    if (zs.frenzy.active && now >= zs.frenzy.endsAt) {
      zs.frenzy.active = false;
    }

    zs.spawnTimer += dt;
    if (zs.spawnTimer >= zs.nextSpawnInterval) {
      zs.spawnTimer = 0;
      const count = isFrenzy ? (Math.random() < 0.5 ? 2 : 1) : (Math.random() < 0.3 ? 2 : 1);
      for (let i = 0; i < count; i++) {
        const obj = spawnObjectInZone(zs.zone, zs.player.score, isFrenzy, this.slowMoActive, this.speedMultiplier);
        if (count > 1) {
          const edge = zs.zone.spawnEdge ?? 'bottom';
          if (edge === 'left' || edge === 'right') {
            obj.y = zs.zone.y + zs.zone.height * (i + 1) / (count + 1) + (Math.random() - 0.5) * 40;
          } else {
            obj.x = zs.zone.x + zs.zone.width * (i + 1) / (count + 1) + (Math.random() - 0.5) * 60;
          }
        }
        zs.objects.push(obj);
      }
    }

    zs.blade.update();
    const activeSlice = zs.blade.getActiveSlice();

    for (const obj of zs.objects) {
      if (obj.sliced || obj.offScreen) continue;
      if (!checkSliceCollision(obj, activeSlice)) continue;
      obj.sliced = true;

      if (obj.def.kind === 'protected') {
        if (zs.player.shieldActive) {
          zs.player.shieldActive = false;
          zs.protectedHitAlpha = 0.3;
          audio.playProtectedHit();
          continue;
        }
        zs.protectedHitAlpha = 1;
        audio.playProtectedHit();
        triggerShake(14, 12);
        this.eliminatePlayer(zs);
        return;
      }

      if (obj.def.kind === 'powerup' && obj.def.powerupType) {
        const particles = createPowerupParticles(obj);
        zs.particles.push(...particles);
        this.applyPowerup(zs, obj.def.powerupType, now);
        audio.playPowerup(obj.def.powerupType);
        continue;
      }

      zs.player.itemsSliced++;
      zs.comboResetTimer = 0;

      const particles = createSplashParticles(obj);
      zs.particles.push(...particles);

      zs.player.combo++;
      if (zs.player.combo > zs.player.maxCombo) zs.player.maxCombo = zs.player.combo;

      const hasDouble = zs.player.activePowerups.some((p) => p.type === 'doublepoints' && p.expiresAt > now);
      const points = obj.def.points * (zs.player.combo > 1 ? zs.player.combo : 1) * (hasDouble ? 2 : 1);
      zs.player.score += points;

      zs.scorePopups.push(createScorePopup(obj, zs.player.combo, hasDouble));
      audio.playSlash(zs.player.combo);

      if (zs.player.combo === FRENZY_COMBO_THRESHOLD && !zs.frenzy.active) {
        zs.frenzy.active = true;
        zs.frenzy.endsAt = now + FRENZY_DURATION_MS;
        audio.playFrenzyStart();
      } else if (zs.player.combo > 1) {
        audio.playCombo(zs.player.combo);
      }
    }

    if (zs.blade.isActive) {
      zs.comboResetTimer += dt;
      if (zs.comboResetTimer > COMBO_RESET_FRAMES) {
        zs.player.combo = 0;
        zs.comboResetTimer = 0;
      }
    }

    updateObjects(zs.objects, zs.zone, dt, this.slowMoActive, this.speedMultiplier);

    for (const obj of zs.objects) {
      if (obj.offScreen && !obj.sliced && obj.def.kind === 'pollutant') {
        zs.player.lives--;
        obj.sliced = true;
        audio.playMiss();
        triggerShake(8, 10);
        if (zs.player.lives <= 0) {
          this.eliminatePlayer(zs);
          return;
        }
      }
    }

    zs.objects = zs.objects.filter((o) => !o.offScreen || !o.sliced);
    if (zs.objects.length > 40) zs.objects = zs.objects.slice(-40);

    updateParticles(zs.particles, dt);
    zs.particles = zs.particles.filter((p) => p.alpha > 0);

    updateScorePopups(zs.scorePopups, dt);
    zs.scorePopups = zs.scorePopups.filter((p) => p.alpha > 0);

    if (zs.protectedHitAlpha > 0) {
      zs.protectedHitAlpha = Math.max(0, zs.protectedHitAlpha - 0.06 * dt);
    }

    if (zs.powerupAnnouncementAlpha > 0) {
      zs.powerupAnnouncementAlpha = Math.max(0, zs.powerupAnnouncementAlpha - 0.015 * dt);
    }

    zs.player.activePowerups = zs.player.activePowerups.filter((p) => p.expiresAt > now || p.expiresAt === 0);

    this.updateSpawnInterval(zs, isFrenzy);
  }

  private applyPowerup(zs: ZoneState, type: ActivePowerup['type'], now: number): void {
    const duration = POWERUP_DURATION_MS[type];

    if (type === 'extralife') {
      zs.player.lives = Math.min(zs.player.lives + 1, MAX_LIVES);
    } else if (type === 'slowmo') {
      this.slowMoActive = true;
      this.slowMoEndsAt = now + duration;
      audio.setSlowMo(true);
    } else if (type === 'shield') {
      zs.player.shieldActive = true;
    } else if (type === 'cleansweep') {
      let swept = 0;
      for (const obj of zs.objects) {
        if (!obj.sliced && !obj.offScreen && obj.def.kind === 'pollutant') {
          obj.sliced = true;
          swept++;
          const pts = obj.def.points * (zs.player.combo > 1 ? zs.player.combo : 1);
          zs.player.score += pts;
          zs.particles.push(...createSplashParticles(obj));
        }
      }
      if (swept > 0) zs.player.itemsSliced += swept;
    } else if (type === 'doublepoints') {
      zs.player.activePowerups.push({ type, expiresAt: now + duration });
    }

    zs.powerupAnnouncementText = getPowerupLabel(type);
    zs.powerupAnnouncementColor = getPowerupColor(type);
    zs.powerupAnnouncementAlpha = 1;
  }

  private updateSpawnInterval(zs: ZoneState, isFrenzy: boolean): void {
    const sm = this.speedMultiplier;
    const base = isFrenzy ? Math.round(45 / sm) : Math.round(120 / sm);
    const reduction = Math.min(zs.player.score / 12, 65);
    zs.nextSpawnInterval = Math.max(base - reduction, isFrenzy ? 20 : Math.round(35 / sm));
  }

  private eliminatePlayer(zs: ZoneState): void {
    zs.player.lives = 0;
    zs.player.isAlive = false;
    audio.playGameOver();

    if (this.mode === 'champion') {
      const otherZs = this.zoneStates.find((z) => z !== zs);
      if (otherZs) {
        otherZs.player.streak++;
        const newPlayerId = this.nextChallengerId++;
        this.pendingChallenger = { zs, newPlayerId };
        this.isRunning = false;
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        this.renderAll(performance.now());
        const winnerSide: 'left' | 'right' = otherZs.zone.x === 0 ? 'left' : 'right';
        this.callbacks.onChampionRoundEnd?.(otherZs.player.id, otherZs.player.streak, winnerSide, otherZs.player.score);
        return;
      }
    }

    const allDead = this.zoneStates.every((z) => !z.player.isAlive);
    const onlyOneSurviving = this.zoneStates.filter((z) => z.player.isAlive).length <= (this.mode === '1p' ? 0 : 1);

    if (allDead || onlyOneSurviving) {
      this.triggerGameOver();
    }
  }

  updatePlayerName(index: number, name: string): void {
    this.playerNames[index] = name;
  }

  startNextChampionRound(): void {
    if (!this.pendingChallenger) return;
    const { zs, newPlayerId } = this.pendingChallenger;
    this.pendingChallenger = null;

    zs.player = makePlayer(newPlayerId);
    zs.player.isAlive = true;
    zs.objects = [];
    zs.particles = [];
    zs.scorePopups = [];
    zs.spawnTimer = 0;
    zs.frenzy = { active: false, endsAt: 0 };
    zs.protectedHitAlpha = 0;
    zs.zone.playerId = newPlayerId;

    const championZs = this.zoneStates.find((z) => z !== zs);
    if (championZs) {
      const savedStreak = championZs.player.streak;
      const savedId = championZs.player.id;
      championZs.player = makePlayer(savedId);
      championZs.player.streak = savedStreak;
      championZs.player.isAlive = true;
      championZs.objects = [];
      championZs.particles = [];
      championZs.scorePopups = [];
      championZs.spawnTimer = 0;
      championZs.frenzy = { active: false, endsAt: 0 };
      championZs.protectedHitAlpha = 0;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    audio.startMusic();
    this.loop(this.lastTime);
  }

  private triggerGameOver(): void {
    if (this.gameOverFired) return;
    this.gameOverFired = true;
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audio.stopMusic();

    const sorted = [...this.zoneStates].sort((a, b) => b.player.score - a.player.score);
    const results: PlayerResults[] = sorted.map((zs, idx) => {
      const zoneIdx = this.zoneStates.indexOf(zs);
      return {
        playerId: zs.player.id,
        playerName: this.playerNames[zoneIdx] || `P${zoneIdx + 1}`,
        score: zs.player.score,
        itemsSliced: zs.player.itemsSliced,
        maxCombo: zs.player.maxCombo,
        streak: zs.player.streak,
        isWinner: idx === 0,
      };
    });

    this.renderAll(performance.now());
    setTimeout(() => {
      this.callbacks.onGameOver(results, this.mode);
    }, 300);
  }

  private emitState(): void {
    const players = this.zoneStates.map((zs) => ({ ...zs.player }));
    const anyFrenzy = this.zoneStates.some((zs) => zs.frenzy.active);
    this.callbacks.onStateUpdate(players, this.slowMoActive, anyFrenzy);
  }

  private renderAll(now: number): void {
    const { ctx, canvas } = this;
    beginFrame(ctx);
    drawBackground(ctx, canvas.width, canvas.height);

    if (this.slowMoActive) {
      drawSlowMoOverlay(ctx, canvas.width, canvas.height);
    }

    drawZoneDividers(
      ctx,
      this.zoneStates.map((zs) => zs.zone),
      this.zoneStates.map((zs) => zs.player),
      now,
    );

    for (const zs of this.zoneStates) {
      drawParticles(ctx, zs.particles);

      for (const obj of zs.objects) {
        if (!obj.sliced) drawObject(ctx, obj, now);
      }

      const playerColor = PLAYER_COLORS[zs.player.id % 4];
      drawBlade(ctx, zs.blade.getPoints(), playerColor);
      drawScorePopups(ctx, zs.scorePopups);
      drawComboIndicator(ctx, zs.player.combo, zs.zone);

      if (zs.frenzy.active && now < zs.frenzy.endsAt) {
        drawFrenzyOverlay(ctx, zs.zone, now);
      }

      if (zs.protectedHitAlpha > 0) {
        drawProtectedWarning(ctx, zs.zone, zs.protectedHitAlpha);
      }

      if (zs.powerupAnnouncementAlpha > 0) {
        drawPowerupAnnouncement(
          ctx,
          zs.powerupAnnouncementText,
          zs.powerupAnnouncementColor,
          zs.zone,
          zs.powerupAnnouncementAlpha,
        );
      }

      if (zs.player.streak >= 2) {
        drawChampionBadge(ctx, zs.zone, zs.player.streak);
      }
    }
    endFrame(ctx);
  }

  private getZoneIndexForPoint(x: number, y: number): number {
    for (let i = 0; i < this.zoneStates.length; i++) {
      const z = this.zoneStates[i].zone;
      if (x >= z.x && x < z.x + z.width && y >= z.y && y < z.y + z.height) {
        return i;
      }
    }
    return 0;
  }

  private getCanvasPos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private setupInputHandlers(): void {
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: true });
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
  }

  private removeInputHandlers(): void {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (!this.isRunning) return;
    const pos = this.getCanvasPos(e.clientX, e.clientY);
    const zi = this.getZoneIndexForPoint(pos.x, pos.y);
    const zs = this.zoneStates[zi];
    zs.blade.isActive = true;
    zs.blade.addPoint(pos.x, pos.y);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isRunning) return;
    const pos = this.getCanvasPos(e.clientX, e.clientY);
    const zi = this.getZoneIndexForPoint(pos.x, pos.y);
    const zs = this.zoneStates[zi];
    if (zs.blade.isActive) zs.blade.addPoint(pos.x, pos.y);
  };

  private onMouseUp = (): void => {
    for (const zs of this.zoneStates) {
      zs.blade.isActive = false;
      zs.blade.clear();
      zs.player.combo = 0;
      zs.comboResetTimer = 0;
    }
  };

  private onMouseLeave = (): void => {
    for (const zs of this.zoneStates) {
      zs.blade.isActive = false;
      zs.blade.clear();
    }
  };

  private onTouchStart = (e: TouchEvent): void => {
    if (!this.isRunning) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pos = this.getCanvasPos(touch.clientX, touch.clientY);
      const zi = this.getZoneIndexForPoint(pos.x, pos.y);
      this.touchZoneMap.set(touch.identifier, zi);
      const zs = this.zoneStates[zi];
      zs.blade.isActive = true;
      zs.blade.addPoint(pos.x, pos.y);
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (!this.isRunning) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const zi = this.touchZoneMap.get(touch.identifier) ?? 0;
      const pos = this.getCanvasPos(touch.clientX, touch.clientY);
      const zs = this.zoneStates[zi];
      if (zs.blade.isActive) zs.blade.addPoint(pos.x, pos.y);
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const zi = this.touchZoneMap.get(touch.identifier) ?? 0;
      this.touchZoneMap.delete(touch.identifier);
      const zs = this.zoneStates[zi];
      zs.blade.isActive = false;
      zs.blade.clear();
      zs.player.combo = 0;
      zs.comboResetTimer = 0;
    }
  };
}
