'use strict';
// Gemeinsamer Namensraum und Hilfsfunktionen für GTA Wiesn
const G = {};
const TAU = Math.PI * 2;
const FONT = '"Arial Black","Segoe UI Black","Helvetica Neue",Impact,sans-serif';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const smooth = (t) => t * t * (3 - 2 * t);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function angDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, r), 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

// Text im GTA-Stil: fett, mit dicker Kontur
function txt(ctx, s, x, y, size, color, align, outline, lw, font) {
  ctx.font = (font || '900 ') + size + 'px ' + FONT;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  if (outline !== null) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw || Math.max(2, size / 5);
    ctx.strokeStyle = outline || '#000';
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = color || '#fff';
  ctx.fillText(s, x, y);
}

function wrapText(ctx, s, maxW) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Bayerisches Rautenmuster
function rauten(ctx, x, y, w, h, size) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1a7fd4';
  const s = size || 6, hh = s * 1.25;
  ctx.beginPath();
  for (let k = 0; k <= h / hh + 1; k++) {
    for (let i = 0; i <= w / s + 1; i++) {
      const cx = x + i * s, cy = y + k * hh;
      ctx.moveTo(cx, cy - hh / 2); ctx.lineTo(cx + s / 2, cy); ctx.lineTo(cx, cy + hh / 2); ctx.lineTo(cx - s / 2, cy);
    }
  }
  ctx.fill();
  ctx.restore();
}

// Kleiner Wimpel/Fahne mit Rauten
function flag(ctx, x, y, h, t) {
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
  const wave = Math.sin(t * 3 + x * 0.05) * 2;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + 9, y - h - 2 + wave, x + 18, y - h + wave);
  ctx.lineTo(x + 18, y - h + 10 + wave); ctx.quadraticCurveTo(x + 9, y - h + 8 + wave, x, y - h + 10);
  ctx.closePath(); ctx.clip();
  rauten(ctx, x, y - h - 4, 20, 18, 5);
  ctx.restore();
}

function shade(hex, f) {
  // f < 0 abdunkeln, f > 0 aufhellen
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
}

function fmtTime(min) {
  const h = Math.floor(min / 60), m = Math.floor(min % 60);
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
