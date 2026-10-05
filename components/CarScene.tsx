/* eslint-disable react-hooks/immutability */
"use client";

import {
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import {
  Canvas,
  type ThreeEvent,
  useThree,
} from "@react-three/fiber";

import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

import ExhaustSmoke from "./ExhaustSmoke";

import * as THREE from "three";

import gsap from "gsap";

import type {
  OrbitControls as OrbitControlsImpl,
} from "three-stdlib";

type CarModelProps = {
  carRef: RefObject<THREE.Group | null>;
  engineOn: boolean;
  onCarClick: () => void;
};

const FRONT_LIGHT_MATERIAL = "Lights_Front.005";
const REAR_LIGHT_MATERIAL = "Lights_Rear.005";

function Garage() {
  const { scene } = useGLTF("/models/brutalist_interior.glb");
  const prepared = useRef(false);

  useLayoutEffect(() => {
    if (prepared.current) return;
    prepared.current = true;

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.receiveShadow = true;
      object.castShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;

        material.roughness = Math.max(material.roughness, 0.45);
        material.metalness = Math.min(material.metalness, 0.25);
        material.envMapIntensity = 0.55;
        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return <primitive object={scene} position={[0, 0, 0]} />;
}

function GarageLighting() {
  return (
    <>
      <ambientLight intensity={0.08} color="#b8c7d8" />
      <directionalLight
        position={[0, 8, 2]}
        intensity={1.8}
        color="#dceaff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight position={[0, 5, 8]} intensity={65} color="#ffffff" angle={0.55} penumbra={0.9} distance={25} castShadow />
      <pointLight position={[-8, 2.8, 0]} intensity={18} color="#4e8dff" distance={16} />
      <pointLight position={[8, 2.8, 0]} intensity={18} color="#4e8dff" distance={16} />
      <spotLight position={[0, 3.2, -10]} intensity={75} color="#c9dcff" angle={0.65} penumbra={1} distance={25} />
      <pointLight position={[-12, 1.8, -8]} intensity={8} color="#ff9d68" distance={12} />
      <pointLight position={[12, 1.8, -8]} intensity={8} color="#ff9d68" distance={12} />
    </>
  );
}

function GarageCeilingLights() {
  return (
    <>
      <mesh position={[-6, 3.45, -2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.04, 13]} />
        <meshBasicMaterial color="#dcecff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.45, -2]}>
        <boxGeometry args={[0.08, 0.04, 13]} />
        <meshBasicMaterial color="#dcecff" toneMapped={false} />
      </mesh>
      <mesh position={[6, 3.45, -2]}>
        <boxGeometry args={[0.08, 0.04, 13]} />
        <meshBasicMaterial color="#dcecff" toneMapped={false} />
      </mesh>
    </>
  );
}

function CarModel({ carRef, engineOn, onCarClick }: CarModelProps) {
  const { scene } = useGLTF("/models/mercedes_sls.glb");
  const frontLightMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const rearLightMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const frontLightObjects = useRef<THREE.Mesh[]>([]);
  const headlightOverlays = useRef<THREE.Mesh[]>([]);
  const headlightSources = useRef<THREE.PointLight[]>([]);
  const prepared = useRef(false);

  useLayoutEffect(() => {
    if (prepared.current) return;
    prepared.current = true;

    frontLightMaterials.current = [];
    rearLightMaterials.current = [];
    frontLightObjects.current = [];
    headlightOverlays.current = [];
    headlightSources.current = [];

    const originalBox = new THREE.Box3().setFromObject(scene);
    const originalSize = new THREE.Vector3();
    originalBox.getSize(originalSize);

    const maxDimension = Math.max(originalSize.x, originalSize.y, originalSize.z);
    if (maxDimension > 0) {
      scene.scale.setScalar(5 / maxDimension);
    }

    const centeredBox = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    centeredBox.getCenter(center);

    scene.position.x -= center.x;
    scene.position.z -= center.z;

    const groundBox = new THREE.Box3().setFromObject(scene);
    scene.position.y -= groundBox.min.y;

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;

      const originalMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const materials = originalMaterials.map((material) => material.clone());
      object.material = Array.isArray(object.material) ? materials : materials[0];

      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;

        const materialName = (material.name || "").trim();

        if (materialName === FRONT_LIGHT_MATERIAL) {
          material.emissiveMap = null;
          material.color.set("#ffffff");
          material.emissive.set("#ffffff");
          material.emissiveIntensity = 0;
          material.metalness = 0;
          material.roughness = 0.01;
          material.transparent = false;
          material.opacity = 1;
          material.toneMapped = false;
          material.needsUpdate = true;

          frontLightMaterials.current.push(material);
          if (!frontLightObjects.current.includes(object)) {
            frontLightObjects.current.push(object);
          }
          return;
        }

        if (materialName === REAR_LIGHT_MATERIAL) {
          if (material.map) material.emissiveMap = material.map;
          material.color.set("#ff1111");
          material.emissive.set("#ff1111");
          material.emissiveIntensity = 0;
          material.toneMapped = false;
          material.needsUpdate = true;

          rearLightMaterials.current.push(material);
          return;
        }

        const lowerName = materialName.toLowerCase();
        const isGlass = lowerName.includes("glass") || lowerName.includes("window") || lowerName.includes("windshield");
        if (isGlass) {
          material.color.set("#111820");
          material.metalness = 0.15;
          material.roughness = 0.08;
          material.transparent = true;
          material.opacity = 0.72;
          material.envMapIntensity = 1.2;
          material.needsUpdate = true;
          return;
        }

        const isTire = lowerName.includes("tire") || lowerName.includes("tyre") || lowerName.includes("rubber");
        if (isTire) {
          material.color.set("#050505");
          material.metalness = 0;
          material.roughness = 0.82;
          material.needsUpdate = true;
          return;
        }

        const isChrome = lowerName.includes("chrome") || lowerName.includes("rim") || lowerName.includes("wheel");
        if (isChrome) {
          material.metalness = 0.95;
          material.roughness = 0.15;
          material.envMapIntensity = 1.7;
          material.needsUpdate = true;
          return;
        }

        material.color.set("#727780");
        material.metalness = 0.9;
        material.roughness = 0.18;
        material.envMapIntensity = 1.5;
        material.needsUpdate = true;
      });
    });

    frontLightObjects.current.forEach((originalMesh) => {
      const overlayMaterial = new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      });

      const overlay = new THREE.Mesh(originalMesh.geometry, overlayMaterial);
      overlay.scale.set(1.002, 1.002, 1.002);
      overlay.renderOrder = 9999;
      originalMesh.add(overlay);
      headlightOverlays.current.push(overlay);

      const pointLight = new THREE.PointLight("#ffffff", 0, 10, 1);
      const localBox = new THREE.Box3().setFromObject(originalMesh);
      const worldCenter = new THREE.Vector3();
      localBox.getCenter(worldCenter);
      const localCenter = originalMesh.worldToLocal(worldCenter.clone());
      pointLight.position.copy(localCenter);
      originalMesh.add(pointLight);
      headlightSources.current.push(pointLight);
    });

    scene.scale.multiplyScalar(0.92);
    scene.position.z += 0.7;
    scene.position.y += 0.08;

    return () => {
      headlightSources.current.forEach((light) => {
        light.parent?.remove(light);
        light.dispose();
      });

      headlightOverlays.current.forEach((overlay) => {
        overlay.parent?.remove(overlay);
        if (Array.isArray(overlay.material)) {
          overlay.material.forEach((material) => material.dispose());
        } else {
          overlay.material.dispose();
        }
      });

      headlightSources.current = [];
      headlightOverlays.current = [];
      frontLightObjects.current = [];
      frontLightMaterials.current.forEach((material) => material.dispose());
      rearLightMaterials.current.forEach((material) => material.dispose());
      frontLightMaterials.current = [];
      rearLightMaterials.current = [];
    };
  }, [scene]);

  useLayoutEffect(() => {
    frontLightMaterials.current.forEach((material) => {
      gsap.to(material, {
        emissiveIntensity: engineOn ? 80 : 0,
        duration: engineOn ? 0.35 : 0.25,
        ease: engineOn ? "power3.out" : "power2.inOut",
        overwrite: true,
      });
    });

    headlightOverlays.current.forEach((overlay) => {
      const materials = Array.isArray(overlay.material) ? overlay.material : [overlay.material];
      materials.forEach((material) => {
        gsap.to(material, {
          opacity: engineOn ? 1 : 0,
          duration: engineOn ? 0.3 : 0.2,
          ease: engineOn ? "power3.out" : "power2.inOut",
          overwrite: true,
        });
      });
    });

    headlightSources.current.forEach((light) => {
      gsap.to(light, {
        intensity: engineOn ? 180 : 0,
        duration: engineOn ? 0.3 : 0.25,
        ease: engineOn ? "power3.out" : "power2.inOut",
        overwrite: true,
      });
    });

    rearLightMaterials.current.forEach((material) => {
      gsap.to(material, {
        emissiveIntensity: engineOn ? 4 : 0,
        duration: engineOn ? 0.5 : 0.45,
        ease: engineOn ? "power2.out" : "power2.inOut",
        overwrite: true,
      });
    });
  }, [engineOn]);

  return (
    <group ref={carRef}>
      <primitive
        object={scene}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onCarClick();
        }}
      />
    </group>
  );
}

function EngineIdle({ active, carRef }: { active: boolean; carRef: RefObject<THREE.Group | null> }) {
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const car = carRef.current;
    if (!car) return;

    timeline.current?.kill();
    gsap.to(car.rotation, { x: 0, z: 0, duration: 0.25, ease: "power2.out" });

    if (!active) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(car.rotation, {
      x: THREE.MathUtils.degToRad(0.08),
      z: THREE.MathUtils.degToRad(0.04),
      duration: 0.12,
      ease: "power1.inOut",
    });
    tl.to(car.rotation, {
      x: 0,
      z: 0,
      duration: 0.18,
      ease: "power1.inOut",
    });

    timeline.current = tl;
    return () => {
      tl.kill();
    };
  }, [active, carRef]);

  return null;
}

function CinematicCamera({ carRef, controlsRef }: { carRef: RefObject<THREE.Group | null>; controlsRef: RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    perspectiveCamera.position.set(5.8, 2.5, 7.0);
    perspectiveCamera.lookAt(0, 1.0, 0);

    if (controlsRef.current) controlsRef.current.enabled = false;

    const timeline = gsap.timeline({ delay: 0.35 });
    timeline.to(perspectiveCamera.position, {
      x: 5.2,
      y: 2.3,
      z: 6.4,
      duration: 3.2,
      ease: "power3.inOut",
      onUpdate: () => {
        perspectiveCamera.lookAt(0, 1.0, 0);
      },
    });

    if (carRef.current) {
      timeline.to(
        carRef.current.scale,
        { x: "+=0.08", y: "+=0.08", z: "+=0.08", duration: 3.2, ease: "power3.out" },
        0
      );
      timeline.to(
        carRef.current.position,
        { z: "-=0.7", y: "-=0.08", duration: 3.2, ease: "power3.out" },
        0
      );
    }

    timeline.call(() => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    });

    return () => {
      timeline.kill();
    };
  }, [camera, carRef, controlsRef]);

  return null;
}

function GarageScene() {
  return (
    <>
      <Garage />
      <GarageLighting />
      <GarageCeilingLights />
    </>
  );
}

function Scene() {
  const carRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [engineOn, setEngineOn] = useState(false);

  const handleCarClick = () => {
    setEngineOn((previous) => !previous);
  };

  return (
    <>
      <Suspense fallback={null}>
        <GarageScene />
      </Suspense>

      <CinematicCamera carRef={carRef} controlsRef={controlsRef} />

      <Suspense fallback={null}>
        <CarModel carRef={carRef} engineOn={engineOn} onCarClick={handleCarClick} />
        <Environment preset="studio" environmentIntensity={0.45} />
        <ExhaustSmoke active={engineOn} />
      </Suspense>

      <EngineIdle active={engineOn} carRef={carRef} />

      <OrbitControls
        ref={controlsRef}
        enabled={false}
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        rotateSpeed={0.65}
        enableDamping={true}
        dampingFactor={0.07}
        minPolarAngle={Math.PI / 2.65}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1, 0]}
      />
    </>
  );
}

export default function CarScene() {
  const [webglFailed, setWebglFailed] = useState(() => {
    if (typeof window === "undefined") return false;

    const testCanvas = document.createElement("canvas");
    return !(testCanvas.getContext("webgl2") || testCanvas.getContext("webgl"));
  });

  const maxDpr = useMemo(() => (typeof window === "undefined" ? 1.5 : Math.min(window.devicePixelRatio || 1, 1.5)), []);

  if (webglFailed) {
    return (
      <div className="car-scene-fallback" role="status" aria-live="polite">
        <div>
          <strong>WEBGL UNAVAILABLE</strong>
          <span>
            AUREL&apos;s immersive garage cannot initialize in this browser environment, but the website content remains fully accessible and the experience is ready when WebGL is available.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="car-scene">
      <Canvas
        shadows
        camera={{ position: [5.8, 2.5, 7.0], fov: 38, near: 0.1, far: 100 }}
        dpr={[1, maxDpr]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          depth: true,
          stencil: false,
          failIfMajorPerformanceCaveat: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#030405");
          gl.outputColorSpace = THREE.SRGBColorSpace;

          const handleContextLoss = () => setWebglFailed(true);
          const handleContextRestore = () => setWebglFailed(false);

          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            handleContextLoss();
          });

          gl.domElement.addEventListener("webglcontextrestored", handleContextRestore);
        }}
      >
        <color attach="background" args={["#030405"]} />
        <Scene />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/mercedes_sls.glb");
useGLTF.preload("/models/brutalist_interior.glb");
