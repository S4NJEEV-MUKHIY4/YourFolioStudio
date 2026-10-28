// YOURFOLIO STUDIO — lightweight 3D hero. If Three.js/WebGL is unavailable,
// the CSS fallback in index.html remains visible automatically.
const visual = document.querySelector('#hero-visual');
const canvas = document.querySelector('#hero-canvas');

if (visual && canvas) startHero3D();

async function startHero3D() {
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
  } catch (error) {
    console.warn('Three.js did not load; using the CSS fallback.', error);
    visual.classList.add('webgl-failed');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (error) {
    console.warn('WebGL is not available; using the CSS fallback.', error);
    visual.classList.add('webgl-failed');
    return;
  }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(-3, 4, 6);
    scene.add(keyLight);
    scene.add(new THREE.PointLight(0x5267ff, 15, 15));
    const cyanLight = new THREE.PointLight(0x40c9ff, 12, 12);
    cyanLight.position.set(-3, -2, 2);
    scene.add(cyanLight);

    const world = new THREE.Group();
    scene.add(world);

    function makeCardTexture(title, subtitle, color, number) {
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 512;
      cardCanvas.height = 340;
      const ctx = cardCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 340);
      const gradient = ctx.createLinearGradient(0, 0, 512, 220);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, '#d9e8ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 220);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.beginPath(); ctx.arc(395, 82, 95, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 17px Arial'; ctx.fillText('YOURFOLIO / STUDIO', 30, 38);
      ctx.fillStyle = '#17203e'; ctx.font = 'bold 45px Arial'; ctx.fillText(title, 30, 112);
      ctx.fillStyle = '#28345c'; ctx.font = '22px Arial'; ctx.fillText(subtitle, 30, 153);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 220, 512, 120);
      ctx.fillStyle = '#252b46'; ctx.font = 'bold 20px Arial'; ctx.fillText('DESIGNED AROUND YOU', 30, 265);
      ctx.fillStyle = '#737c97'; ctx.font = '16px Arial'; ctx.fillText('Personal portfolio experience', 30, 296);
      ctx.fillStyle = color; ctx.font = 'bold 22px Arial'; ctx.fillText(number, 450, 295);
      const texture = new THREE.CanvasTexture(cardCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    const cardGroup = new THREE.Group();
    world.add(cardGroup);
    function addCard(title, subtitle, color, number, x, y, z, rotationY) {
      const material = new THREE.MeshStandardMaterial({ map: makeCardTexture(title, subtitle, color, number), roughness: .55, metalness: .03, side: THREE.DoubleSide });
      const card = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.92, .09), material);
      card.position.set(x, y, z);
      card.rotation.set(-.04, rotationY, 0);
      card.userData.startY = y;
      card.userData.phase = Math.random() * Math.PI * 2;
      cardGroup.add(card);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.96, 1.98, .04), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: .45 }));
      frame.position.copy(card.position); frame.position.z -= .07; frame.rotation.copy(card.rotation); cardGroup.add(frame);
    }
    addCard('Your Story.', 'Personal portfolio', '#8d9dff', '01', -.25, .45, 0, -.12);
    addCard('Create.', 'Show your best work', '#70d9ff', '02', .75, -.9, .6, .16);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.65, .012, 8, 100), new THREE.MeshBasicMaterial({ color: 0x7d8cff, transparent: true, opacity: .5, side: THREE.DoubleSide }));
    ring.position.z = -.9; ring.rotation.set(.7, .1, -.25); world.add(ring);
    const secondRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, .009, 8, 100), new THREE.MeshBasicMaterial({ color: 0x40c9ff, transparent: true, opacity: .6, side: THREE.DoubleSide }));
    secondRing.position.z = -1.2; secondRing.rotation.set(1.1, .4, .2); world.add(secondRing);

    const count = 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - .5) * 8;
      positions[i * 3 + 1] = (Math.random() - .5) * 7;
      positions[i * 3 + 2] = (Math.random() - .5) * 3 - 1;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x7188ff, size: .035, transparent: true, opacity: .8, sizeAttenuation: true }));
    world.add(particles);

    function resizeScene() {
      const width = visual.clientWidth;
      const height = visual.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (width < 420) { camera.position.z = 10.2; world.scale.setScalar(.83); }
      else if (width < 760) { camera.position.z = 9; world.scale.setScalar(.92); }
      else { camera.position.z = 8; world.scale.setScalar(1); }
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pointerX = 0, pointerY = 0, visible = true, pageActive = !document.hidden, frameId = 0;
    visual.addEventListener('pointermove', function (event) {
      if (event.pointerType !== 'mouse') return;
      const bounds = visual.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    });
    visual.addEventListener('pointerleave', function () { pointerX = 0; pointerY = 0; });
    function animate(now) {
      if (!visible || !pageActive || reduceMotion.matches) return;
      frameId = requestAnimationFrame(animate);
      const time = now * .001;
      cardGroup.rotation.y += (pointerX * .12 - cardGroup.rotation.y) * .025;
      cardGroup.rotation.x += (-pointerY * .07 - cardGroup.rotation.x) * .025;
      cardGroup.children.forEach(function (object) {
        if (object.userData.startY !== undefined) object.position.y = object.userData.startY + Math.sin(time * 1.1 + object.userData.phase) * .06;
      });
      ring.rotation.z = time * .08;
      secondRing.rotation.z = -time * .055;
      particles.rotation.z = time * .018;
      renderer.render(scene, camera);
    }
    function startAnimation() {
      cancelAnimationFrame(frameId);
      if (reduceMotion.matches) { renderer.render(scene, camera); return; }
      frameId = requestAnimationFrame(animate);
    }
    const visibilityObserver = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && pageActive) startAnimation(); else cancelAnimationFrame(frameId);
    });
    visibilityObserver.observe(visual);
    document.addEventListener('visibilitychange', function () {
      pageActive = !document.hidden;
      if (pageActive && visible) startAnimation(); else cancelAnimationFrame(frameId);
    });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', startAnimation);
    window.addEventListener('resize', resizeScene);
    resizeScene();
    visual.classList.add('webgl-ready');
    startAnimation();
  } catch (error) {
    console.error('The 3D hero could not start; using the CSS fallback.', error);
    visual.classList.add('webgl-failed');
  }
}
