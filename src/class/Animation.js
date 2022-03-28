// extra lib
import gsap from "gsap";
import * as dat from "dat.gui";
import galaxyVertex from "./shaders/galaxie/vertex.glsl";
import galaxyFragment from "./shaders/galaxie/fragment.glsl";

// THREEJS
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

class Animation {
  constructor(canvas) {
    // Init default vars
    this.objectsDistance = 2;
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    /**
     * BASIC
     */
    this.canvas = document.querySelector(canvas);
    this.initScene();
    this.initCamera();
    this.initLight();
    this.initRender();
    /**
     * MESHES PART
     */
    // to store all meshes
    this.allMeshes = [];
    // init all loaders we need
    this.initLoaders();

    /**
     * SCROLL EVENT
     */
    this.scrollY = window.scrollY;
    this.currentSection = 0;
    this.oldSection = null;
    this.container = document.querySelector(".container");
    /**
     * MOUSE EVENT
     */
    this.cursor = {};
    this.cursor.x = 0;
    this.cursor.y = 0;
    /**
     * PARTICLES PART
     */
    this.particlesGeometry = null;
    this.particlesMaterial = null;
    this.particles = null;
  }
  setSizes(w, h) {
    this.sizes.width = w;
    this.sizes.height = h;
  }
  setDistanceObject(distance) {
    this.objectsDistance = distance;
  }
  initScene() {
    this.scene = new THREE.Scene();
  }
  initCamera() {
    // Group
    this.cameraGroup = new THREE.Group();
    this.scene.add(this.cameraGroup);

    // Base camera
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.camera.position.z = 6;
    this.cameraGroup.add(this.camera);
  }
  initRender() {
    /**
     * Renderer
     */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.render(this.scene, this.camera);

    // Gestion lors du resize de la fenetre
    window.addEventListener("resize", () => {
      // Update sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  initLoaders() {
    /**
     * Loader of Environment Cube Texture
     */
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    // Texture
    this.textureLoader = new THREE.TextureLoader();
    this.environmentTexture = this.cubeTextureLoader.load([
      "textures/cube/environmentMaps/px.png",
      "textures/cube/environmentMaps/nx.png",
      "textures/cube/environmentMaps/py.png",
      "textures/cube/environmentMaps/ny.png",
      "textures/cube/environmentMaps/pz.png",
      "textures/cube/environmentMaps/nz.png",
    ]);

    // Font Loader
    this.fontLoader = new FontLoader();
  }
  setFog(color, near, far) {
    this.scene.fog = new THREE.Fog(color, near, far);
  }
  addMeshText(text) {
    return new Promise((resolve, reject) => {
      this.fontLoader.load(
        "fonts/helvetiker_regular.typeface.json",
        (font) => {
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
              color: "#FFD700",
              roughness: -3,
              metalness: 2,
              envMap: this.environmentTexture,
              envMapIntensity: 0.7,
              transparent: true,
            }), // front
            new THREE.MeshStandardMaterial({
              color: "#aa8e01",
              roughness: -3,
              metalness: 2,
              envMap: this.environmentTexture,
              envMapIntensity: 0.7,
            }), // side
          ];
          const textMesh = new THREE.Mesh(textGeometry, textMaterials);
          this.scene.add(textMesh);
          textMesh.name = "TexteA";
          // on store la mesh
          this.allMeshes.push(textMesh);
          console.log(this.allMeshes);
          // on previent que le text est bien ajouté
          resolve(true);
        },
        // onProgress callBack
        () => {},
        // onError callBack
        (err) => {
          // on previent qu'il y a une erreur lors du chargement du texte
          reject(err);
        }
      );
    });
  }
  addMeshCube(cube) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeTexture = this.textureLoader.load(cube.img);
    const material = new THREE.MeshStandardMaterial({
      map: cubeTexture,
      envMap: this.environmentTexture,
      envMapIntensity: 0.7,
      roughness: 0,
      metalness: 2.5,
    });
    const meshCube = new THREE.Mesh(geometry, material);
    meshCube.name = cube.id;
    this.scene.add(meshCube);
    // on store la mesh
    this.allMeshes.push(meshCube);
  }
  alignMeshes() {
    // on loop sur toutes les meshes dispo
    this.allMeshes.forEach((mesh, index) => {
      // on reparti chaque mesh à -1 ou 1 sur x
      mesh.position.x = index % 2 ? -1 : 1;
      // on distance chaque mesh en y
      mesh.position.y = -this.objectsDistance * index;
    });
  }
  /** LIGHTS */
  initLight() {
    this.ambientLight = new THREE.AmbientLight("#FFF", -0.8);
    this.scene.add(this.ambientLight);
  }
  createParticles(count) {
    /**
     * Params
     */
    const parameters = {};
    parameters.count = count;
    parameters.size = 0.5;
    parameters.radius = 20;
    parameters.branches = 1;
    parameters.spin = 1;
    parameters.randomness = 2;
    parameters.randomnessPower = -1;
    parameters.insideColor = "#FFF";
    parameters.outsideColor = "#FFF";
    /**
     * Geometry
     */
    // clean version
    this.particlesGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1);
    const randomness = new Float32Array(parameters.count * 3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // Position
      const radius = Math.random() * parameters.radius;

      const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      positions[i3] = Math.cos(branchAngle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(branchAngle) * radius;

      // Randomness
      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1.5 : -1.5);
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? -1.5 : 1.5);
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1.5 : -1.5);

      randomness[i3 + 0] = randomX;
      randomness[i3 + 1] = randomY;
      randomness[i3 + 2] = randomZ;

      // Color
      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Scale
      scales[i] = Math.random();
    }

    this.particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
    this.particlesGeometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(scales, 1)
    );
    this.particlesGeometry.setAttribute(
      "aRandomness",
      new THREE.BufferAttribute(randomness, 3)
    );

    /**
     * Material
     */
    this.particlesMaterial = new THREE.ShaderMaterial({
      depthWrite: false,
      color: "#ff0000",
      blending: THREE.AdditiveBlending,
      transparent: true,
      vertexColors: true,
      vertexShader: galaxyVertex,
      fragmentShader: galaxyFragment,
      uniforms: {
        uSize: { value: 100 * this.renderer.getPixelRatio() },
        uTime: { value: 0 },
      },
    });

    /**
     * Points
     */
    this.particles = new THREE.Points(
      this.particlesGeometry,
      this.particlesMaterial
    );
    this.scene.add(this.particles);
  }
  animateOnScroll() {
    this.container.addEventListener("scroll", () => {
      this.scrollY = this.container.scrollTop;
      const newSection = Math.round(this.scrollY / this.sizes.height);

      if (newSection != this.currentSection) {
        this.oldSection = this.currentSection;
        this.currentSection = newSection;

        if (this.oldSection !== null) {
          gsap.to(this.allMeshes[this.oldSection].scale, {
            x: "1",
            y: "1",
            z: "1",
            ease: "power2.inOut",
            duration: 1.5,
          });
          gsap.to(this.allMeshes[this.oldSection].rotation, {
            z: "-=6",
            y: "-=3",
            ease: "power2.inOut",
            duration: 1.5,
          });
        }

        gsap.to(this.allMeshes[this.currentSection].rotation, {
          z: "+=6",
          y: "+=3",
          ease: "power2.inOut",
          duration: 1.5,
        });
        gsap.to(this.allMeshes[this.currentSection].scale, {
          x: "1.5",
          y: "1.5",
          z: "1.5",
          ease: "power2.inOut",
          duration: 1.5,
        });
      }
    });
  }
  animateOnMove() {
    window.addEventListener("mousemove", (event) => {
      event.preventDefault();
      this.cursor.x = event.clientX / this.sizes.width - 0.5;
      this.cursor.y = event.clientY / this.sizes.height - 0.5;
    });
  }
  animate() {
    /**
     * ANIMATION MANAGER
     */
    this.clock = new THREE.Clock();
    this.previousTime = 0;

    const tick = () => {
      const elapsedTime = this.clock.getElapsedTime();
      const deltaTime = elapsedTime - this.previousTime;
      this.previousTime = elapsedTime;

      // Animate camera when scroll
      this.camera.position.y =
        (-this.scrollY / this.sizes.height) * this.objectsDistance;

      // Animate camera on mouse move
      const parallaxX = this.cursor.x * 0.5;
      const parallaxY = -this.cursor.y * 0.5;
      this.cameraGroup.position.x +=
        (parallaxX - this.cameraGroup.position.x) * 5 * deltaTime;
      this.cameraGroup.position.y +=
        (parallaxY - this.cameraGroup.position.y) * 5 * deltaTime;

      // Infinite Rotate Meshs

      for (const mesh of this.allMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
      }

      // Move Particles
      if (this.particles) {
        // Update Material
        this.particlesMaterial.uniforms.uTime.value = elapsedTime;
      }

      // Render
      this.renderer.render(this.scene, this.camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }
  goToUrl(id) {
    this.log(id);
    const section = document.querySelector(`section#${id}`);
    const mesh = this.allMeshes.filter((mesh) => mesh.name === id)[0];
    const url = section.dataset.url;
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
  }
  log(msg) {
    console.log(msg);
  }
}

export default Animation;
