import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  CAMERA_CONFIG,
  ENEMIES_CONFIG,
  FLASH_DURATION,
  HIT_POINT,
  PLAYER_HIT_FLASH_DURATION,
  PLAYER_MAX_HP,
  RING_START_SCALE,
} from "../config/gameConfig";
import { clamp } from "../utils/math";
import { createEnemy, disposeEnemy, respawnEnemy } from "../utils/enemy";
import { getEnemyUiScale, getHitResult } from "../utils/timing";

export function useRhythmGame(mountRef, ringRef) {
  const frameRef = useRef(null);
  const enemiesRef = useRef({});
  const flashTimeoutRef = useRef(null);
  const lastTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const activeEnemyRef = useRef(null);

  const [enemyState, setEnemyState] = useState(() => ({
    red: { hp: ENEMIES_CONFIG.red.maxHp, status: "Ready" },
    blue: { hp: ENEMIES_CONFIG.blue.maxHp, status: "Ready" },
  }));

  const [enemyBars, setEnemyBars] = useState([]);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(null);
  const [judgement, setJudgement] = useState({
    text: "",
    type: "",
    visible: false,
    id: 0,
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);

    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      width / height,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far,
    );
    camera.position.set(
      CAMERA_CONFIG.position.x,
      CAMERA_CONFIG.position.y,
      CAMERA_CONFIG.position.z,
    );
    camera.lookAt(
      CAMERA_CONFIG.lookAt.x,
      CAMERA_CONFIG.lookAt.y,
      CAMERA_CONFIG.lookAt.z,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.position.set(0, 4, 6);
    scene.add(directional);

    const point = new THREE.PointLight(0x88aaff, 18, 40, 2);
    point.position.set(0, 2, 8);
    scene.add(point);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x101826,
        roughness: 0.9,
        metalness: 0.1,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    scene.add(floor);

    const projectionVector = new THREE.Vector3();
    const hpOffsetVector = new THREE.Vector3(0, 0.75, 0);

    const enemies = {};
    Object.entries(ENEMIES_CONFIG).forEach(([id, config]) => {
      enemies[id] = createEnemy(scene, id, config);
      respawnEnemy(enemies[id]);
    });

    enemiesRef.current = enemies;

    lastTimeRef.current = performance.now();
    elapsedRef.current = 0;

    const animate = (now) => {
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      elapsedRef.current += delta;

      let closestEnemy = null;
      let bestScaleOffset = Infinity;
      const nextEnemyBars = [];

      Object.values(enemiesRef.current).forEach((enemy, index) => {
        if (enemy.hp <= 0) {
          enemy.mesh.visible = false;
          return;
        }

        enemy.mesh.visible = true;
        enemy.mesh.position.addScaledVector(
          enemy.direction,
          enemy.speed * delta,
        );

        enemy.mesh.position.y +=
          Math.sin(elapsedRef.current * 3 + enemy.pulseOffset + index) *
          0.15 *
          delta *
          6;

        enemy.mesh.rotation.y += delta * (1 + index * 0.3);
        enemy.mesh.rotation.x += delta * 0.5;

        const distanceToHit = enemy.mesh.position.distanceTo(HIT_POINT);
        const danger = clamp(1 - distanceToHit / 8, 0, 1);
        enemy.mesh.material.emissiveIntensity = 0.35 + danger * 1.2;

        const uiScale = getEnemyUiScale(enemy);
        const scaleOffset = Math.abs(uiScale - 1);

        if (scaleOffset < bestScaleOffset) {
          bestScaleOffset = scaleOffset;
          closestEnemy = enemy;
        }

        projectionVector
          .copy(enemy.mesh.position)
          .addScaledVector(hpOffsetVector, ENEMIES_CONFIG[enemy.id].radius)
          .project(camera);

        const screenX = (projectionVector.x * 0.5 + 0.5) * mount.clientWidth;
        const screenY = (-projectionVector.y * 0.5 + 0.5) * mount.clientHeight;
        const visible =
          projectionVector.z < 1 &&
          projectionVector.z > -1 &&
          screenX >= -80 &&
          screenX <= mount.clientWidth + 80 &&
          screenY >= -40 &&
          screenY <= mount.clientHeight + 40;

        nextEnemyBars.push({
          id: enemy.id,
          x: screenX,
          y: screenY,
          visible,
          hpRatio: clamp(enemy.hp / ENEMIES_CONFIG[enemy.id].maxHp, 0, 1),
          color: ENEMIES_CONFIG[enemy.id].color,
        });

        if (uiScale <= 0) {
          respawnEnemy(enemy);
          setCombo(0);
          setPlayerHp((prev) =>
            clamp(
              prev - ENEMIES_CONFIG[enemy.id].contactDamage,
              0,
              PLAYER_MAX_HP,
            ),
          );
          setEnemyState((prev) => ({
            ...prev,
            [enemy.id]: { ...prev[enemy.id], status: "Player Hit" },
          }));
          setJudgement({
            text: "MISS",
            type: "miss",
            visible: true,
            id: now,
          });

          if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
          setFlash("player-hit");
          flashTimeoutRef.current = setTimeout(
            () => setFlash(null),
            PLAYER_HIT_FLASH_DURATION,
          );
        }
      });

      setEnemyBars(nextEnemyBars);
      activeEnemyRef.current = closestEnemy;

      if (ringRef.current) {
        let scale = RING_START_SCALE;

        if (closestEnemy && closestEnemy.hp > 0) {
          scale = getEnemyUiScale(closestEnemy);
        }

        ringRef.current.style.transform = `translate(-50%, -50%) scale(${Math.max(scale, 0)})`;
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = Math.max(mount.clientWidth, 1);
      const h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameRef.current);

      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }

      Object.values(enemiesRef.current).forEach(disposeEnemy);
      floor.geometry.dispose();
      floor.material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [mountRef, ringRef]);

  useEffect(() => {
    const triggerFlash = (type) => {
      setFlash(type);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(
        () => setFlash(null),
        FLASH_DURATION,
      );
    };

    const showJudgement = (text, type) => {
      setJudgement({
        text,
        type,
        visible: true,
        id: Date.now(),
      });
    };

    const onKeyDown = (event) => {
      if (event.code !== "Space") return;

      const target = activeEnemyRef.current;
      if (!target || target.hp <= 0) return;

      const uiScale = getEnemyUiScale(target);
      const hitResult = getHitResult(uiScale);

      if (hitResult) {
        target.hp = Math.max(0, target.hp - hitResult.damage);
        respawnEnemy(target);

        setCombo((prev) => prev + 1);
        setScore((prev) => prev + hitResult.score);

        setEnemyState((prev) => ({
          ...prev,
          [target.id]: {
            hp: target.hp,
            status: target.hp <= 0 ? "Defeated" : hitResult.label,
          },
        }));

        showJudgement(
          hitResult.label.toUpperCase(),
          hitResult.label.toLowerCase(),
        );
        triggerFlash("hit");
      } else {
        setCombo(0);
        setEnemyState((prev) => ({
          ...prev,
          [target.id]: {
            ...prev[target.id],
            status: "Miss Timing",
          },
        }));
        showJudgement("MISS", "miss");
        triggerFlash("miss");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    enemyState,
    enemyBars,
    playerHp,
    combo,
    score,
    flash,
    judgement,
  };
}
