import { useMemo, useState } from "react";
import {
  Clock,
  DoorClosed,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Info,
} from "lucide-react";

const ROOM = "B-204";

const NOW_HOURS = 9;
const NOW_MINUTES = 0;
const NOW_MIN = NOW_HOURS * 60 + NOW_MINUTES; // 540

interface Booking {
  start: number; // minutes after midnight
  end: number;
  label: string;
}

const EXISTING_BOOKINGS: Booking[] = [
  { start: 10 * 60, end: 11 * 60, label: "Intro to Algorithms" },
  { start: 13 * 60, end: 14 * 60, label: "Faculty Meeting" },
];

const DAY_START = 8 * 60; // 08:00 — earliest shown on timeline
const DAY_END = 18 * 60; // 18:00 — latest shown on timeline

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h === 24) {
    if (min !== 0) return null;
    return 1440;
  }
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface CheckResult {
  available: boolean;
  messages: string[];
  request?: { start: number; end: number };
}

function checkAvailability(
  start: number,
  end: number,
  blocked: boolean,
): CheckResult {
  const messages: string[] = [];

  if (start < 0 || end > 1440) {
    messages.push("Times must be within the same day (00:00–24:00).");
  }
  if (start >= end) {
    return {
      available: false,
      messages: ["End time must be later than start time."],
    };
  }
  if (start <= NOW_MIN) {
    messages.push(
      `Start time must be strictly after the current time (${toHHMM(NOW_MIN)}).`,
    );
  }

  const duration = end - start;
  if (duration > 120) {
    messages.push(
      `Booking length is ${duration} minutes — the maximum allowed is 120 minutes.`,
    );
  }

  if (blocked) {
    messages.push("Room B-204 is currently blocked and cannot be booked.");
  }

  const overlap = EXISTING_BOOKINGS.find(
    (b) => start < b.end && end > b.start,
  );
  if (overlap) {
    messages.push(
      `Overlaps an existing booking (${toHHMM(overlap.start)}–${toHHMM(overlap.end)}, ${overlap.label}).`,
    );
  }

  if (messages.length > 0) {
    return { available: false, messages };
  }

  messages.push(
    `Room B-204 is available from ${toHHMM(start)} to ${toHHMM(end)}.`,
  );
  return { available: true, messages, request: { start, end } };
}

export default function App() {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const reset = () => setResult(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = toMinutes(startInput);
    const end = toMinutes(endInput);

    if (start === null || end === null) {
      setResult({
        available: false,
        messages: ["Please enter times in HH:MM format (24-hour)."],
      });
      return;
    }

    setResult(checkAvailability(start, end, blocked));
  };

  const handleClear = () => {
    setStartInput("");
    setEndInput("");
    setBlocked(false);
    setResult(null);
  };

  // Preview the requested interval on the timeline when we have a valid result
  const requestedInterval = useMemo(() => {
    if (!result?.available || !result.request) return null;
    return result.request;
  }, [result]);

  const span = DAY_END - DAY_START;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-10">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Smart Campus
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            Room Availability Checker
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Check whether Room {ROOM} is free for a study session. No booking is
            created — this tool only checks availability.
          </p>
        </header>

        {/* Room status card */}
        <section
          aria-label="Room status"
          className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <DoorClosed className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Room
                </p>
                <p className="text-lg font-bold leading-none">{ROOM}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Clock className="h-3.5 w-3.5" /> Now
              </p>
              <p className="text-lg font-bold leading-none tabular-nums">
                {toHHMM(NOW_MIN)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                blocked
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  blocked ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              {blocked ? "Blocked" : "Open"}
            </span>
            <span className="text-xs text-slate-500">
              Max session length: 120 min
            </span>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">
            Today's schedule
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            Colored blocks are existing bookings. You may book before, between,
            or after them.
          </p>

          <div className="relative h-12 overflow-hidden rounded-lg bg-slate-100">
            {/* now marker */}
            <div
              className="absolute top-0 z-20 h-full w-0.5 bg-slate-900"
              style={{
                left: `${((NOW_MIN - DAY_START) / span) * 100}%`,
              }}
            >
              <span className="absolute -top-0.5 left-1 text-[10px] font-semibold text-slate-700">
                now
              </span>
            </div>

            {/* existing bookings */}
            {EXISTING_BOOKINGS.map((b) => {
              const left = Math.max(0, ((b.start - DAY_START) / span) * 100);
              const width = Math.min(
                100 - left,
                ((b.end - Math.max(b.start, DAY_START)) / span) * 100,
              );
              return (
                <div
                  key={b.label}
                  className="absolute top-0 z-10 flex h-full items-center justify-center overflow-hidden bg-amber-200/80 px-1 text-[10px] font-medium text-amber-900"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${toHHMM(b.start)}–${toHHMM(b.end)} ${b.label}`}
                >
                  <span className="truncate">{b.label}</span>
                </div>
              );
            })}

            {/* requested interval preview */}
            {requestedInterval &&
              (() => {
                const left = Math.max(
                  0,
                  ((requestedInterval.start - DAY_START) / span) * 100,
                );
                const width = Math.min(
                  100 - left,
                  ((requestedInterval.end -
                    Math.max(requestedInterval.start, DAY_START)) /
                    span) *
                    100,
                );
                return (
                  <div
                    className="absolute bottom-0 z-10 h-2 bg-emerald-500"
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title="Your requested time"
                  />
                );
              })()}
          </div>

          {/* hour labels */}
          <div className="relative mt-1.5 h-4 text-[10px] text-slate-400">
            {Array.from({ length: 11 }, (_, i) => {
              const min = DAY_START + i * 60;
              return (
                <span
                  key={min}
                  className="absolute -translate-x-1/2 tabular-nums"
                  style={{ left: `${((min - DAY_START) / span) * 100}%` }}
                >
                  {toHHMM(min)}
                </span>
              );
            })}
          </div>

          {/* booking legend */}
          <ul className="mt-3 space-y-1.5">
            {EXISTING_BOOKINGS.map((b) => (
              <li
                key={b.label}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" />
                  {b.label}
                </span>
                <span className="font-medium tabular-nums text-slate-600">
                  {toHHMM(b.start)}–{toHHMM(b.end)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Your requested time
              </span>
            </li>
          </ul>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Check a time
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Start time
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={startInput}
                onChange={(e) => {
                  setStartInput(e.target.value);
                  reset();
                }}
                placeholder="HH:MM"
                aria-label="Start time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                End time
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={endInput}
                onChange={(e) => {
                  setEndInput(e.target.value);
                  reset();
                }}
                placeholder="HH:MM"
                aria-label="End time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => {
                setBlocked(e.target.checked);
                reset();
              }}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Room is blocked</span>
          </label>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Check availability
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <section
            aria-live="polite"
            className={`rounded-2xl border p-4 shadow-sm transition ${
              result.available
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {result.available ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
              ) : (
                <CalendarX className="h-6 w-6 shrink-0 text-red-600" />
              )}
              <h2
                className={`text-lg font-bold ${
                  result.available ? "text-emerald-800" : "text-red-800"
                }`}
              >
                {result.available ? "Available" : "Unavailable"}
              </h2>
            </div>

            <ul
              className={`mt-3 space-y-1.5 text-sm ${
                result.available ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {result.messages.map((msg, i) => (
                <li key={i} className="flex gap-2">
                  {!result.available && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  {result.available && i === 0 && (
                    <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{msg}</span>
                </li>
              ))}
            </ul>

            {!result.available && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                <Info className="h-3.5 w-3.5" />
                No booking was made. Fix the issues above and try again.
              </p>
            )}
          </section>
        )}

        <footer className="mt-6 text-center text-xs text-slate-400">
          Fictional data for demonstration · No account or booking required
        </footer>
      </div>
    </div>
  );
}
