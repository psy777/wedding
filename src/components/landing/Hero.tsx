"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Flower from "@/components/ui/Flower";

interface PlantedFlower {
  id: string;
  x: number;
  y: number;
  color: "coral" | "purple";
  size: number;
  rotation: number;
  delay: number;
  leaving?: boolean;
}

const MAX_FLOWERS = 200;
const CYCLE_RATE = 4;
const CYCLE_INTERVAL = 2000;
const TWO_PI = Math.PI * 2;

function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(TWO_PI * v);
}

interface Props {
  partner1: string;
  partner2: string;
  dateFull: string;
  venueName: string;
  venueCity: string;
  venueState: string;
}

export default function Hero({
  partner1,
  partner2,
  dateFull,
  venueName,
  venueCity,
  venueState,
}: Props) {
  const [flowers, setFlowers] = useState<PlantedFlower[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);

  // Generate terrain via additive Fourier synthesis
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 256;
    const H = 192;
    canvas.width = W;
    canvas.height = H;

    const NUM_WAVES = 14;
    const waves: { fx: number; fy: number; phase: number; amp: number }[] = [];
    for (let i = 0; i < NUM_WAVES; i++) {
      const angle = Math.random() * TWO_PI;
      const freq = 0.2 + Math.random() * 1.3;
      waves.push({
        fx: Math.cos(angle) * freq,
        fy: Math.sin(angle) * freq,
        phase: Math.random() * TWO_PI,
        amp: 0.3 + Math.random() * 0.7,
      });
    }

    const baseR = 204, baseG = 213, baseB = 174;
    const totalAmp = waves.reduce((sum, w) => sum + w.amp, 0);
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const nx = px / W;
        const ny = py / H;
        let value = 0;
        for (const w of waves) {
          value += w.amp * Math.sin(
            (nx * w.fx + ny * w.fy) * TWO_PI + w.phase
          );
        }
        value /= totalAmp;
        const brightness = value * 25;
        const r = Math.max(0, Math.min(255, baseR + brightness * 1.1 + (value > 0 ? 8 : 0)));
        const g = Math.max(0, Math.min(255, baseG + brightness * 0.8));
        const b = Math.max(0, Math.min(255, baseB + brightness * 0.6 - (value > 0 ? 5 : 0)));
        const idx = (py * W + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Measure exclusion zone once
  const getExclusionZone = useCallback(() => {
    const section = sectionRef.current;
    const names = namesRef.current;
    if (section && names) {
      const sr = section.getBoundingClientRect();
      const nr = names.getBoundingClientRect();
      const pad = 8;
      return {
        left: ((nr.left - sr.left - pad) / sr.width) * 100,
        right: ((nr.right - sr.left + pad) / sr.width) * 100,
        top: ((nr.top - sr.top - pad) / sr.height) * 100,
        bottom: ((nr.bottom - sr.top + pad) / sr.height) * 100,
      };
    }
    return { left: 30, right: 70, top: 20, bottom: 60 };
  }, []);

  // Bloom on load, then cycle flowers as a particle effect
  useEffect(() => {
    let idCounter = MAX_FLOWERS;
    let cycleInterval: ReturnType<typeof setInterval>;

    const makeFlower = (id: string, delay: number): PlantedFlower => {
      const x = 3 + Math.random() * 94;
      const t = Math.random() * Math.random();
      const y = 97 - t * 45; // range ~52% to 97%
      return {
        id,
        x,
        y,
        color: Math.random() > 0.5 ? "coral" : "purple",
        size: 10 + Math.floor(Math.random() * 12),
        rotation: Math.floor((Math.random() - 0.5) * 40),
        delay,
      };
    };

    const timeout = setTimeout(() => {
      const burst: PlantedFlower[] = [];
      for (let i = 0; i < MAX_FLOWERS; i++) {
        burst.push(makeFlower(`f-${i}`, i * 2));
      }
      setFlowers(burst);

      // Start cycling after the bloom finishes
      const bloomDuration = MAX_FLOWERS * 2 + 700;
      const cycleTimeout = setTimeout(() => {
        cycleInterval = setInterval(() => {
          // Pick indices to cycle out
          const indices: number[] = [];
          setFlowers((prev) => {
            const next = [...prev];
            for (let j = 0; j < CYCLE_RATE; j++) {
              let idx: number;
              do {
                idx = Math.floor(Math.random() * next.length);
              } while (next[idx].leaving);
              next[idx] = { ...next[idx], leaving: true };
              indices.push(idx);
            }
            return next;
          });

          // After shrink animation, replace with new flowers
          setTimeout(() => {
            setFlowers((prev) => {
              const next = [...prev];
              for (const idx of indices) {
                next[idx] = makeFlower(`f-${idCounter++}`, 0);
              }
              return next;
            });
          }, 1200);
        }, CYCLE_INTERVAL);
      }, bloomDuration);

      return () => clearTimeout(cycleTimeout);
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (cycleInterval) clearInterval(cycleInterval);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col items-center overflow-hidden bg-sand"
    >
      {/* Fourier-synthesized terrain */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* ── Names ── */}
      <div ref={namesRef} className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 animate-fade-in-up pointer-events-none">
        <p className="text-base sm:text-lg md:text-xl uppercase tracking-[0.3em] sm:tracking-[0.35em] text-clay mb-4 sm:mb-6 md:mb-10 font-body">
          The Wedding of
        </p>

        <h1 className="font-heading font-light text-ink leading-[0.9]">
          <span
            className="hidden md:block"
            style={{ fontSize: "clamp(4rem, 8vw, 9rem)" }}
          >
            {partner1}
            <span className="text-white/90 italic mx-3 lg:mx-4" style={{ fontSize: "0.45em" }}>
              &amp;
            </span>
            {partner2}
          </span>
          <span className="md:hidden block" style={{ fontSize: "clamp(5rem, 20vw, 7.5rem)" }}>
            <span className="block">
              {partner1}
              <span className="text-white/90 italic ml-2" style={{ fontSize: "0.55em" }}>
                &amp;
              </span>
            </span>
            <span className="block">{partner2}</span>
          </span>
        </h1>
      </div>

      {/* ── Sign on a stake ── */}
      <div className="relative z-20 mb-0 animate-fade-in-up pointer-events-none flex flex-col items-center">
        <div className="bg-parchment border border-sand/60 px-5 sm:px-10 md:px-12 py-3 sm:py-5 md:py-6 text-center shadow-md">
          <p className="text-base sm:text-lg md:text-2xl text-ink/80 tracking-wide font-body">
            {dateFull}
          </p>
          <p className="text-sm sm:text-base md:text-xl text-clay mt-1 sm:mt-2 tracking-wide font-body">
            {venueName} &middot; {venueCity},{" "}
            {venueState}
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 md:mt-5">
            <Flower color="coral" size={10} />
            <div className="w-8 sm:w-10 md:w-14 h-px bg-gold/40" />
            <Flower color="purple" size={12} />
            <div className="w-8 sm:w-10 md:w-14 h-px bg-gold/40" />
            <Flower color="coral" size={10} />
          </div>
        </div>

        <div className="w-1.5 h-14 sm:h-16 md:h-20 bg-gradient-to-b from-[#D4A373] to-[#B8865A]" />
      </div>

      {/* Flowers — staggered via CSS animation-delay */}
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className={`absolute pointer-events-none ${flower.leaving ? "animate-shrink-flower" : "animate-grow-flower"}`}
          style={{
            left: `${flower.x}%`,
            top: `${flower.y}%`,
            transform: `translate(-50%, -50%) rotate(${flower.rotation}deg)`,
            animationDelay: `${flower.delay}ms`,
            opacity: 0,
          }}
        >
          <Flower color={flower.color} size={flower.size} />
        </div>
      ))}
    </section>
  );
}
