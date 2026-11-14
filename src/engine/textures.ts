/** Textures painted in code, so the first episode downloads no image files for its materials. */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { hash } from './noise';

type Painter = (g: CanvasRenderingContext2D, size: number) => void;

export function canvasTexture(size: number, paint: Painter, isColor: boolean, anisotropy = 1): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  paint(canvas.getContext('2d')!, size);
  const tex = new CanvasTexture(canvas);
  if (isColor) tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.anisotropy = anisotropy;
  return tex;
}

/** Random grey dots: a cheap bump map for soil and rock. */
export function bumpDots(count: number, maxRadius: number, seed: number): Painter {
  return (g, n) => {
    g.fillStyle = '#808080';
    g.fillRect(0, 0, n, n);
    for (let k = 0; k < count; k++) {
      const v = Math.floor(hash(k, seed) * 255);
      g.fillStyle = `rgba(${v},${v},${v},.5)`;
      g.beginPath();
      g.arc(hash(k, seed + 2) * n, hash(k, seed + 4) * n, 0.5 + hash(k, seed + 6) * maxRadius, 0, Math.PI * 2);
      g.fill();
    }
  };
}

/** Warm and dark speckles over a base colour (Martian soil, lunar regolith with other tints). */
export function speckle(base: string, dark: [number, number, number], seed: number): Painter {
  return (g, n) => {
    g.fillStyle = base;
    g.fillRect(0, 0, n, n);
    for (let k = 0; k < 9000; k++) {
      const v = Math.floor(hash(k, seed + 2) * 90);
      g.fillStyle =
        hash(k, seed + 4) > 0.5
          ? `rgba(${dark[0] + v},${dark[1] + v * 0.4},${dark[2] + v * 0.2},.45)`
          : `rgba(255,${190 + v * 0.5},${140 + v},.22)`;
      const r = hash(k, seed + 5);
      g.beginPath();
      g.arc(hash(k, seed) * n, hash(k, seed + 9) * n, 0.4 + r * r * 3.2, 0, Math.PI * 2);
      g.fill();
    }
  };
}

/** Dark-blue solar cells with silver grid lines. */
export const solarCells: Painter = (g, n) => {
  g.fillStyle = '#0c1436';
  g.fillRect(0, 0, n, n);
  for (let x = 0; x < n; x += 32) {
    for (let y = 0; y < n; y += 32) {
      g.fillStyle = hash(x, y) > 0.5 ? '#16245c' : '#101c4c';
      g.fillRect(x + 2, y + 2, 28, 28);
      g.fillStyle = 'rgba(160,190,255,.18)';
      g.fillRect(x + 2, y + 2, 28, 3);
    }
  }
  g.strokeStyle = '#8a93a8';
  g.lineWidth = 1.5;
  for (let q = 0; q <= n; q += 32) {
    g.beginPath();
    g.moveTo(q, 0);
    g.lineTo(q, n);
    g.moveTo(0, q);
    g.lineTo(n, q);
    g.stroke();
  }
};
