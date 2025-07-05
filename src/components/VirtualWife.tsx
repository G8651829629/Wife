import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

interface VirtualWifeProps {
  emotion: string;
  animation: string;
  isListening: boolean;
}

function VRMModel({ emotion, animation, isListening }: VirtualWifeProps) {
  const modelRef = useRef<THREE.Group>();
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [animations, setAnimations] = useState<{ [key: string]: THREE.AnimationClip }>({});

  // Load VRM model
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      '/wife.vrm',
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (vrm) {
          setVrm(vrm);
          vrm.scene.position.set(0, -1, 0);
          vrm.scene.scale.setScalar(1);
          
          // Create animation mixer
          const animationMixer = new THREE.AnimationMixer(vrm.scene);
          setMixer(animationMixer);
        }
      },
      undefined,
      (error) => console.error('Error loading VRM:', error)
    );
  }, []);

  // Load FBX animations
  useEffect(() => {
    const fbxLoader = new FBXLoader();
    const animationFiles = [
      'Administering Cpr',
      'Angry',
      'Female Laying Pose',
      'Happy',
      'Hip Hop Dancing',
      'Kiss',
      'Laughing',
      'Praying',
      'Rumba Dancing',
      'Sad Idle',
      'Standing Greeting'
    ];

    const loadedAnimations: { [key: string]: THREE.AnimationClip } = {};

    animationFiles.forEach((animName) => {
      fbxLoader.load(
        `/Animations/${animName}.fbx`,
        (fbx) => {
          if (fbx.animations && fbx.animations.length > 0) {
            loadedAnimations[animName] = fbx.animations[0];
            setAnimations({ ...loadedAnimations });
          }
        },
        undefined,
        (error) => console.warn(`Could not load animation ${animName}:`, error)
      );
    });
  }, []);

  // Handle animation changes
  useEffect(() => {
    if (!mixer || !vrm || !animations[animation]) return;

    // Stop current animation
    if (currentAction) {
      currentAction.fadeOut(0.5);
    }

    // Start new animation
    const clip = animations[animation];
    const action = mixer.clipAction(clip);
    action.reset().fadeIn(0.5).play();
    setCurrentAction(action);

    return () => {
      if (action) {
        action.fadeOut(0.5);
      }
    };
  }, [animation, mixer, animations, currentAction]);

  // Handle emotion-based expressions
  useEffect(() => {
    if (!vrm) return;

    const expressionManager = vrm.expressionManager;
    if (!expressionManager) return;

    // Reset all expressions
    expressionManager.setValue('happy', 0);
    expressionManager.setValue('sad', 0);
    expressionManager.setValue('angry', 0);
    expressionManager.setValue('surprised', 0);

    // Set emotion-based expression
    switch (emotion) {
      case 'happy':
      case 'laughing':
        expressionManager.setValue('happy', 1);
        break;
      case 'sad':
        expressionManager.setValue('sad', 1);
        break;
      case 'angry':
        expressionManager.setValue('angry', 1);
        break;
      case 'greeting':
        expressionManager.setValue('surprised', 0.5);
        break;
    }
  }, [emotion, vrm]);

  // Animation loop
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    if (vrm) {
      vrm.update(delta);
      
      // Add breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      vrm.scene.scale.y = breathingScale;
      
      // Add listening indicator
      if (isListening) {
        const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.1;
        vrm.scene.scale.setScalar(1 + pulse);
      }
    }
  });

  return vrm ? <primitive object={vrm.scene} ref={modelRef} /> : null;
}

export default function VirtualWife({ emotion, animation, isListening }: VirtualWifeProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, 5]} intensity={0.4} />
        
        <VRMModel 
          emotion={emotion} 
          animation={animation} 
          isListening={isListening} 
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}