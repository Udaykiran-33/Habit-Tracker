"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Flame, LineChart, Medal } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── refined palette ── */
const C = {
  cream:       "#FAF6F0",
  creamMid:    "#F0EAE0",
  creamDark:   "#E5DDD0",
  creamBorder: "#D8CEBC",
  black:       "#111111",
  blackSoft:   "#1C1C1C",
  blackCard:   "#222222",
  olive:       "#556B2F",
  oliveMid:    "#6B8C3A",
  oliveBright: "#8BAF48",
  olivePale:   "#DCE9C0",
  oliveFaint:  "#EFF5E4",
  muted:       "#85806F",
  mutedLight:  "#A09A88",
};

export default function LandingClient() {
  const rootRef       = useRef<HTMLDivElement>(null);
  const navRef        = useRef<HTMLElement>(null);
  const badgeRef      = useRef<HTMLDivElement>(null);
  const h1Ref         = useRef<HTMLHeadingElement>(null);
  const subRef        = useRef<HTMLParagraphElement>(null);
  const ctasRef       = useRef<HTMLDivElement>(null);
  const mockupRef     = useRef<HTMLDivElement>(null);
  const mockupMobRef  = useRef<HTMLDivElement>(null);
  const stat1Ref      = useRef<HTMLDivElement>(null);
  const stat2Ref      = useRef<HTMLDivElement>(null);
  const featTitleRef  = useRef<HTMLDivElement>(null);
  const featuresRef   = useRef<HTMLDivElement>(null);
  const proofRef      = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const footerRef     = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ── load animation ── */
      gsap.from(navRef.current, { y: -50, opacity: 0, duration: 0.6, ease: "power3.out" });

      gsap.from([badgeRef.current, h1Ref.current, subRef.current, ctasRef.current], {
        y: 45, opacity: 0, duration: 0.85, stagger: 0.14, ease: "power3.out", delay: 0.25,
      });

      /* desktop mockup */
      mm.add("(min-width: 901px)", () => {
        gsap.from(mockupRef.current, { x: 100, opacity: 0, rotate: 3, duration: 1.1, ease: "power3.out", delay: 0.4 });
        gsap.from([stat1Ref.current, stat2Ref.current], {
          scale: 0.6, opacity: 0, duration: 0.65, stagger: 0.18, ease: "back.out(1.6)", delay: 0.85,
        });
        gsap.to(stat1Ref.current, { y: -10, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(stat2Ref.current, { y:  10, duration: 3,   yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.5 });
      });

      /* mobile mockup */
      mm.add("(max-width: 900px)", () => {
        gsap.from(mockupMobRef.current, {
          y: 50, opacity: 0, scale: 0.92, duration: 0.9, ease: "power3.out", delay: 0.5,
        });
      });

      /* ── Features title ── */
      gsap.from(featTitleRef.current, {
        scrollTrigger: { trigger: featTitleRef.current, start: "top 88%", once: true },
        y: 35, opacity: 0, duration: 0.7, ease: "power3.out",
      });

      /* ── Feature cards stagger ── */
      const cards = featuresRef.current?.querySelectorAll(".fc");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: featuresRef.current, start: "top 82%", once: true },
          y: 55, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
        });
      }

      /* ── Social proof ── */
      ScrollTrigger.create({
        trigger: proofRef.current, start: "top 86%", once: true,
        onEnter: () => {
          gsap.from(proofRef.current!.querySelectorAll(".sp-item"), {
            y: 35, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out",
          });
        },
      });

      /* ── CTA ── */
      gsap.from(ctaSectionRef.current, {
        scrollTrigger: { trigger: ctaSectionRef.current, start: "top 88%", once: true },
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      });

      /* ── Footer ── */
      gsap.from(footerRef.current, {
        scrollTrigger: { trigger: footerRef.current, start: "top 96%", once: true },
        y: 20, opacity: 0, duration: 0.5, ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        /* ═══ BASE ═══ */
        .lp { background:${C.cream}; color:${C.black}; min-height:100vh; font-family:'Inter',system-ui,Arial,sans-serif; overflow-x:hidden; }

        /* ═══ NAV ═══ */
        .n { display:flex; align-items:center; justify-content:space-between; padding:1rem 6vw; position:sticky; top:0; z-index:100; background:rgba(250,246,240,0.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid ${C.creamDark}; }
        .n-logo { font-size:1.3rem; font-weight:900; letter-spacing:-0.04em; color:${C.black}; }
        .n-links { display:flex; align-items:center; gap:0.85rem; }
        .n-si { color:${C.black}; text-decoration:none; font-size:0.85rem; font-weight:500; opacity:0.55; }
        .n-si:hover { opacity:1; }
        .n-cta { background:${C.olive}; color:${C.cream}; text-decoration:none; font-size:0.8rem; font-weight:700; padding:0.5rem 1.2rem; border-radius:999px; }
        .n-cta:hover { background:${C.oliveMid}; }

        /* ═══ HERO ═══ */
        .h { display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; padding:5.5rem 6vw 5rem; max-width:1220px; margin:0 auto; }
        .h-badge { display:inline-block; background:${C.olivePale}; color:${C.olive}; font-size:0.7rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; padding:0.38rem 1rem; border-radius:999px; margin-bottom:1.4rem; }
        .h-title { font-size:clamp(2.5rem,5vw,4.1rem); font-weight:900; line-height:1.06; letter-spacing:-0.045em; color:${C.black}; margin:0 0 1.3rem; }
        .h-acc { color:${C.olive}; display:inline-block; padding-bottom:5px; border-bottom:4px solid ${C.oliveBright}; }
        .h-sub { font-size:1.05rem; color:${C.muted}; line-height:1.75; max-width:440px; margin:0 0 2.25rem; }
        .h-ctas { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
        .btn-p { background:${C.olive}; color:${C.cream}; text-decoration:none; font-size:0.95rem; font-weight:700; padding:0.85rem 2.2rem; border-radius:999px; box-shadow:0 6px 26px rgba(85,107,47,0.28); display:inline-block; text-align:center; }
        .btn-p:hover { background:${C.oliveMid}; transform:translateY(-2px); box-shadow:0 10px 32px rgba(85,107,47,0.32); }
        .btn-g { color:${C.black}; text-decoration:none; font-size:0.875rem; opacity:0.5; border-bottom:1px solid ${C.black}; }
        .btn-g:hover { opacity:1; }

        /* hero visual (desktop) */
        .h-vis { display:flex; justify-content:center; align-items:center; }
        .h-mock { position:relative; }
        .h-img { border-radius:20px; display:block; width:100%; height:auto; max-width:480px; border:2px solid ${C.creamDark}; box-shadow:0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04); }
        .fs { position:absolute; background:${C.black}; color:${C.cream}; border-radius:14px; padding:0.6rem 1.05rem; box-shadow:0 8px 28px rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.07); min-width:138px; }
        .fs-t { top:-16px; right:-16px; }
        .fs-b { bottom:-16px; left:-16px; }
        .fs-l { font-size:0.58rem; opacity:0.4; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; }
        .fs-v { font-size:0.95rem; font-weight:900; color:${C.oliveBright}; margin-top:2px; }

        /* hero visual (mobile) — shown below hero copy */
        .h-vis-mob { display:none; }

        /* ═══ FEATURES ═══ */
        .f { background:${C.creamMid}; padding:5rem 6vw; }
        .f-hdr { text-align:center; max-width:560px; margin:0 auto 3rem; }
        .s-badge { display:inline-block; background:${C.olivePale}; color:${C.olive}; font-size:0.68rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; padding:0.3rem 0.9rem; border-radius:999px; margin-bottom:0.85rem; }
        .s-title { font-size:clamp(1.55rem,3vw,2.3rem); font-weight:900; color:${C.black}; letter-spacing:-0.04em; line-height:1.18; margin:0; }
        .f-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.1rem; max-width:1100px; margin:0 auto; }
        .fc { background:${C.cream}; border:1.5px solid ${C.creamBorder}; border-radius:20px; padding:1.75rem 1.5rem; position:relative; overflow:hidden; cursor:default; }
        .fc-n { position:absolute; top:14px; right:16px; font-size:0.66rem; font-weight:800; color:${C.creamBorder}; letter-spacing:0.05em; }
        .fc-i { width:46px; height:46px; border-radius:13px; background:${C.oliveFaint}; display:flex; align-items:center; justify-content:center; font-size:1.35rem; margin-bottom:1.1rem; border:1px solid ${C.olivePale}; }
        .fc-t { font-size:0.92rem; font-weight:800; color:${C.black}; margin-bottom:0.4rem; letter-spacing:-0.02em; }
        .fc-d { font-size:0.82rem; color:${C.muted}; line-height:1.65; }
        .fc-ln { position:absolute; bottom:0; left:0; width:42%; height:3px; background:linear-gradient(90deg,${C.olive},transparent); border-bottom-left-radius:20px; }

        /* ═══ CREATOR ═══ */
        .p { background:${C.cream}; padding:5.5rem 6vw; text-align:center; border-top:1px solid ${C.creamDark}; }
        .p-lbl { color:${C.mutedLight}; font-size:0.75rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; margin:0 0 2.5rem; }
        .p-avatar-wrap { display:inline-flex; align-items:center; justify-content:center; position:relative; margin-bottom:1.5rem; width:220px; height:220px; border-radius:50%; border:6px solid ${C.cream}; box-shadow:0 18px 48px rgba(85,107,47,0.22), 0 0 0 3px ${C.olivePale}; overflow:hidden; }
        .p-avatar { width:100%; height:100%; object-fit:cover; object-position:center 20%; display:block; }
        .p-msg { max-width:580px; margin:0 auto 1.25rem; font-size:1.2rem; color:${C.black}; line-height:1.7; font-weight:500; letter-spacing:-0.01em; }
        .p-author { font-size:0.95rem; font-weight:800; color:${C.olive}; letter-spacing:0.02em; text-transform:uppercase; }

        /* ═══ CTA ═══ */
        .c { background:${C.olive}; padding:5rem 6vw; text-align:center; }
        .c-t { font-size:clamp(1.8rem,3.5vw,2.8rem); font-weight:900; color:${C.cream}; letter-spacing:-0.035em; margin:0 0 0.75rem; }
        .c-s { color:rgba(250,246,240,0.68); font-size:1rem; margin:0 0 2.25rem; }
        .c-btn { background:${C.cream}; color:${C.olive}; text-decoration:none; font-size:1rem; font-weight:800; padding:0.9rem 2.6rem; border-radius:999px; box-shadow:0 8px 28px rgba(0,0,0,0.13); display:inline-block; }
        .c-btn:hover { background:${C.creamMid}; }

        /* ═══ FOOTER ═══ */
        .ft { background:${C.black}; display:flex; align-items:center; justify-content:space-between; padding:1.4rem 6vw; border-top:1px solid rgba(255,255,255,0.04); flex-wrap:wrap; gap:0.5rem; }
        .ft-logo { font-size:1.1rem; font-weight:900; color:${C.cream}; letter-spacing:-0.03em; }
        .ft-copy { font-size:0.76rem; color:rgba(250,246,240,0.28); }

        /* ═══════════ TABLET (≤900px) ═══════════ */
        @media(max-width:900px){
          .h { grid-template-columns:1fr; padding:3.5rem 6vw 1.5rem; gap:0; text-align:center; }
          .h-badge { margin-left:auto; margin-right:auto; }
          .h-sub { max-width:100%; margin-left:auto; margin-right:auto; }
          .h-ctas { justify-content:center; }
          .h-vis { display:none; }
          /* show mobile image */
          .h-vis-mob { display:flex; justify-content:center; padding:2rem 6vw 3rem; }
          .h-vis-mob img { border-radius:18px; width:100%; max-width:380px; height:auto; box-shadow:0 20px 56px rgba(0,0,0,0.1),0 0 0 1px rgba(0,0,0,0.04); border:2px solid ${C.creamDark}; }
          .f-grid { grid-template-columns:1fr 1fr; }
          .p-grid { gap:2.5rem; }
        }

        /* ═══════════ MOBILE (≤600px) ═══════════ */
        @media(max-width:600px){
          .n { padding:0.85rem 5vw; }
          .n-logo { font-size:1.15rem; }
          .n-si { display:none; }
          .n-cta { font-size:0.78rem; padding:0.42rem 0.95rem; }

          .h { padding:2.5rem 5vw 1rem; }
          .h-title { font-size:2.2rem; }
          .h-sub { font-size:0.95rem; margin-bottom:1.75rem; }
          .h-ctas { flex-direction:column; align-items:stretch; gap:0.75rem; }
          .btn-p { width:100%; padding:1rem; font-size:1rem; }
          .btn-g { text-align:center; font-size:0.82rem; }

          .h-vis-mob { padding:1.5rem 5vw 2.5rem; }
          .h-vis-mob img { max-width:300px; border-radius:16px; }

          .f { padding:3rem 5vw; }
          .f-grid { grid-template-columns:1fr; gap:0.8rem; }
          .fc { padding:1.4rem 1.2rem; border-radius:16px; }
          .fc-i { width:40px; height:40px; font-size:1.2rem; }
          .s-title { font-size:1.5rem; }

          .p { padding:4rem 5vw; }
          .p-avatar-wrap { width:200px; height:200px; }
          .p-msg { font-size:1.05rem; }

          .c { padding:3rem 5vw; }
          .c-t { font-size:1.7rem; }
          .c-btn { display:block; width:100%; max-width:320px; margin:0 auto; padding:1rem; }

          .ft { flex-direction:column; align-items:center; text-align:center; padding:1.3rem 5vw; gap:0.35rem; }
        }

        /* ═══════════ SMALL MOBILE (≤380px) ═══════════ */
        @media(max-width:380px){
          .h-title { font-size:1.9rem; }
          .h-badge { font-size:0.62rem; padding:0.3rem 0.8rem; }
        }
      `}</style>

      <div ref={rootRef} className="lp">

        {/* ── NAV ── */}
        <nav ref={navRef} className="n">
          <span className="n-logo"><img src="/logo.png" alt="UrHabit" style={{ width: 32, height: 32, borderRadius: 8, display: "inline-block", verticalAlign: "middle", marginRight: 8 }} />UrHabit</span>
          <div className="n-links">
            <Link href="/login" className="n-si">Sign In</Link>
            <Link href="/register" className="n-cta">Get Started</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="h">
          <div>
            <div ref={badgeRef} className="h-badge">Discipline Builds Destiny</div>
            <h1 ref={h1Ref} className="h-title">
              Build Habits That<br />
              <span className="h-acc">Actually Stick</span>
            </h1>
            <p ref={subRef} className="h-sub">
              Track streaks, earn rewards, and unlock your best self — one disciplined day at a time.
            </p>
            <div ref={ctasRef} className="h-ctas">
              <Link href="/register" className="btn-p">Start for Free</Link>
              <Link href="/login" className="btn-g">I already have an account</Link>
            </div>
          </div>

          {/* Desktop mockup */}
          <div className="h-vis">
            <div ref={mockupRef} className="h-mock">
              <Image src="/hero-mockup.png" alt="UrHabit dashboard" width={480} height={350} priority className="h-img" />
              <div ref={stat1Ref} className="fs fs-t">
                <div className="fs-l">Current Streak</div>
                <div className="fs-v">🔥 21 days</div>
              </div>
              <div ref={stat2Ref} className="fs fs-b">
                <div className="fs-l">Completion Rate</div>
                <div className="fs-v">87% this week</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile mockup — visible ≤900px */}
        <div ref={mockupMobRef} className="h-vis-mob">
          <Image src="/hero-mockup.png" alt="UrHabit dashboard" width={380} height={280} priority />
        </div>

        {/* ── FEATURES ── */}
        <section className="f">
          <div ref={featTitleRef} className="f-hdr">
            <div className="s-badge">Why UrHabit</div>
            <h2 className="s-title">
              Everything you need to <span style={{ color: C.olive }}>dominate your goals</span>
            </h2>
          </div>
          <div ref={featuresRef} className="f-grid">
            {[
              { n: "01", icon: <CalendarDays strokeWidth={1.5} />, t: "Daily Tracking",     d: "Mark habits done and build unbreakable momentum every single day." },
              { n: "02", icon: <Flame strokeWidth={1.5} />, t: "Streak Monitoring",  d: "Fire streaks that hold you accountable and keep you coming back." },
              { n: "03", icon: <LineChart strokeWidth={1.5} />, t: "Progress Analytics", d: "Charts and GitHub-style heatmaps to visualise your real growth." },
              { n: "04", icon: <Medal strokeWidth={1.5} />, t: "Gamification",       d: "Earn XP, level up through ranks, and unlock achievement badges." },
            ].map(f => (
              <div key={f.t} className="fc"
                onMouseEnter={e => gsap.to(e.currentTarget, { y: -6, boxShadow: `0 18px 44px rgba(85,107,47,0.13)`, borderColor: C.oliveBright, duration: 0.28, ease: "power2.out" })}
                onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, boxShadow: "none", borderColor: C.creamBorder, duration: 0.32, ease: "power2.out" })}
              >
                <span className="fc-n">{f.n}</span>
                <div className="fc-i text-olive">{f.icon}</div>
                <div className="fc-t">{f.t}</div>
                <div className="fc-d">{f.d}</div>
                <div className="fc-ln" />
              </div>
            ))}
          </div>
        </section>

        {/* ── CREATOR ── */}
        <section ref={proofRef} className="p">
          <p className="p-lbl">Creator of UrHabit</p>
          <div className="sp-item">
            <div className="p-avatar-wrap">
              <Image 
                src="https://res.cloudinary.com/dmyww4jcv/image/upload/v1772437842/Gemini_Generated_Image_lzcze1lzcze1lzcz_nji7eh.jpg" 
                alt="Uday Kiran" 
                width={500} 
                height={500} 
                className="p-avatar" 
                unoptimized
              />
            </div>
            <p className="p-msg">"Enjoy adding unlimited habits and track them to stay consistent."</p>
            <div className="p-author">— Developed by Uday Kiran</div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaSectionRef} className="c">
          <h2 className="c-t">Ready to become unstoppable?</h2>
          <p className="c-s">Join thousands building better habits every day.</p>
          <Link href="/register" className="c-btn"
            onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.22, ease: "power2.out" })}
            onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.22, ease: "power2.out" })}
          >
            Create Free Account →
          </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer ref={footerRef} className="ft">
          <span className="ft-logo"><img src="/logo.png" alt="UrHabit" style={{ width: 24, height: 24, borderRadius: 6, display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />UrHabit</span>
          <span className="ft-copy">© 2026 UrHabit. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}
