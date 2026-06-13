"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, Sparkles } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useTheme } from "./ThemeProvider";

function StatCounter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const totalMiliseconds = duration * 1000;
    const steps = 60;
    const stepTime = totalMiliseconds / steps;
    const increment = end / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(end);
      } else {
        start += increment;
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Hero() {
  const { theme } = useTheme();
  const [imgTimestamp, setImgTimestamp] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    setImgTimestamp(Date.now().toString());
  }, []);

  // Mouse Parallax for Fish & Background
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springConfig);
  const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      // Store raw relative coordinates for Canvas particles
      mouseRef.current = { x: relativeX, y: relativeY };

      // Update Motion Values for Framer Motion Parallax (-0.5 to 0.5)
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  // HTML5 Canvas particles and bubbles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Classes inside useEffect to avoid scope leakage
    class Particle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;
      wobbleRange: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height + height * 0.2; // Start from middle or lower
        this.radius = Math.random() * 2 + 0.5; // very tiny particles
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.35 + 0.05;
        this.wobble = Math.random() * Math.PI;
        this.wobbleSpeed = Math.random() * 0.01 + 0.002;
        this.wobbleRange = Math.random() * 1.0;
      }

      update() {
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.05;

        // Mouse displacement
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${this.opacity})`;
        ctx.fill();
      }
    }

    class Bubble {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      opacity: number;
      wobble: number;
      wobbleSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height + 20;
        this.radius = Math.random() * 4 + 2; // small bubbles
        this.speedY = -(Math.random() * 1.0 + 0.4);
        this.opacity = Math.random() * 0.2 + 0.05;
        this.wobble = Math.random() * Math.PI;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
      }

      update() {
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.3;

        // Push away from mouse
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.x += (dx / dist) * force * 2.5;
        }

        if (this.y < -20) {
          this.y = height + 20;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 191, 255, ${this.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Little highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 1.5})`;
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const bubbles: Bubble[] = [];

    for (let i = 0; i < 60; i++) particles.push(new Particle());
    for (let i = 0; i < 25; i++) bubbles.push(new Bubble());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Slow drift caustics light effect overlay on canvas
      const time = Date.now() * 0.0002;
      const gradient = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time) * 100,
        -100,
        100,
        width * 0.5,
        -100,
        width * 0.8
      );
      gradient.addColorStop(0, "rgba(34, 211, 238, 0.03)");
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.01)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      bubbles.forEach((b) => {
        b.update();
        b.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen w-full flex items-center overflow-hidden bg-bg z-10 transition-colors duration-300"
    >
      {/* Cinematic Hero Background Image (edge-to-edge) */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        {imgTimestamp && (
          <Image
            src={`/hero.png?t=${imgTimestamp}`}
            alt="Aquarium Exhibition Background"
            fill
            priority
            unoptimized
            className="object-cover object-center w-full h-full"
          />
        )}
        {/* Subtle theme-aware overlay for readability */}
        <div 
          className="absolute inset-0 transition-colors duration-500" 
          style={{
            backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.25)"
          }}
        />
      </div>

      {/* LAYER 2: Environment Layer (Canvas Bubbles & Particles) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full pointer-events-none"
      />

      {/* LAYER 3: Betta Fish Scene (Desktop & Tablet only) */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-[38vw] min-w-[280px] max-w-[650px] h-[70vh] select-none pointer-events-none origin-right hidden md:flex items-center justify-end overflow-visible"
      >
        <div className="relative w-full h-full flex items-center justify-end">
          {/* Back glows behind the fish (bloom effect) */}
          <div className="absolute right-[10%] top-[30%] w-[300px] h-[300px] rounded-full bg-cyan-500/15 blur-[80px] mix-blend-screen pointer-events-none" />
          <div className="absolute right-[25%] top-[40%] w-[250px] h-[250px] rounded-full bg-purple-500/10 blur-[80px] mix-blend-screen pointer-events-none" />

          {/* Fish Image - Completely Static */}
          <div className="relative w-full h-full flex items-center justify-end translate-x-[10%] mr-50">
            <Image
              src="/heroMain.png"
              alt="Premium Neon Betta Fish Showcase"
              width={700}
              height={700}
              className="object-contain mix-blend-screen filter drop-shadow-[0_10px_40px_rgba(0,191,255,0.25)] select-none max-h-[80vh]"
              priority
            />
          </div>
        </div>
      </div>

      {/* LAYER 4: Gradient Overlay for text readability */}
      <div 
        className="absolute inset-y-0 left-0 w-full md:w-[70%] z-25 bg-gradient-to-r to-transparent pointer-events-none transition-all duration-300" 
        style={{
          backgroundImage: theme === "dark" 
            ? "linear-gradient(to right, #020817 0%, rgba(2, 8, 23, 0.85) 60%, transparent 100%)" 
            : "linear-gradient(to right, #F8FAFC 0%, rgba(248, 250, 252, 0.85) 60%, transparent 100%)"
        }}
      />
      <div 
        className="absolute inset-x-0 bottom-0 h-32 z-25 bg-gradient-to-t to-transparent pointer-events-none transition-all duration-300" 
        style={{
          backgroundImage: theme === "dark" 
            ? "linear-gradient(to top, #020817 0%, transparent 100%)" 
            : "linear-gradient(to top, #F8FAFC 0%, transparent 100%)"
        }}
      />

      {/* LAYER 5: Content Layer */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-12 w-full pt-24 pb-16 flex flex-col justify-center min-h-screen">
        <div className="max-w-xl md:max-w-2xl text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-accent text-xs font-semibold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Premium Aquarium Experience
          </motion.div>
 
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-text leading-[0.95]"
          >
            Happy Fish.<br />
            <span className="bg-gradient-to-r from-accent via-accent-purple to-accent-pink bg-clip-text text-transparent text-glow-cyan">
              Happy People.
            </span>
          </motion.h1>
 
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted text-base md:text-lg mt-6 leading-relaxed max-w-lg"
          >
            Transform your home with premium custom aquariums, exotic fishes, bespoke aquascaping, and professional aquarium maintenance services.
          </motion.p>
 
          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4 mt-10"
          >
            <a
              href="#collection"
              className="px-8 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-accent to-accent-purple hover:scale-105 text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]"
            >
              Explore Collection
            </a>
            <a
              href="#contact"
              className="px-8 py-4 rounded-full text-xs font-semibold tracking-widest uppercase border border-border hover:border-accent bg-card/20 hover:bg-card/40 text-text hover:text-accent transition-all duration-300 hover:scale-105"
            >
              Book Consultation
            </a>
          </motion.div>
        </div>
 
        {/* Mobile/Tablet Fish (Below Content, Above Stats) - Hidden on desktop */}
        <div className="relative w-full h-[40vh] my-8 md:hidden flex items-center justify-center select-none pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-accent/10 blur-[60px] mix-blend-screen" />
          <Image
            src="/heroMain.png"
            alt="Premium Neon Betta Fish Showcase"
            width={400}
            height={400}
            className="object-contain mix-blend-screen filter drop-shadow-[0_10px_30px_rgba(0,191,255,0.25)] max-h-[35vh]"
            priority
          />
        </div>
 
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl w-full"
        >
          {[
            { target: 15, suffix: "+", label: "Years Experience" },
            { target: 5000, suffix: "+", label: "Happy Customers" },
            { target: 250, suffix: "+", label: "Fish Species" },
            { target: 120, suffix: "+", label: "Premium Setups" }, // 120+ is luxury aquarium setups
          ].map((stat, idx) => (
            <div
              key={idx}
              className="luxury-card p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="text-3xl md:text-4xl font-display font-extrabold text-text tracking-tight bg-gradient-to-r from-text to-accent bg-clip-text text-transparent">
                <StatCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted font-medium uppercase tracking-widest mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating scroll indicator at the bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-muted hover:text-accent transition-colors pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </div>
    </div>
  );
}
