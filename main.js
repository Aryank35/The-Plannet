import "./style.css";

import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 9;

// Renderer setup
// const renderer = new THREE.WebGLRenderer({
//     antialias: false
// });

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);


const hdrLoader = new RGBELoader();
hdrLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr',
    function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        // scene.background = texture;
    }
);


const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const colors = ["red", "green", "blue", "yellow"];
const textures = ['./csilla/color.png', './earth/map.jpg', './venus/map.jpg','./volcanic/color.png'];
const spheres = new THREE.Group();

// Create a large background sphere with star texture
const starTextureLoader = new THREE.TextureLoader();

const starTexture = starTextureLoader.load('./stars.jpg'); 
starTexture.colorSpace = THREE.SRGBColorSpace;
// You'll need to provide a star texture image
const starSphereGeometry = new THREE.SphereGeometry(50, 64, 64);
const starSphereMaterial = new THREE.MeshStandardMaterial({
    map: starTexture,
    opacity: 0.1,
    side: THREE.BackSide // Render the inside of the sphere
});
const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
scene.add(starSphere);

const sphereMesh = [];


for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  sphereMesh.push(sphere);
  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);

  spheres.add(sphere);
}
spheres.rotation.x = 0.12;
spheres.position.y = -0.7;
scene.add(spheres);

let lastWheelTime = 0;
const wheelThrottleDelay = 1200; // 2 seconds
let scrollCount = 0;
window.addEventListener('wheel', (event) => {
    const currentTime = Date.now();
    
    if (currentTime - lastWheelTime >= wheelThrottleDelay) {
        lastWheelTime = currentTime;
        
        scrollCount = (scrollCount + 1) % 4;

        gsap.to(spheres.rotation, {
          duration: 1,
          y: `-=${Math.PI / 2}%`,
          ease: 'power2.inOut'
        });

        const headings = document.querySelectorAll(".heading");
        gsap.to(headings,{
          duration: 1,
          y: `-=${100}%`,
          ease: 'power2.inOut'
        })

        if(scrollCount === 0){
          gsap.to(headings,{
            duration: 1,
          y: `0`,
          ease: 'power2.inOut'
          })
        }
    }
});

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;



// setInterval(() => {
//   scrollCount = (scrollCount + 1) % 4;

//   gsap.to(spheres.rotation, {
//     duration: 1,
//     y: `-=${Math.PI / 2}%`,
//     ease: 'power2.inOut'
//   });

//   const headings = document.querySelectorAll(".heading");
//   gsap.to(headings,{
//     duration: 1,
//     y: `-=${100}%`,
//     ease: 'power2.inOut'
//   })

//   if(scrollCount === 0){
//     gsap.to(headings,{
//       duration: 1,
//     y: `0`,
//     ease: 'power2.inOut'
//     })
//   }
// }, 2000);
// Add a test cube
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshNormalMaterial();
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  for(let i = 0;i<sphereMesh.length;i++){
    const sphere = sphereMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
