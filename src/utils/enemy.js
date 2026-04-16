import * as THREE from "three";
import { randomRange } from "./math";
import { HIT_POINT, SPAWN_AREA } from "../config/gameConfig";

export function respawnEnemy(enemy) {
  const spawnPosition = new THREE.Vector3(
    randomRange(SPAWN_AREA.xMin, SPAWN_AREA.xMax),
    randomRange(SPAWN_AREA.yMin, SPAWN_AREA.yMax),
    randomRange(SPAWN_AREA.zMin, SPAWN_AREA.zMax),
  );

  enemy.mesh.position.copy(spawnPosition);
  enemy.startDistance = spawnPosition.distanceTo(HIT_POINT);
  enemy.direction.copy(HIT_POINT).sub(spawnPosition).normalize();
  enemy.mesh.visible = true;
}

export function createEnemy(scene, id, config) {
  const geometry = new THREE.SphereGeometry(config.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.color,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.18,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    id,
    mesh,
    hp: config.maxHp,
    speed: config.speed,
    direction: new THREE.Vector3(),
    startDistance: 1,
    pulseOffset: Math.random() * Math.PI * 2,
  };
}

export function disposeEnemy(enemy) {
  enemy.mesh.geometry.dispose();
  enemy.mesh.material.dispose();
}
