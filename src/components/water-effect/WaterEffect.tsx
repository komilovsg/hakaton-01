import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './WaterEffect.scss';

interface WaterEffectProps {
  className?: string;
  color?: string;
}

export default function WaterEffect({ className = '', color = '#0284c7' }: WaterEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const raindropsRef = useRef<THREE.Mesh[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Wait for container to have dimensions
    const initEffect = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      
      if (width === 0 || height === 0) {
        // Retry if container not ready
        setTimeout(initEffect, 100);
        return;
      }
      
      initThreeJS(width, height);
    };
    
    const initThreeJS = (width: number, height: number) => {

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup (orthographic for 2D effect)
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      1000
    );
    camera.position.z = 100;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create water plane with shader material for ripples
    const geometry = new THREE.PlaneGeometry(width, height, 128, 128);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(-1000, -1000) },
        uResolution: { value: new THREE.Vector2(width, height) },
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          
          // Create smooth wave effect from mouse position
          vec2 mouseUV = uMouse / uResolution;
          float dist = distance(uv, mouseUV);
          
          // Multiple wave frequencies for more realistic effect
          float wave1 = sin(dist * 25.0 - uTime * 4.0) * 0.5;
          float wave2 = sin(dist * 40.0 - uTime * 6.0) * 0.3;
          float wave3 = sin(dist * 60.0 - uTime * 8.0) * 0.2;
          
          // Smooth falloff
          float falloff = exp(-dist * 8.0);
          float combinedWave = (wave1 + wave2 + wave3) * falloff * uIntensity;
          
          pos.z += combinedWave * 15.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vec2 uv = vUv;
          vec2 mouseUV = uMouse / uResolution;
          
          // Calculate distance from mouse
          float dist = distance(uv, mouseUV);
          
          // Create multiple ripple effects
          float ripple1 = sin(dist * 30.0 - uTime * 5.0) * 0.5 + 0.5;
          float ripple2 = sin(dist * 50.0 - uTime * 7.0) * 0.3 + 0.7;
          float ripple3 = sin(dist * 70.0 - uTime * 9.0) * 0.2 + 0.8;
          
          // Smooth falloff
          float falloff = exp(-dist * 6.0);
          
          // Combine ripples
          float combinedRipple = (ripple1 * 0.4 + ripple2 * 0.3 + ripple3 * 0.3) * falloff;
          
          // Add subtle wave pattern
          float wave = sin(uv.x * 10.0 + uTime * 2.0) * 0.1 + 
                      sin(uv.y * 8.0 + uTime * 1.5) * 0.1;
          
          // Combine all effects (softer and more subtle)
          float alpha = (combinedRipple * 0.3 + wave * 0.1) * uIntensity * 0.5;
          
          // Add subtle glow effect
          float glow = exp(-dist * 4.0) * uIntensity * 0.2;
          alpha += glow;
          
          gl_FragColor = vec4(uColor, min(alpha, 0.6));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const waterPlane = new THREE.Mesh(geometry, material);
    scene.add(waterPlane);

    // Create raindrops with more realistic shape
    const createRaindrop = () => {
      // Create smaller teardrop shape
      const dropGeometry = new THREE.ConeGeometry(1.5, 4, 8);
      const dropMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
      });
      const drop = new THREE.Mesh(dropGeometry, dropMaterial);
      
      // Rotate to point downward
      drop.rotation.z = Math.PI;
      
      // Random position near mouse
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 80;
      drop.position.x = mouseRef.current.x + offsetX;
      drop.position.y = mouseRef.current.y + offsetY;
      drop.position.z = 0;
      
      // Smaller scale
      const scale = 0.2 + Math.random() * 0.3;
      drop.scale.setScalar(scale);
      
      // Random rotation
      drop.rotation.z += (Math.random() - 0.5) * 0.5;
      
      scene.add(drop);
      raindropsRef.current.push(drop);
      
      // Remove after animation
      setTimeout(() => {
        scene.remove(drop);
        drop.geometry.dispose();
        drop.material.dispose();
        const index = raindropsRef.current.indexOf(drop);
        if (index > -1) {
          raindropsRef.current.splice(index, 1);
        }
      }, 1500);
    };

    // Mouse move handler
    let lastMouseTime = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const currentTime = Date.now();
      
      mouseRef.current.x = event.clientX - rect.left - width / 2;
      mouseRef.current.y = -(event.clientY - rect.top - height / 2);
      
      if (material.uniforms.uMouse) {
        material.uniforms.uMouse.value.set(
          event.clientX - rect.left,
          height - (event.clientY - rect.top)
        );
      }
      
      // Gradually increase intensity (slower for softer effect)
      if (material.uniforms.uIntensity) {
        material.uniforms.uIntensity.value = Math.min(
          material.uniforms.uIntensity.value + 0.05,
          0.8
        );
      }
      
      // Create raindrop occasionally (throttled, less frequent)
      if (currentTime - lastMouseTime > 100 && Math.random() > 0.75) {
        createRaindrop();
        lastMouseTime = currentTime;
      }
    };

    // Mouse leave handler - reset mouse position and fade out
    const handleMouseLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
      if (material.uniforms.uMouse) {
        material.uniforms.uMouse.value.set(-1000, -1000);
      }
      if (material.uniforms.uIntensity) {
        material.uniforms.uIntensity.value = 0;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      
      if (material.uniforms.uTime) {
        material.uniforms.uTime.value = time;
      }
      
      // Animate raindrops with physics-like movement
      raindropsRef.current.forEach((drop) => {
        // Gravity effect
        drop.position.y -= 3 + Math.random() * 2;
        // Slight horizontal drift
        drop.position.x += (Math.sin(time * 2.0 + drop.position.y * 0.01) * 0.5);
        
        // Rotation
        drop.rotation.z += 0.02;
        
        // Fade out
        if (drop.material instanceof THREE.MeshBasicMaterial) {
          drop.material.opacity = Math.max(0, drop.material.opacity - 0.008);
        }
      });
      
      // Gradually decrease intensity when mouse is not moving
      if (material.uniforms.uIntensity && material.uniforms.uIntensity.value > 0) {
        material.uniforms.uIntensity.value = Math.max(
          0,
          material.uniforms.uIntensity.value - 0.005
        );
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.top = newHeight / 2;
      camera.bottom = -newHeight / 2;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
      
      if (material.uniforms.uResolution) {
        material.uniforms.uResolution.value.set(newWidth, newHeight);
      }
      
      // Update plane geometry
      waterPlane.geometry.dispose();
      waterPlane.geometry = new THREE.PlaneGeometry(newWidth, newHeight, 64, 64);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Dispose of all raindrops
      raindropsRef.current.forEach((drop) => {
        scene.remove(drop);
        drop.geometry.dispose();
        if (drop.material && !Array.isArray(drop.material)) {
          drop.material.dispose();
        }
      });
      raindropsRef.current = [];
      
      // Dispose of water plane
      waterPlane.geometry.dispose();
      material.dispose();
      scene.remove(waterPlane);
      
      // Dispose of renderer
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    };
    
    // Start initialization
    initEffect();
  }, [color]);

  return <div ref={containerRef} className={`water-effect ${className}`} />;
}

