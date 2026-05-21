"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = {
  view: string;
  onAddPoint: (pos: THREE.Vector3) => void;
  onSelectPoint: (index: number) => void;
  selectedIndex: number | null;
  points: { position: THREE.Vector3; severity: "green" | "yellow" | "orange" | "red" }[];
};

type ModelProps = {
  onAddPoint: (pos: THREE.Vector3) => void;
  setModelRef: React.RefObject<THREE.Mesh | null>;
};


type ZoomPanControllerProps = {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
};

function ZoomPanController({ controlsRef }: ZoomPanControllerProps) {
  const { camera } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    const distance = camera.position.distanceTo(controls.target);

    // Allow panning ONLY when zoomed in
    controls.enablePan = distance < 180; // adjust threshold as needed
  });

  return null;
}

function Model({ onAddPoint, setModelRef }: ModelProps) {
  const gltf = useGLTF("/aircraft/SU-30/source/what.glb");

  return (
    <primitive
        object={gltf.scene}
        scale={[6, 6, 6]}           // size fix
        rotation={[0, Math.PI, 0]}     // orientation fix
        ref={setModelRef}              // for raycasting
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();

            const isRightClick = e.button === 2;
            if (!isRightClick) return; // Only add points on right-click

            onAddPoint(e.point as THREE.Vector3); // exact 3D hit point
        }}
    />
  );
}

type DamagePointsProps = {
  points: { position: THREE.Vector3; severity: "green" | "yellow" | "orange" | "red" }[];
};

function getColor(s: string) {
  if (s === "red") return "red";
  if (s === "orange") return "orange";
  if (s === "yellow") return "yellow";
  return "green";
}

function DamagePoints({ points, selectedIndex, onSelectPoint }: any) {
  return (
    <>
      {points.map((p: any, i: number) => (
        <mesh
          key={i}
          position={p.position}

          onClick={(e: any) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            onSelectPoint(i);
          }}
        >
          <sphereGeometry args={[2, 16, 16]} />

          <meshBasicMaterial
            color={getColor(p.severity)}
            opacity={selectedIndex === i ? 1 : 0.7}
            transparent
          />
        </mesh>
      ))}
    </>
  );
}


type CameraControllerProps = {
  view: string;
  modelRef: React.RefObject<THREE.Mesh | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
};

function CameraController({ view, modelRef, controlsRef }: CameraControllerProps) {
  const { camera } = useThree();

  useEffect(() => {
    if (!modelRef?.current) return;

    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    const DIST = maxDim * 2.2; // key factor

    camera.up.set(0, 1, 0); // ensure Y-up

    if (view === "TOP") {
        camera.position.set(center.x, center.y + DIST, center.z);
        camera.up.set(1, 0, 0); // Z-up for top view
    }
    if (view === "BOTTOM") {
        camera.position.set(center.x, center.y - DIST, center.z);
        camera.up.set(-1, 0, 0); // Z-up for bottom view
    }

    if (view === "LEFT") {
        camera.position.set(center.x + DIST, center.y, center.z);
        camera.up.set(0, 1, 0); // Z-up for left view
    }
    if (view === "RIGHT") {
        camera.position.set(center.x - DIST, center.y, center.z);
        camera.up.set(0, 1, 0); // Z-up for right view
    }

    if (view === "FRONT") {
        camera.position.set(center.x, center.y, center.z + DIST);
        camera.up.set(0, 1, 0); // Z-up for front view
    }
    if (view === "AFT") {
        camera.position.set(center.x, center.y, center.z - DIST);
        camera.up.set(0, 0, 1); // Z-up for aft view
    }

    camera.lookAt(center);

    if (controlsRef?.current) {
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
    }
    
  }, [view, camera, modelRef, controlsRef]);

  return null;
}

export default function AircraftViewer({
  view,
  onAddPoint,
  onSelectPoint,
  selectedIndex,
  points,
}: Props) {
  const modelRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className="w-full h-[600px] border rounded">
      <Canvas onPointerDown={(e) => {
        if (e.button ===1) {
            e.preventDefault(); //Disable autoscroll
        }
      }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <CameraController view={view} modelRef={modelRef} controlsRef={controlsRef} />

        <ZoomPanController controlsRef={controlsRef} />

        <Model onAddPoint={onAddPoint} setModelRef={modelRef} />

        <DamagePoints points={points} selectedIndex={selectedIndex} onSelectPoint={onSelectPoint} />

        <OrbitControls
          ref={controlsRef}
          enableRotate={false}   // lock rotation
          enablePan={false}      // lock panning
          enableZoom={true}     // allow zooming
          
        mouseButtons={{
            LEFT: undefined,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: undefined,
        }}

          minDistance={40}       // zoom in limit
          maxDistance={200}      // default zoom (can't zoom out further)

          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
