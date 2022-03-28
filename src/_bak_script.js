import "./assets/css/main.css";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import gsap from "gsap";
import * as dat from "dat.gui";

/**
 * Debug
 */
const gui = new dat.GUI({ closed: true });
dat.GUI.toggleHide();

const parameters = {
  materialColor: "#ffffff",
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog("#005185", 1, 50);

/**
 * Objects
 */
const sections = [
  { id: "home", text: "@", mesh: null },
  {
    id: "klaaklok",
    img: "textures/cube/klaaklok.jpg",
    mesh: null,
    url: "https://klaa-klok.netlify.app",
  },
  {
    id: "houloger",
    img: "textures/cube/houloger.jpg",
    mesh: null,
    url: "https://houloger.netlify.app",
  },
  {
    id: "shopping-budget",
    img: "textures/cube/shopping-budget.jpg",
    mesh: null,
    url: "https://shopping-budget.netlify.app",
  },
];
/**
 * Loader of Environment Cube Texture
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();
// Texture
const textureLoader = new THREE.TextureLoader();
const fontLoader = new FontLoader();
let textMeshLoaded = false;
let cubeTexture = null;
const environmentTexture = cubeTextureLoader.load([
  "textures/cube/environmentMaps/px.png",
  "textures/cube/environmentMaps/nx.png",
  "textures/cube/environmentMaps/py.png",
  "textures/cube/environmentMaps/ny.png",
  "textures/cube/environmentMaps/pz.png",
  "textures/cube/environmentMaps/nz.png",
]);
// geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
// Objects
const objectsDistance = 2;
sections.forEach((section, index) => {
  if (section.id !== "home") {
    cubeTexture = textureLoader.load(section.img);
    const material = new THREE.MeshStandardMaterial({
      map: cubeTexture,
      envMap: environmentTexture,
      roughness: -3,
      metalness: 2,
    });
    section.mesh = new THREE.Mesh(geometry, material);
    section.mesh.position.x = index % 2 ? -1 : 1;
    section.mesh.position.y = -objectsDistance * index;
    scene.add(section.mesh);
  } else {
    let text = section.text;
    fontLoader.load("fonts/helvetiker_regular.typeface.json", (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 1.5,
        height: 0.5,
        curveSegments: 100,
      });
      textGeometry.computeBoundingBox();
      textGeometry.center();
      const textMaterials = [
        new THREE.MeshStandardMaterial({
          color: "#66879b",
          roughness: -3,
          metalness: 2,
          envMap: environmentTexture,
          transparent: true,
        }), // front
        new THREE.MeshStandardMaterial({
          color: "#66879b",
          roughness: -3,
          metalness: 2,
          envMap: environmentTexture,
        }), // side
      ];
      section.mesh = new THREE.Mesh(textGeometry, textMaterials);
      section.mesh.position.x = 1;
      section.mesh.position.y = -objectsDistance * index;
      section.mesh.scale.set(1.5, 1.5, 1.5);
      scene.add(section.mesh);
      textMeshLoaded = true;
    });
  }
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#fff", 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight("#fff", 1, 0.5);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
dirLight.position.set(0, 0, 1).normalize();
scene.add(dirLight);

gui.add(pointLight.position, "x").min(-5).max(5).step(0.001).name("Light X");
gui.add(pointLight.position, "y").min(-5).max(5).step(0.001).name("Light Y");
gui.add(pointLight.position, "z").min(-5).max(5).step(0.001).name("Light Z");

/**
 * Particles
 */
// Geometry
const particlesCount = 500;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 - Math.random() * objectsDistance * sections.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: textureLoader,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;
let oldSection = null;
const container = document.querySelector(".container");
function effectOnScroll() {
  scrollY = container.scrollTop;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    oldSection = currentSection;
    currentSection = newSection;
    if (textMeshLoaded) {
      if (oldSection !== null) {
        gsap.to(sections[oldSection].mesh.scale, {
          x: "1",
          y: "1",
          z: "1",
          ease: "power2.inOut",
          duration: 1.5,
        });
        gsap.to(sections[oldSection].mesh.rotation, {
          z: "-=6",
          y: "-=3",
          ease: "power2.inOut",
          duration: 1.5,
        });
      }

      gsap.to(sections[currentSection].mesh.rotation, {
        z: "+=6",
        y: "+=3",
        ease: "power2.inOut",
        duration: 1.5,
      });
      gsap.to(sections[currentSection].mesh.scale, {
        x: "1.5",
        y: "1.5",
        z: "1.5",
        ease: "power2.inOut",
        duration: 1.5,
      });
    }
  }
}

container.addEventListener("scroll", () => {
  effectOnScroll();
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  event.preventDefault();
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate meshes
  if (textMeshLoaded) {
    for (const section of sections) {
      section.mesh.rotation.x += deltaTime * 0.1;
      section.mesh.rotation.y += deltaTime * 0.12;
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// function to open url with animation mesh
const loadUrl = (idProjetct) => {
  const project = sections.filter((section) => section.id === idProjetct)[0];
  const mesh = project.mesh;
  const url = project.url;
  const tl = gsap.timeline({ repeat: 1, yoyo: true });
  tl.add("start")
    .to(
      mesh.position,
      { z: -100, duration: 1, onComplete: openTab, onCompleteParams: [url] },
      "start"
    )
    .to(mesh.rotation, { x: "+=30", duration: 1 }, "start");

  function openTab(url) {
    window.open(url, "_blank").focus();
  }
};
// document ready
(function () {
  const btns = document.querySelectorAll(".btn");
  btns.forEach((btn) => {
    const idProject = btn.dataset.project;

    btn.addEventListener("click", () => {
      loadUrl(idProject);
    });
  });
})();
