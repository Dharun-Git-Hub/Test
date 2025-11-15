import confetti from "canvas-confetti";

export const celebrate = () => {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
  });
};

export const celebrateAllSides = () => {
  // Left Side
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
  });

  // Right Side
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
  });

  // Top
  confetti({
    particleCount: 80,
    angle: 90,
    spread: 100,
    origin: { y: 0 },
  });

  // Bottom
  confetti({
    particleCount: 80,
    angle: -90,
    spread: 100,
    origin: { y: 1 },
  });

  // Center Blast
  confetti({
    particleCount: 120,
    spread: 130,
    origin: { x: 0.5, y: 0.5 },
  });
};
