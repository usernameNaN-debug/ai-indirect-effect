const mounts = new WeakMap();
let matterPromise;

function loadMatter() {
  if (!matterPromise) {
    matterPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('./playground/vendor/matter.min.js', import.meta.url).href;
      script.onload = () => resolve(window.Matter);
      script.onerror = () => {
        script.remove();
        matterPromise = undefined;
        reject(new Error('The homepage physics library could not load.'));
      };
      document.head.append(script);
    });
  }
  return matterPromise;
}

const names = {
  'silicon-wafer': 'Silicon wafer',
  'lego-original': 'Ivory LEGO brick',
  'brick-coral': 'Coral brick',
  'brick-butter': 'Butter yellow brick',
  'brick-sage': 'Sage corner brick',
  'brick-lilac': 'Lilac sloped brick',
  'figure-sand': 'Sand figure',
  'figure-blue': 'Blue figure',
  'book-novel': 'Novel',
  'book-law': 'Law book',
  'book-poetry': 'Poetry book',
  spindle: 'Spindle',
  'magnifying-glass': 'Magnifying glass',
  eraser: 'Eraser',
  'plaster-bust': 'Plaster bust',
};

/** Mount the homepage's supplied object playground; returns a disposable instance. */
export function mountPlayground(host) {
  if (!host) return Promise.resolve(null);
  if (!mounts.has(host)) {
    const pending = createPlayground(host).catch(error => {
      mounts.delete(host);
      throw error;
    });
    mounts.set(host, pending);
  }
  return mounts.get(host);
}

async function createPlayground(host) {
  const [M, { default: MotionField }, { default: objects }] = await Promise.all([
    loadMatter(),
    import('./playground/physics-core.js'),
    import('./playground/home-objects.js'),
  ]);
  const abort = new AbortController();
  const listen = (target, type, listener, options = {}) =>
    target.addEventListener(type, listener, { ...options, signal: abort.signal });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'home-playground__objects';
  host.classList.add('home-playground');
  host.setAttribute('role', 'group');
  host.setAttribute('aria-label', 'Interactive objects. Move near an object to push it; click or press Enter to make a copy.');
  host.setAttribute('aria-busy', 'true');
  host.append(layer);

  // Preserve the prototype's random distribution of object sizes and masses.
  const sizeLevels = objects.map((_, i) => .66 + .88 * i / Math.max(1, objects.length - 1));
  for (let i = sizeLevels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sizeLevels[i], sizeLevels[j]] = [sizeLevels[j], sizeLevels[i]];
  }
  const definitions = objects.map((object, i) => {
    const scale = sizeLevels[i] * (.97 + Math.random() * .06);
    return { ...object, scale, mass: object.mass * (scale / object.scale) ** 2 };
  });
  const buttons = new Map();
  let simulation;
  let frame = 0;
  let last = 0;
  let accumulator = 0;
  let running = !reducedMotion.matches;
  let disposed = false;
  let copyNumber = 0;
  let lastPointer = null;
  let loaded = 0;
  const initialBounds = host.getBoundingClientRect();
  let inView = initialBounds.bottom > 0 && initialBounds.top < innerHeight;

  function render() {
    if (!simulation) return;
    for (const item of simulation.items) {
      const button = buttons.get(item.id);
      const { x, y } = item.body.position;
      button.style.width = `${item.width}px`;
      button.style.height = `${item.height}px`;
      button.style.transform = `translate(${x}px, ${y}px) rotate(${item.body.angle}rad) translate(${-item.center.x}px, ${-item.center.y}px)`;
    }
  }

  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    accumulator = 0;
  }

  function wake() {
    if (!disposed && simulation && running && inView && !document.hidden && !frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    frame = 0;
    if (disposed || !running || !inView || document.hidden) {
      last = 0;
      return;
    }
    accumulator += last ? Math.min((now - last) / 1000, .05) : 0;
    last = now;
    while (accumulator >= 1 / 120) {
      simulation.step(1000 / 120);
      accumulator -= 1 / 120;
    }
    render();
    wake();
  }

  function activate() {
    running = true;
    wake();
  }

  function clearPointer() {
    lastPointer = null;
    simulation?.setPointer(-1000, -1000, false);
  }

  function pointer(event) {
    if (!simulation) return;
    const rect = host.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();
    const dt = lastPointer ? Math.max((now - lastPointer.t) / 1000, .008) : 1;
    const vx = lastPointer ? (x - lastPointer.x) / dt : 0;
    const vy = lastPointer ? (y - lastPointer.y) / dt : 0;
    simulation.setPointer(x, y, true, vx, vy);
    lastPointer = { x, y, t: now };
    activate();
  }

  function mountObject(definition, original = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-playground__object';
    button.dataset.object = definition.id;
    const name = names[definition.id.split('--copy-')[0]];
    button.setAttribute('aria-label', `${name}; click to make a copy`);
    const image = new Image();
    image.alt = '';
    image.draggable = false;
    image.decoding = 'async';
    if (original) {
      const finish = async () => {
        try { await image.decode(); } catch {}
        loaded++;
        if (!disposed && loaded === objects.length) {
          host.setAttribute('aria-busy', 'false');
          host.dataset.playgroundReady = 'true';
        }
      };
      listen(image, 'load', finish, { once: true });
      listen(image, 'error', finish, { once: true });
    }
    image.src = definition.file;
    button.append(image);
    layer.append(button);
    buttons.set(definition.id, button);
    // Capture only object presses so the moving target still receives its click.
    listen(button, 'pointerdown', event => button.setPointerCapture(event.pointerId));
    listen(button, 'click', () => duplicateObject(definition));
  }

  function duplicateObject(base) {
    if (!simulation) return;
    const source = simulation.items.find(item => item.id === base.id);
    const assetId = base.id.split('--copy-')[0];
    const clone = {
      ...base,
      id: `${assetId}--copy-${++copyNumber}`,
      spawn: { x: source.body.position.x + 6, y: source.body.position.y + 6 },
      spawnWidth: source.width,
    };
    definitions.push(clone);
    mountObject(clone);
    simulation.layout(0, true);
    simulation.setPreset('lively');
    clearPointer();
    render();
    activate();
  }

  function resize() {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    if (!simulation) {
      simulation = new MotionField(M, width, height, definitions);
      simulation.setPreset('lively');
    } else if (Math.abs(simulation.width - width) >= 1 || Math.abs(simulation.height - height) >= 1) {
      simulation.resize(width, height);
    } else return;
    clearPointer();
    stopFrame();
    render();
    wake();
  }

  definitions.forEach(definition => mountObject(definition, true));
  listen(host, 'pointermove', pointer);
  listen(host, 'pointerenter', pointer);
  listen(host, 'pointerleave', clearPointer);
  listen(host, 'pointerdown', pointer);
  listen(host, 'pointerup', event => {
    if (event.pointerType !== 'mouse') clearPointer();
  });
  listen(host, 'pointercancel', clearPointer);
  listen(document, 'visibilitychange', () => {
    if (document.hidden) {
      clearPointer();
      stopFrame();
    } else wake();
  });
  listen(reducedMotion, 'change', () => {
    running = !reducedMotion.matches;
    clearPointer();
    stopFrame();
    wake();
  });
  const intersection = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) wake();
    else {
      clearPointer();
      stopFrame();
    }
  });
  intersection.observe(host);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  resize();

  return {
    snapshot: () => simulation?.snapshot(),
    get running() { return !disposed && running && inView && !document.hidden; },
    destroy() {
      if (disposed) return;
      disposed = true;
      stopFrame();
      abort.abort();
      intersection.disconnect();
      sizeObserver.disconnect();
      simulation?.destroy();
      buttons.clear();
      layer.remove();
      host.removeAttribute('aria-busy');
      delete host.dataset.playgroundReady;
      mounts.delete(host);
    },
  };
}
