import { useCallback, useEffect, useRef, useState } from "react";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type Drum = "don" | "ka";
const notes = ["don", "ka", "don", "don large", "ka", "ka", "don"];

export function Rhythm() {
  const [muted, setMuted] = useState(false);
  const [lastHit, setLastHit] = useState<Drum | null>(null);
  const [audioError, setAudioError] = useState(false);
  const context = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const activeAnimation = useRef<Animation | null>(null);
  const mounted = useRef(true);

  const hit = useCallback(
    (type: Drum) => {
      setLastHit(type);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setLastHit(null), 240);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        activeAnimation.current?.cancel();
        activeAnimation.current =
          stage.current?.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-12px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 240, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" },
          ) ?? null;
      }
      if (muted) return;
      try {
        const audio = context.current ?? new AudioContext();
        context.current = audio;
        const sound = () => {
          if (!mounted.current || audio.state === "closed") return;
          const now = audio.currentTime;
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.type = type === "don" ? "sine" : "triangle";
          oscillator.frequency.setValueAtTime(type === "don" ? 180 : 800, now);
          oscillator.frequency.exponentialRampToValueAtTime(
            type === "don" ? 52 : 280,
            now + 0.14,
          );
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(
            type === "don" ? 0.4 : 0.15,
            now + 0.004,
          );
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.22);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        };
        if (audio.state === "suspended")
          void audio
            .resume()
            .then(sound)
            .catch(() => {
              if (mounted.current) setAudioError(true);
            });
        else sound();
      } catch {
        setAudioError(true);
      }
    },
    [muted],
  );

  useEffect(() => {
    // The shortcut is active only while the demo is visible, and never captures typing or modified keys.
    const onKey = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest('input, textarea, select, [role="dialog"]') ||
          target.isContentEditable)
      )
        return;
      const bounds = stage.current?.getBoundingClientRect();
      if (!bounds || bounds.bottom < 0 || bounds.top > window.innerHeight)
        return;
      const key = event.key.toLowerCase();
      if (["d", "f", "j", "k"].includes(key)) {
        event.preventDefault();
        hit(key === "d" || key === "f" ? "don" : "ka");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hit]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
      activeAnimation.current?.cancel();
      if (context.current && context.current.state !== "closed")
        void context.current.close().catch(() => {});
      context.current = null;
    };
  }, []);

  return (
    <div className="rhythm" aria-label="互动节奏体验">
      <div className="rhythm-heading">
        <span>每一份热爱，都有回响。</span>
        <span className="rhythm-signature" aria-hidden="true">
          DON. KA. OUR TAIKO.
        </span>
      </div>
      <div className="rhythm-stage" data-hit={lastHit ?? undefined}>
        <div className="hit-target" aria-hidden="true">
          <span />
        </div>
        <div className="note-track" ref={stage} aria-hidden="true">
          <div className="track-line" />
          <div className="track-beats">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className="track-notes">
            {notes.map((note, i) => (
              <span key={i} className={`note ${note}`} />
            ))}
          </div>
        </div>
        <span className="hit-label" aria-hidden="true">
          {lastHit === "don" ? "咚" : lastHit === "ka" ? "咔" : "♪"}
        </span>
      </div>
      <div className="rhythm-controls">
        <p>
          <span className="hidden sm:inline">敲一下，</span>听见你的节奏
          <span className="hidden md:inline">，也试试键盘 D / K</span>。
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="drum-pad"
            data-active={lastHit === "don"}
            onClick={() => hit("don")}
            aria-label="敲击咚音，快捷键 D 或 F"
          >
            <kbd>D</kbd> 咚
          </Button>
          <Button
            variant="secondary"
            className="drum-pad"
            data-active={lastHit === "ka"}
            onClick={() => hit("ka")}
            aria-label="敲击咔音，快捷键 J 或 K"
          >
            <kbd>K</kbd> 咔
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => setMuted((value) => !value)}
            aria-pressed={muted}
            aria-label={muted ? "开启声音" : "静音"}
          >
            {muted ? (
              <SpeakerSlashIcon size={20} />
            ) : (
              <SpeakerHighIcon size={20} />
            )}
          </Button>
        </div>
      </div>
      {audioError ? (
        <p
          className="mt-3 text-left text-sm text-muted-foreground"
          role="status"
        >
          浏览器暂不支持声音，仍可体验鼓面互动。
        </p>
      ) : null}
    </div>
  );
}
