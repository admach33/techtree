const raf = window.requestAnimationFrame.bind(window);
window.__times = [];
window.requestAnimationFrame = (cb) => raf((now) => { const t0 = performance.now(); cb(now); window.__times.push(performance.now() - t0); });
