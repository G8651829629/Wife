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
  isMusicPlaying: boolean;
}

function VRMModel({ emotion, animation, isListening, isMusicPlaying }: VirtualWifeProps) {
  const modelRef = useRef<THREE.Group>();
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [animations, setAnimations] = useState<{ [key: string]: THREE.AnimationClip }>({});
  const [danceAnimations, setDanceAnimations] = useState<THREE.AnimationClip[]>([]);
  const [currentDanceIndex, setCurrentDanceIndex] = useState(0);

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

    const danceFiles = ['Hip Hop Dancing', 'Rumba Dancing'];
    const loadedAnimations: { [key: string]: THREE.AnimationClip } = {};
    const loadedDanceAnimations: THREE.AnimationClip[] = [];

    animationFiles.forEach((animName) => {
      fbxLoader.load(
        `/Animations/${animName}.fbx`,
        (fbx) => {
          if (fbx.animations && fbx.animations.length > 0) {
            const clip = fbx.animations[0];
            loadedAnimations[animName] = clip;
            
            if (danceFiles.includes(animName)) {
              loadedDanceAnimations.push(clip);
            }
            
            setAnimations({ ...loadedAnimations });
            setDanceAnimations([...loadedDanceAnimations]);
          }
        },
        undefined,
        (error) => console.warn(`Could not load animation ${animName}:`, error)
      );
    });
  }, []);

  // Handle music-based dancing
  useEffect(() => {
    if (!mixer || !vrm || danceAnimations.length === 0) return;

    if (isMusicPlaying) {
      // Stop current animation
      if (currentAction) {
        currentAction.fadeOut(0.5);
      }

      // Start dance animation
      const danceClip = danceAnimations[currentDanceIndex];
      const danceAction = mixer.clipAction(danceClip);
      danceAction.reset().fadeIn(0.5).play();
      danceAction.setLoop(THREE.LoopRepeat, Infinity);
      setCurrentAction(danceAction);

      // Switch dance every 30 seconds
      const danceInterval = setInterval(() => {
        setCurrentDanceIndex(prev => (prev + 1) % danceAnimations.length);
      }, 30000);

      return () => clearInterval(danceInterval);
    } else {
      // Return to normal animation when music stops
      if (currentAction && danceAnimations.some(dance => dance === currentAction.getClip())) {
        currentAction.fadeOut(0.5);
        
        // Start normal animation after fade out
        setTimeout(() => {
          if (animations[animation]) {
            const normalClip = animations[animation];
            const normalAction = mixer.clipAction(normalClip);
            normalAction.reset().fadeIn(0.5).play();
            setCurrentAction(normalAction);
          }
        }, 500);
      }
    }
  }, [isMusicPlaying, mixer, vrm, danceAnimations, currentDanceIndex, animations, animation, currentAction]);

  // Handle regular animation changes (when not dancing)
  useEffect(() => {
    if (!mixer || !vrm || !animations[animation] || isMusicPlaying) return;

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
  }, [animation, mixer, animations, currentAction, isMusicPlaying]);

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

      // Add music dancing effects
      if (isMusicPlaying) {
        const musicPulse = Math.sin(state.clock.elapsedTime * 4) * 0.05;
        vrm.scene.position.y = -1 + musicPulse;
        
        // Add subtle rotation for dancing
        vrm.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      } else {
        vrm.scene.position.y = -1;
        vrm.scene.rotation.y = 0;
      }
    }
  });

  return vrm ? <primitive object={vrm.scene} ref={modelRef} /> : null;
}

export default function VirtualWife({ emotion, animation, isListening, isMusicPlaying }: VirtualWifeProps) {
  return (
    <div className="w-full h-full relative">
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
          isMusicPlaying={isMusicPlaying}
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

      {/* Status Indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Emotion: {emotion}
        </div>
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Animation: {animation}
        </div>
        {isListening && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
            Listening...
          </div>
        )}
        {isMusicPlaying && (
          <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
            🎵 Dancing to Music
          </div>
        )}
      </div>
    </div>
  );
}