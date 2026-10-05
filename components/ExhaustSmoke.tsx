"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

type ExhaustSmokeProps = {
  active: boolean;
};

type SmokeParticle = {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  startSize: number;
  opacity: number;
  rotationSpeed: number;
  turbulence: number;
};

/* ============================================================
   SOFT SMOKE TEXTURE
============================================================ */

function createSmokeTexture() {
  const canvas =
    document.createElement("canvas");

  canvas.width = 128;
  canvas.height = 128;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Unable to create smoke texture."
    );
  }

  const gradient =
    context.createRadialGradient(
      64,
      64,
      4,
      64,
      64,
      62
    );

  gradient.addColorStop(
    0,
    "rgba(235,235,235,0.42)"
  );

  gradient.addColorStop(
    0.18,
    "rgba(220,220,220,0.30)"
  );

  gradient.addColorStop(
    0.45,
    "rgba(190,190,190,0.12)"
  );

  gradient.addColorStop(
    0.75,
    "rgba(150,150,150,0.045)"
  );

  gradient.addColorStop(
    1,
    "rgba(100,100,100,0)"
  );

  context.clearRect(
    0,
    0,
    128,
    128
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    128,
    128
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.needsUpdate = true;

  return texture;
}

/* ============================================================
   EXHAUST SMOKE
============================================================ */

export default function ExhaustSmoke({
  active,
}: ExhaustSmokeProps) {
  const groupRef =
    useRef<THREE.Group>(
      null
    );

  const particlesRef =
    useRef<SmokeParticle[]>(
      []
    );

  const texture = useMemo(
    () =>
      createSmokeTexture(),
    []
  );

  const spawnTimer =
    useRef(0);

  /* ==========================================================
     CREATE PARTICLES
  ========================================================== */

  useEffect(() => {
    const group =
      groupRef.current;

    if (!group) {
      return;
    }

    particlesRef.current.forEach(
      (particle) => {
        group.remove(
          particle.sprite
        );

        particle.sprite.material.dispose();
      }
    );

    particlesRef.current = [];

    const particleCount = 50;

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const material =
        new THREE.SpriteMaterial({
          map: texture,

          transparent: true,

          opacity: 0,

          depthWrite: false,

          depthTest: true,

          blending:
            THREE.NormalBlending,

          color:
            new THREE.Color(
              "#c5c5c5"
            ),
        });

      const sprite =
        new THREE.Sprite(
          material
        );

      const particle: SmokeParticle =
        {
          sprite,

          velocity:
            new THREE.Vector3(),

          life: -1,

          maxLife:
            1.6 +
            Math.random() * 1.5,

          size:
            0.52 +
            Math.random() * 0.50,

          startSize:
            0.20 +
            Math.random() * 0.13,

          opacity:
            0.14 +
            Math.random() * 0.12,

          rotationSpeed:
            (Math.random() - 0.5) *
            0.8,

          turbulence:
            0.15 +
            Math.random() * 0.2,
        };

      sprite.visible =
        false;

      group.add(
        sprite
      );

      particlesRef.current.push(
        particle
      );
    }

    return () => {
      particlesRef.current.forEach(
        (particle) => {
          group.remove(
            particle.sprite
          );

          particle.sprite.material.dispose();
        }
      );

      particlesRef.current = [];
    };
  }, [texture]);

  /* ==========================================================
     ANIMATION
  ========================================================== */

  useEffect(() => {
    let animationFrame = 0;

    let previousTime =
      performance.now();

    const animate = (
      currentTime: number
    ) => {
      const group =
        groupRef.current;

      if (!group) {
        animationFrame =
          requestAnimationFrame(
            animate
          );

        return;
      }

      const delta =
        Math.min(
          (currentTime -
            previousTime) /
            1000,
          0.05
        );

      previousTime =
        currentTime;

      /* ======================================================
         ENGINE OFF
      ====================================================== */

      if (!active) {
        particlesRef.current.forEach(
          (particle) => {
            particle.life = -1;

            particle.sprite.visible =
              false;

            const material =
              particle.sprite
                .material as THREE.SpriteMaterial;

            material.opacity = 0;
          }
        );

        spawnTimer.current = 0;

        animationFrame =
          requestAnimationFrame(
            animate
          );

        return;
      }

      /* ======================================================
         SPAWN TIMER
      ====================================================== */

      spawnTimer.current +=
        delta;

      if (
        spawnTimer.current >=
        0.075
      ) {
        spawnTimer.current = 0;

        const particle =
          particlesRef.current.find(
            (item) =>
              item.life < 0
          );

        if (particle) {
          const side =
            Math.random() > 0.5
              ? 1
              : -1;

          /* -----------------------------------------------
             EXHAUST POSITION
          ------------------------------------------------ */

          particle.sprite.position.set(
            side *
              (
                0.43 +
                Math.random() *
                  0.11
              ),

            0.34 +
              Math.random() *
                0.08,

            -2.08 +
              Math.random() *
                0.10
          );

          /* -----------------------------------------------
             SMOKE MOVEMENT
          ------------------------------------------------ */

          particle.velocity.set(
            (Math.random() - 0.5) *
              0.08,

            0.10 +
              Math.random() *
                0.07,

            -0.18 -
              Math.random() *
                0.10
          );

          particle.life = 0;

          particle.maxLife =
            1.5 +
            Math.random() * 1.3;

          particle.size =
            0.52 +
            Math.random() * 0.50;

          particle.startSize =
            0.20 +
            Math.random() * 0.13;

          particle.opacity =
            0.14 +
            Math.random() * 0.12;

          particle.turbulence =
            0.12 +
            Math.random() * 0.22;

          particle.sprite.visible =
            true;

          particle.sprite.scale.set(
            particle.startSize,
            particle.startSize,
            1
          );

          const material =
            particle.sprite
              .material as THREE.SpriteMaterial;

          material.opacity = 0;
        }
      }

      /* ======================================================
         UPDATE PARTICLES
      ====================================================== */

      particlesRef.current.forEach(
        (particle) => {
          if (
            particle.life < 0
          ) {
            return;
          }

          particle.life +=
            delta;

          const progress =
            particle.life /
            particle.maxLife;

          if (
            progress >= 1
          ) {
            particle.life = -1;

            particle.sprite.visible =
              false;

            const material =
              particle.sprite
                .material as THREE.SpriteMaterial;

            material.opacity = 0;

            return;
          }

          /* -----------------------------------------------
             FLOAT UP + MOVE BACK
          ------------------------------------------------ */

          particle.velocity.y +=
            0.035 * delta;

          particle.velocity.x +=
            Math.sin(
              particle.life * 3.5
            ) *
            particle.turbulence *
            delta;

          particle.velocity.z +=
            Math.cos(
              particle.life * 2.7
            ) *
            particle.turbulence *
            0.25 *
            delta;

          particle.sprite.position.addScaledVector(
            particle.velocity,
            delta
          );

          /* -----------------------------------------------
             EXPAND
          ------------------------------------------------ */

          const expansion =
            THREE.MathUtils.lerp(
              particle.startSize,
              particle.size,
              Math.min(
                progress * 1.35,
                1
              )
            );

          particle.sprite.scale.set(
            expansion,
            expansion,
            1
          );

          /* -----------------------------------------------
             FADE
          ------------------------------------------------ */

          let alpha = 1;

          if (
            progress < 0.12
          ) {
            alpha =
              progress / 0.12;
          } else if (
            progress > 0.55
          ) {
            alpha =
              1 -
              (
                progress - 0.55
              ) /
                0.45;
          }

          const material =
            particle.sprite
              .material as THREE.SpriteMaterial;

          material.opacity =
            particle.opacity *
            THREE.MathUtils.clamp(
              alpha,
              0,
              1
            );

          /* -----------------------------------------------
             ROTATION
          ------------------------------------------------ */

          material.rotation +=
            particle.rotationSpeed *
            delta;
        }
      );

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [active]);

  /* ==========================================================
     CLEANUP TEXTURE
  ========================================================== */

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <group
      ref={groupRef}
    />
  );
}