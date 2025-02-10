'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import SplitType from 'split-type';
import { useFrame, useGLTF, useLoader } from '@react-three/fiber';
import { PerspectiveCamera, useScroll, ScrollControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

class Island {
  constructor(canvasId) {
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.fov = 40;
    this.nearPlane = 1;
    this.farPlane = 1000;
    this.canvasId = canvasId;
    this.controls = undefined;
    this.ambientLight = undefined;
    this.directionalLight = undefined;
  }

  initialize() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.x = -2.65;
    this.camera.position.y = -0.96;
    this.camera.position.z = 0;

    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87CEEB, 1);
    document.getElementsByClassName("canvas-container")[0].appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(0, 0, -8);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.ambientLight.castShadow = true;
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 32, 64);
    this.scene.add(this.directionalLight);
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

const Textbox = ({ children }) => {
  return (
    <div className="max-w-xl bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-lg">
      {children}
      <div className="relative">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300/75 rounded-full animate-firefly"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

function Scene() {
  const gltf = useLoader(GLTFLoader, '/home/scene.gltf');
  const cameraRef = useRef();
  const scroll = useScroll();
  
  // Camera animation points
  const cameraPositions = [
    { pos: [0, 2, 5], rot: [0, 0, 0] },         
    { pos: [0, 2, 2], rot: [0, Math.PI/4, 0] }, 
    { pos: [2, 2, 0], rot: [0, Math.PI/2, 0] }, 
    { pos: [0, 3, -2], rot: [0.3, Math.PI, 0] }, 
    { pos: [0, 4, 0], rot: [0.5, 0, 0] }        
  ];

  useFrame((state, delta) => {
    const scrollProgress = scroll.offset;

    const segment = Math.min(
      Math.floor(scrollProgress * (cameraPositions.length - 1)),
      cameraPositions.length - 2
    );
    
    const segmentProgress = (scrollProgress * (cameraPositions.length - 1)) % 1;
    
    const current = cameraPositions[segment];
    const next = cameraPositions[segment + 1];
    
    if (cameraRef.current) {
      cameraRef.current.position.x = gsap.utils.interpolate(
        current.pos[0],
        next.pos[0],
        segmentProgress
      );
      cameraRef.current.position.y = gsap.utils.interpolate(
        current.pos[1],
        next.pos[1],
        segmentProgress
      );
      cameraRef.current.position.z = gsap.utils.interpolate(
        current.pos[2],
        next.pos[2],
        segmentProgress
      );
      
      cameraRef.current.rotation.x = gsap.utils.interpolate(
        current.rot[0],
        next.rot[0],
        segmentProgress
      );
      cameraRef.current.rotation.y = gsap.utils.interpolate(
        current.rot[1],
        next.rot[1],
        segmentProgress
      );
      cameraRef.current.rotation.z = gsap.utils.interpolate(
        current.rot[2],
        next.rot[2],
        segmentProgress
      );
    }
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 2, 5]}
        fov={75}
      />
      
      <primitive 
        object={gltf.scene}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

export default function LandingPage() {
  return (
    <div style={{ height: '500vh' }}> 
      <div style={{ position: 'fixed', width: '100%', height: '100vh' }}>
        <Canvas>
          <ScrollControls pages={5}> {/* Number of pages to scroll through */}
            <Scene />
          </ScrollControls>
        </Canvas>
      </div>
    </div>
  );
}