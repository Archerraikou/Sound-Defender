import * as THREE from "three";

export const ENEMIES_CONFIG = {
  red: {
    color: 0xff4d6d,
    maxHp: 5,
    speed: 4.8,
    radius: 0.5,
    label: "Kick Distortion",
    contactDamage: 12,
  },
  blue: {
    color: 0x4dabf7,
    maxHp: 7,
    speed: 4.2,
    radius: 0.62,
    label: "Bass Warp",
    contactDamage: 10,
  },
};

export const PLAYER_MAX_HP = 100;

export const HIT_POINT = new THREE.Vector3(0, 0, 1.8);
export const RING_START_SCALE = 2.8;
export const POST_HIT_TRAVEL = 1.35;

export const SPAWN_AREA = {
  xMin: -4.5,
  xMax: 4.5,
  yMin: -0.2,
  yMax: 2.8,
  zMin: -24,
  zMax: -12,
};

export const HIT_WINDOWS = [
  { label: "Perfect", maxOffset: 0.08, damage: 2.4, score: 300 },
  { label: "Great", maxOffset: 0.18, damage: 1.8, score: 220 },
  { label: "Good", maxOffset: 0.32, damage: 1.2, score: 140 },
  { label: "Bad", maxOffset: 0.5, damage: 0.7, score: 80 },
];

export const CAMERA_CONFIG = {
  fov: 65,
  near: 0.1,
  far: 100,
  position: { x: 0, y: 0.8, z: 6.5 },
  lookAt: { x: 0, y: 0, z: 0 },
};

export const FLASH_DURATION = 140;
export const PLAYER_HIT_FLASH_DURATION = 150;
