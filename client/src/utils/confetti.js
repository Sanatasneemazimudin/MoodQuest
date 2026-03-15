export function spawnConfetti() {
  const colors = ['#6B9C8B','#B8D8D0','#E8B86D','#C4A69C','#F5F9F7','#4A7B6A'];
  for (let i = 0; i < 32; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${25 + Math.random() * 50}vw;
      top:${15 + Math.random() * 25}vh;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${6 + Math.random() * 8}px;
      height:${6 + Math.random() * 8}px;
      animation-delay:${Math.random() * 0.4}s;
      animation-duration:${0.9 + Math.random() * 0.6}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
}
