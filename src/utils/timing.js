import { HIT_WINDOWS } from "../config/gameConfig";
import { clamp } from "./math";
import {
  HIT_POINT,
  POST_HIT_TRAVEL,
  RING_START_SCALE,
} from "../config/gameConfig";
import * as THREE from "three";

export function getHitResult(scale) {
  const offset = Math.abs(scale - 1);
  return HIT_WINDOWS.find((window) => offset <= window.maxOffset) || null;
}

export function getEnemyUiScale(enemy) {
  const toHit = new THREE.Vector3().copy(HIT_POINT).sub(enemy.mesh.position);
  const signedDistanceToHit = toHit.dot(enemy.direction);

  if (signedDistanceToHit >= 0) {
    const progress = clamp(
      signedDistanceToHit / Math.max(enemy.startDistance, 0.001),
      0,
      1,
    );
    return 1 + progress * (RING_START_SCALE - 1);
  }

  const afterHitDistance = -signedDistanceToHit;
  const progressAfterHit = clamp(afterHitDistance / POST_HIT_TRAVEL, 0, 1);
  return 1 - progressAfterHit;
}
