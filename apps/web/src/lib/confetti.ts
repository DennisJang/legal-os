/** 캔버스 기반 폭죽 — 외부 라이브러리 0개 */
export function fireConfetti() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", pointerEvents: "none", zIndex: "9999",
    width: "100vw", height: "100vh",
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const particles = Array.from({ length: 120 }, () => ({
    x: window.innerWidth / 2, y: window.innerHeight * 0.6,
    vx: (Math.random() - 0.5) * 22,
    vy: -(Math.random() * 18 + 6),
    size: Math.random() * 7 + 3,
    color: ["#ffffff", "rgba(255,255,255,0.6)", "#ffd700", "#00ff88"][
      Math.floor(Math.random() * 4)
    ],
    life: 1,
  }));

  let raf: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.55; p.life -= 0.016;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.55);
    });
    if (particles.some((p) => p.life > 0)) raf = requestAnimationFrame(draw);
    else { cancelAnimationFrame(raf); document.body.removeChild(canvas); }
  };
  draw();
}
