/* =========================================
   YOURFOLIO STUDIO — 3D LOGO ASSEMBLY
========================================= */

const container = document.querySelector("#hero-visual");
const canvas = document.querySelector("#hero-canvas");
const logoPath = "assets/yf-logo-transparent.png";

if (container && canvas) {
  startLogoAnimation();
}

async function startLogoAnimation() {
  let THREE;

  // Load Three.js and show the normal logo if loading fails.
  try {
    THREE =
      await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
  } catch (error) {
    console.error("Three.js could not load:", error);
    container.classList.add("webgl-failed");
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
    console.error("WebGL is unavailable:", error);
    container.classList.add("webgl-failed");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

  camera.position.z = 7.5;

  // Soft lighting for the scene.
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));

  const mainLight = new THREE.DirectionalLight(0xffffff, 2);
  mainLight.position.set(-3, 4, 6);
  scene.add(mainLight);

  const blueLight = new THREE.PointLight(0x68bfff, 12, 12);
  blueLight.position.set(3, -1, 4);
  scene.add(blueLight);

  const logoGroup = new THREE.Group();
  scene.add(logoGroup);

  const loader = new THREE.TextureLoader();
  let pieces = [];
  let ready = false;
  let visible = true;
  let pageActive = !document.hidden;
  let animationFrame = null;
  let animationStart = null;

  let pointerX = 0;
  let pointerY = 0;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Load the transparent logo image.
  loader.load(
    logoPath,

    function (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const image = texture.image;
      const numberOfPieces = 5;

      // Create five image strips that assemble into the logo.
      for (let i = 0; i < numberOfPieces; i++) {
        const top = Math.floor((image.height * i) / numberOfPieces);

        const bottom = Math.floor((image.height * (i + 1)) / numberOfPieces);

        const stripHeight = bottom - top;

        const stripCanvas = document.createElement("canvas");
        stripCanvas.width = image.width;
        stripCanvas.height = stripHeight;

        const context = stripCanvas.getContext("2d");

        context.drawImage(
          image,
          0,
          top,
          image.width,
          stripHeight,
          0,
          0,
          image.width,
          stripHeight,
        );

        const stripTexture = new THREE.CanvasTexture(stripCanvas);

        stripTexture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({
          map: stripTexture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        // Each strip retains the original image proportions.
        const stripWorldHeight = (3.8 * stripHeight) / image.height;

        const stripWorldWidth = (3.8 * image.width) / image.height;

        const geometry = new THREE.PlaneGeometry(
          stripWorldWidth,
          stripWorldHeight,
        );

        const piece = new THREE.Mesh(geometry, material);

        const finalY = 1.9 - (top + stripHeight / 2) * (3.8 / image.height);

        piece.userData.finalPosition = new THREE.Vector3(0, finalY, 0);

        piece.userData.startPosition = new THREE.Vector3(
          (i % 2 === 0 ? -1 : 1) * (1.2 + i * 0.2),
          finalY + (i - 2) * 1.2,
          -1.5 - Math.abs(i - 2) * 0.3,
        );

        piece.userData.startRotation = new THREE.Euler(
          (i - 2) * 0.18,
          (i % 2 === 0 ? -1 : 1) * 0.8,
          (i - 2) * 0.12,
        );

        piece.position.copy(piece.userData.startPosition);
        piece.rotation.copy(piece.userData.startRotation);

        logoGroup.add(piece);
        pieces.push(piece);
      }

      ready = true;

      if (reducedMotion.matches) {
        assembleInstantly();
        render();
      } else if (visible && pageActive) {
        animationStart = performance.now();
        animate(animationStart);
      }
    },

    undefined,

    function (error) {
      console.error("Logo image could not load:", error);
      container.classList.add("webgl-failed");
    },
  );

  // Finish the assembly without motion.
  function assembleInstantly() {
    pieces.forEach(function (piece) {
      piece.position.copy(piece.userData.finalPosition);
      piece.rotation.set(0, 0, 0);
    });

    logoGroup.rotation.set(0, 0, 0);
    logoGroup.position.set(0, 0, 0);
  }

  function render() {
    renderer.render(scene, camera);
  }

  function animate(now) {
    if (!visible || !pageActive || reducedMotion.matches || !ready) {
      return;
    }

    animationFrame = requestAnimationFrame(animate);

    if (animationStart === null) {
      animationStart = now;
    }

    // Assembly takes about 2.2 seconds.
    const elapsed = (now - animationStart) / 1000;
    const progress = Math.min(elapsed / 2.2, 1);

    // Smooth ease-out movement.
    const eased = 1 - Math.pow(1 - progress, 4);

    pieces.forEach(function (piece) {
      piece.position.lerpVectors(
        piece.userData.startPosition,
        piece.userData.finalPosition,
        eased,
      );

      piece.rotation.x = piece.userData.startRotation.x * (1 - eased);

      piece.rotation.y = piece.userData.startRotation.y * (1 - eased);

      piece.rotation.z = piece.userData.startRotation.z * (1 - eased);
    });

    // Gentle movement after the logo has assembled.
    if (progress >= 1) {
      const targetRotationX = pointerY * 0.12;
      const targetRotationY = pointerX * 0.18;

      logoGroup.rotation.x += (targetRotationX - logoGroup.rotation.x) * 0.04;

      logoGroup.rotation.y += (targetRotationY - logoGroup.rotation.y) * 0.04;

      logoGroup.position.y = Math.sin(elapsed * 1.2) * 0.035;
    }

    render();
  }

  // Keep the canvas responsive.
  function resizeScene() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    renderer.setSize(width, height, false);

    camera.aspect = width / height;

    // Adjust camera distance for smaller screens.
    camera.position.z = width < 420 ? 8.5 : 7.5;

    camera.updateProjectionMatrix();
    render();
  }

  // Subtle mouse-controlled tilt on desktop.
  container.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;

    const bounds = container.getBoundingClientRect();

    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  });

  container.addEventListener("pointerleave", function () {
    pointerX = 0;
    pointerY = 0;
  });

  // Pause the animation while the hero is off-screen.
  const observer = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;

    if (visible && pageActive && ready && !reducedMotion.matches) {
      animationStart = performance.now();
      cancelAnimationFrame(animationFrame);
      animate(animationStart);
    } else {
      cancelAnimationFrame(animationFrame);
      if (ready) render();
    }
  });

  observer.observe(container);

  // Pause when the browser tab is hidden.
  document.addEventListener("visibilitychange", function () {
    pageActive = !document.hidden;

    if (pageActive && visible && ready && !reducedMotion.matches) {
      animationStart = performance.now();
      animate(animationStart);
    } else {
      cancelAnimationFrame(animationFrame);
    }
  });

  // Respect the visitor's motion preference.
  reducedMotion.addEventListener("change", function () {
    cancelAnimationFrame(animationFrame);

    if (reducedMotion.matches) {
      assembleInstantly();
      render();
    } else if (visible && pageActive && ready) {
      animationStart = performance.now();
      animate(animationStart);
    }
  });

  window.addEventListener("resize", resizeScene);

  resizeScene();
}
