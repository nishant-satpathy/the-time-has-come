'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import bgUrl from '@/assets/000008570022.jpg';
import { z } from 'zod';

const TITLE = 'Bharath + Vaish 💍';
const TARGET_ISO = '2025-08-30T18:45:00';

const schema = z.object({
  title: z.string().min(1).max(60).optional(),
  date: z.string().datetime().optional(),
});

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isComplete: boolean;
};

function useCountdown(targetDate: Date): CountdownParts {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    let rafId: number;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      if (dt >= 8) {
        // ~120fps throttle for stability, still shows ms smoothly
        setNowMs(Date.now());
        last = t;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return useMemo(() => {
    const delta = targetDate.getTime() - nowMs;
    const clamped = Math.max(delta, 0);
    const days = Math.floor(clamped / (24 * 60 * 60 * 1000));
    const dayRemainder = clamped % (24 * 60 * 60 * 1000);
    const hours = Math.floor(dayRemainder / (60 * 60 * 1000));
    const hourRemainder = dayRemainder % (60 * 60 * 1000);
    const minutes = Math.floor(hourRemainder / (60 * 1000));
    const minRemainder = hourRemainder % (60 * 1000);
    const seconds = Math.floor(minRemainder / 1000);
    return {
      days,
      hours,
      minutes,
      seconds,
      totalMs: clamped,
      isComplete: delta <= 0,
    };
  }, [nowMs, targetDate]);
}

function formatTitleForMeta(title: string, date: Date): string {
  return `${title} – Countdown to ${format(date, 'dd LLL yyyy')}`;
}

export default function Page() {
  const params = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const url = new URL(window.location.href);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = schema.safeParse(raw);
    return parsed.success ? parsed.data : {};
  }, []);

  const target = useMemo(() => new Date(TARGET_ISO), []);
  const title = params.title?.trim() || TITLE;
  const { days, hours, minutes, seconds, isComplete, totalMs } = useCountdown(target);
  const confettiRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isComplete && confettiRef.current) {
      // trigger a simple burst by toggling a class; pure CSS particles below
      confettiRef.current.classList.remove('opacity-0');
      confettiRef.current.classList.add('opacity-100');
    }
  }, [isComplete]);

  useEffect(() => {
    const metaTitle = document.querySelector('title');
    const metaDesc = document.querySelector('meta[name="description"]');
    const computed = formatTitleForMeta(title, target);
    if (metaTitle) metaTitle.textContent = computed;
    if (!metaDesc) {
      const el = document.createElement('meta');
      el.name = 'description';
      el.content = computed;
      document.head.appendChild(el);
    } else {
      metaDesc.setAttribute('content', computed);
    }
  }, [title, target]);

  return (
    <main
      className="min-h-screen px-6 py-10 flex flex-col items-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${(bgUrl.src)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <header className="max-w-5xl w-full flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg">{title}</h1>
      </header>

      <section className={`my-auto w-full max-w-5xl ${mounted && isComplete ? 'hidden' : ''}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-fit mx-auto">
          <StatCard label="Days" value={mounted ? days : 0} accent="from-pink-500 to-rose-500" />
          <StatCard label="Hours" value={mounted ? hours : 0} accent="from-fuchsia-500 to-purple-500" />
          <StatCard label="Minutes" value={mounted ? minutes : 0} accent="from-emerald-500 to-teal-500" />
          <StatCard label="Seconds" value={mounted ? seconds : 0} accent="from-sky-500 to-indigo-500" />
        </div>
      </section>

      <div ref={confettiRef} className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${mounted && isComplete ? 'opacity-100' : 'opacity-0'}`}>
        {mounted && isComplete && (
          <CelebrationOverlay />
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  const padded = useMemo(() => (label === 'Milliseconds' ? value.toString().padStart(3, '0') : value.toString()), [label, value]);
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-6 shadow-lg overflow-hidden">
      <div className={`absolute inset-0 opacity-[0.08] pointer-events-none bg-gradient-to-br ${accent}`}></div>
      <div className="relative">
        <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
        <div className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tabular-nums" suppressHydrationWarning>
          {padded}
        </div>
      </div>
    </div>
  );
}

function SimpleForm({ initialTitle, initialDate }: { initialTitle: string; initialDate: string }) {
  const [title, setTitle] = useState<string>(initialTitle);
  const [date, setDate] = useState<string>(initialDate);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ title, date });
    if (!parsed.success) {
      setError('Please provide a valid title and an ISO datetime like 2025-08-30T00:00:00');
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('title', title);
    url.searchParams.set('date', date);
    window.location.href = url.toString();
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs opacity-80">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
          placeholder="Bharath + Vaish 💍"
          maxLength={60}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs opacity-80">ISO Datetime</label>
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 font-mono text-xs"
          placeholder="2025-08-30T00:00:00"
        />
      </div>
      <button
        type="submit"
        className="h-[42px] md:h-[38px] rounded-lg bg-white text-black font-semibold px-4 hover:bg-neutral-100 active:bg-neutral-200 transition"
      >
        Update
      </button>
      {error && <p className="md:col-span-3 text-rose-300 text-sm">{error}</p>}
    </form>
  );
}

function CelebrationOverlay() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <ConfettiParticles />
      </div>
      <div className="relative z-10 text-center">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold drop-shadow-xl">
          THE DAY IS HERE!
        </h2>
      </div>
    </div>
  );
}

function ConfettiParticles() {
  const pieces = 120;
  const particles = Array.from({ length: pieces });
  return (
    <div className="absolute inset-0">
      {particles.map((_, i) => (
        <span
          key={i}
          className="absolute block w-2 h-3 rounded-[2px] animate-[confetti_1500ms_ease-out_infinite]"
          style={{
            left: `${(i / pieces) * 100}%`,
            top: `-${Math.random() * 20}%`,
            backgroundColor: confettiColor(i),
            transform: `rotate(${(i * 57) % 360}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function confettiColor(i: number): string {
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#F97316', '#84CC16'];
  return colors[i % colors.length];
}


