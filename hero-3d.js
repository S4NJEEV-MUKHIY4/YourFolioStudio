// ==========================================
// YOURFOLIO STUDIO — 3D HERO SCENE
// Requires internet for Three.js CDN
// ==========================================

const visual = document.querySelector("#hero-visual");
const canvas = document.querySelector("#hero-canvas");

if (visual && canvas) {
  startHero3D();
}

async function startHero3D() {
  let THREE;

  // Load Three.js from CDN.
  try {
    THREE =
      await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
  } catch (error) {
    console.warn("Three.js could not load. Showing CSS fallback.", error);
    visual.classList.add("webgl-failed");
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
  } catch (error) {
    console.warn("WebGL is not available.", error);
    visual.classList.add("webgl-failed");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Soft lighting.
  scene.add(new THREE.AmbientLight(0xffffff, 2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(-3, 4, 6);
  scene.add(keyLight);

  const blueLight = new THREE.PointLight(0x5267ff, 18, 15);
  blueLight.position.set(3, 1, 3);
  scene.add(blueLight);

  const cyanLight = new THREE.PointLight(0x40c9ff, 14, 12);
  cyanLight.position.set(-3, -2, 2);
  scene.add(cyanLight);

  const world = new THREE.Group();
  scene.add(world);

  // Create a canvas texture for each floating project card.
  function createCardTexture(title, subtitle, color, number) {
    const cardCanvas = document.createElement("canvas");
    cardCanvas.width = 512;
    cardCanvas.height = 340;

    const ctx = cardCanvas.getContext("2d");

    // Background.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 340);

    // Colored top panel.
    const gradient = ctx.createLinearGradient(0, 0, 512, 240);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "#d9e8ff");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 220);

    // Decorative circle.
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(395, 82, 95, 0, Math.PI * 2);
    ctx.fill();

    // Small label.
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 17px Arial";
    ctx.fillText("YOURFOLIO / STUDIO", 30, 38);

    // Main heading.
    ctx.fillStyle = "#17203e";
    ctx.font = "bold 45px Arial";
    ctx.fillText(title, 30, 112);

    ctx.fillStyle = "#28345c";
    ctx.font = "22px Arial";
    ctx.fillText(subtitle, 30, 153);

    // Bottom white information panel.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 220, 512, 120);

    ctx.fillStyle = "#252b46";
    ctx.font = "bold 20px Arial";
    ctx.fillText("DESIGNED AROUND YOU", 30, 265);

    ctx.fillStyle = "#737c97";
    ctx.font = "16px Arial";
    ctx.fillText("Personal portfolio experience", 30, 296);

    ctx.fillStyle = color;
    ctx.font = "bold 22px Arial";
    ctx.fillText(number, 450, 295);

    const texture = new THREE.CanvasTexture(cardCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const cardGroup = new THREE.Group();
  world.add(cardGroup);

  function addCard(title, subtitle, color, number, x, y, z, rotationY) {
    const texture = createCardTexture(title, subtitle, color, number);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.55,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.BoxGeometry(2.9, 1.92, 0.09);
    const card = new THREE.Mesh(geometry, material);

    card.position.set(x, y, z);
    card.rotation.y = rotationY;
    card.rotation.x = -0.04;
    card.castShadow = false;
    card.receiveShadow = false;

    cardGroup.add(card);

    // Soft outline behind each card.
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.96, 1.98, 0.04),
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.55,
        wireframe: false,
      }),
    );

    frame.position.copy(card.position);
    frame.position.z -= 0.07;
    frame.rotation.copy(card.rotation);
    cardGroup.add(frame);

    card.userData.startY = y;
    card.userData.phase = Math.random() * Math.PI * 2;

    return card;
  }

  addCard(
    "Your Story.",
    "Personal portfolio",
    "#8d9dff",
    "01",
    -0.25,
    0.45,
    0,
    -0.12,
  );

  addCard(
    "Create.",
    "Show your best work",
    "#70d9ff",
    "02",
    0.75,
    -0.9,
    0.6,
    0.16,
  );

  // A large decorative ring.
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x7d8cff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.65, 0.012, 8, 120),
    ringMaterial,
  );

  ring.position.set(0, 0, -0.9);
  ring.rotation.set(0.7, 0.1, -0.25);
  world.add(ring);

  const secondRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.009, 8, 120),
    new THREE.MeshBasicMaterial({
      color: 0x40c9ff,
      transparent: true,
      opacity: 0.65,
    }),
  );

  secondRing.position.set(0, 0, -1.2);
  secondRing.rotation.set(1.1, 0.4, 0.2);
  world.add(secondRing);

  // Small glowing particles.
  const particleCount = 180;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 8;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x7188ff,
    size: 0.035,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  world.add(particles);

  // Responsive sizing.
  function resizeScene() {
    const width = visual.clientWidth;
    const height = visual.clientHeight;

    if (!width || !height) return;

    renderer.setSize(width, height, false);

    camera.aspect = width / height;

    if (width < 420) {
      camera.position.z = 10.2;
      world.scale.setScalar(0.83);
    } else if (width < 760) {
      camera.position.z = 9;
      world.scale.setScalar(0.92);
    } else {
      camera.position.z = 8;
      world.scale.setScalar(1);
    }

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let pageActive = !document.hidden;
  let animationFrame = null;
  let startTime = performance.now();

  visual.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;

    const bounds = visual.getBoundingClientRect();

    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  });

  visual.addEventListener("pointerleave", function () {
    pointerX = 0;
    pointerY = 0;
  });

  function animate(now) {
    if (!visible || !pageActive || reduceMotion.matches) return;

    animationFrame = requestAnimationFrame(animate);

    const elapsed = (now - startTime) * 0.001;

    // Gentle 3D movement.
    cardGroup.rotation.y += (pointerX * 0.12 - cardGroup.rotation.y) * 0.025;

    cardGroup.rotation.x += (-pointerY * 0.07 - cardGroup.rotation.x) * 0.025;

    cardGroup.children.forEach(function (object) {
      if (object.userData.startY !== undefined) {
        object.position.y =
          object.userData.startY +
          Math.sin(elapsed * 1.1 + object.userData.phase) * 0.06;
      }
    });

    ring.rotation.z = elapsed * 0.08;
    secondRing.rotation.z = -elapsed * 0.055;
    particles.rotation.z = elapsed * 0.018;

    renderer.render(scene, camera);
  }

  function startAnimation() {
    cancelAnimationFrame(animationFrame);

    if (reduceMotion.matches) {
      renderer.render(scene, camera);
      return;
    }

    startTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
  }

  // Pause when the hero is off-screen to save resources.
  const visibilityObserver = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;

    if (visible && pageActive) {
      startAnimation();
    } else {
      cancelAnimationFrame(animationFrame);
    }
  });

  visibilityObserver.observe(visual);

  document.addEventListener("visibilitychange", function () {
    pageActive = !document.hidden;

    if (pageActive && visible) {
      startAnimation();
    } else {
      cancelAnimationFrame(animationFrame);
    }
  });

  reduceMotion.addEventListener("change", function () {
    startAnimation();
  });

  window.addEventListener("resize", resizeScene);

  resizeScene();

  if (reduceMotion.matches) {
    renderer.render(scene, camera);
  } else {
    startAnimation();
  }
}
