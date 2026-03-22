import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Zap,
  Brain,
  CheckCircle,
  Star,
  Twitter,
  Github,
  Rss,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-background">
      {/* Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen"></div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border-glass bg-bg-surface-glass backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-foreground">
            <div className="size-8 flex items-center justify-center text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-display">Neyro</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium hover:text-accent transition-colors text-slate-300" href="/dashboard?tab=method">Method</Link>
            <Link className="text-sm font-medium hover:text-accent transition-colors text-slate-300" href="/dashboard?tab=pricing">Pricing</Link>
            <Link className="text-sm font-medium hover:text-accent transition-colors text-slate-300" href="/dashboard?tab=blog">Blog</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link className="hidden sm:block text-sm font-medium hover:text-foreground/80 text-slate-300 transition-colors" href="/auth/login">Log in</Link>
            <Link
              href="/dashboard"
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary hover:bg-primary/90 transition-all text-white text-sm font-bold shadow-[0_0_20px_-5px_rgba(140,37,244,0.5)]"
            >
              <span className="truncate">Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow z-10 flex flex-col items-center w-full">

        {/* Hero Section */}
        <section className="w-full max-w-7xl px-4 md:px-10 pt-24 pb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-accent text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now with GPT-4 Turbo
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 max-w-5xl font-display">
            Organize Your Life.<br />
            <span className="text-accent align-middle">Powered by AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-light">
            Master your workflow with the PARA method and GTD principles, supercharged by intelligent automation that sorts your chaos into clarity.
          </p>

          <div className="flex flex-wrap gap-4 justify-center w-full">
            <Link href="/dashboard" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all shadow-[0_0_30px_-5px_rgba(140,37,244,0.6)] flex items-center gap-2 hover:scale-105 duration-200">
              Start for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => setIsVideoModalOpen(true)}
              className="h-14 px-8 rounded-full bg-transparent border border-white/10 hover:bg-white/5 text-foreground font-bold text-base transition-all flex items-center gap-2 hover:border-white/20"
            >
              <PlayCircle className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </section>

        {/* Visual Showcase (3D Mockup) */}
        <section className="w-full max-w-7xl px-4 md:px-10 py-10 relative">
          <div className="relative w-full aspect-[16/9] md:aspect-[2.2/1] rounded-2xl border border-white/10 bg-black/40 shadow-2xl overflow-hidden group perspective-1000">
            {/* Glow effect behind the image inside the container */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>

            {/* The Image - Using the generated mock URL or a placeholder if preferred. Ideally, we snapshot the real dashboard. */}
            <div className="w-full h-full relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWY1FU8OmCzZtecdwIriss27mjMsqzBY57jIvL0OMKhLJ48MN5efXcmmeYBkOrjRnPWmjEx5RwPHOpGg2QxWm62JHXDFtevDyqXNEMRvtMuWj_8kh4NO4w8WzLcsxIFuuomMX3cwDD1J2W4OB1j8XfyPj7H0g26vB5A6rkXXtHnc7q0rI5kdeZoEjqrVfbpYSpyQRlHpgASW_S4KWI68md3yITXCvlS4jp0HfDLjJiP6vyqpLYpDpK8L-NlE2N85TbBKX-Y_V-54I4"
                alt="Neyro Dashboard Interface"
                fill
                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                unoptimized // Since it's an external URL that might vary
              />
            </div>

            {/* Overlay Elements for UI Feel (Floating Timer) */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-bg-deep via-bg-deep/80 to-transparent"></div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-xl flex items-center gap-4 border-t border-white/20 shadow-lg backdrop-blur-xl bg-black/40">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Focus</span>
                <span className="text-white font-mono font-bold text-xl">24:05</span>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span>Review Q3 Strategy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-7xl px-4 md:px-10 py-32">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold text-white font-display">Why Neyro?</h2>
              <p className="text-slate-400 text-lg max-w-xl">Experience the next evolution of productivity tools designed for speed, clarity, and peace of mind.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="glass-panel p-10 rounded-3xl flex flex-col gap-6 hover:bg-white/5 transition-colors group border border-white/5 hover:border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-display">Capture First</h3>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Instantly log ideas, tasks, and notes from anywhere before they slip away. Universal capture shortcut included.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-panel p-10 rounded-3xl flex flex-col gap-6 hover:bg-white/5 transition-colors group border border-white/5 hover:border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-display">AI Sorting</h3>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Stop organizing manually. Let our AI categorize your inputs into Projects, Areas, Resources, and Archives instantly.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass-panel p-10 rounded-3xl flex flex-col gap-6 hover:bg-white/5 transition-colors group border border-white/5 hover:border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-display">Action Oriented</h3>
                  <p className="text-slate-400 leading-relaxed text-base">
                    Neyro surfaces context-aware &quot;Next Actions&quot; so you always know exactly what to do when you sit down to work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial / Social Proof */}
        <section className="w-full border-y border-white/5 bg-black/20">
          <div className="w-full max-w-7xl mx-auto py-24 px-4 md:px-10 flex flex-col items-center">
            <div className="max-w-4xl text-center flex flex-col items-center gap-8">
              <div className="flex gap-1 text-accent">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-current" />
                ))}
              </div>
              <h3 className="text-3xl md:text-5xl font-medium text-white leading-tight font-display">
                &quot;I used to spend more time organizing my tasks than doing them. Neyro changed that in a single afternoon. It feels like magic.&quot;
              </h3>
              <div className="flex items-center gap-4 mt-4">
                <div className="size-14 rounded-full bg-slate-700 overflow-hidden relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXLmDnQaNp2ObQ8XoVCtOeiu5mCsVa6LC5HgqTbcd_cbuH2zENW7auvI9ysIbSwlqm05-aCu4DDql7teBqVCCpsk47zSaFvlunWq24TGF6l95jSaaEX0XNiSKzRk1CoMP6oCqZ_-hIAPCNuYdaCe1OTRcDTIW--wmVcI0ZeBBJ1U8qjXz3k9jVFtuViHj0Le8EbSpJ0PORXcsIw6_NC2Mg1CEuNXrYKrfhlwkMJW2wULGNp43f8Dttvb5fAveVfEmvzOQGyo3urb4Q"
                    alt="Alex Chen"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">Alex Chen</div>
                  <div className="text-accent text-sm font-medium">Product Designer</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-7xl px-4 md:px-10 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 pt-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg font-display">Neyro</span>
              </div>
              <p className="text-slate-500 text-sm text-center md:text-left">© 2024 Neyro Inc. All rights reserved.</p>
            </div>
            <div className="flex gap-8 text-slate-400">
              <Link className="hover:text-accent transition-colors text-sm" href="#">Privacy Policy</Link>
              <Link className="hover:text-accent transition-colors text-sm" href="#">Terms of Service</Link>
              <Link className="hover:text-accent transition-colors text-sm" href="#">Contact Support</Link>
            </div>
            <div className="flex gap-4">
              <a className="size-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-slate-400 hover:text-accent transition-all" href="https://twitter.com/neyro">
                <Twitter className="w-5 h-5" />
              </a>
              <a className="size-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-slate-400 hover:text-accent transition-all" href="https://github.com/ShamWuo/Neyro">
                <Github className="w-5 h-5" />
              </a>
              <a className="size-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-slate-400 hover:text-accent transition-all" href="/rss">
                <Rss className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Video Modal */}
          {isVideoModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
              <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                onClick={() => setIsVideoModalOpen(false)}
              />
              <div className="relative w-full max-w-5xl aspect-video bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <button 
                  onClick={() => setIsVideoModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <PlayCircle className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-white font-medium">Coming Soon: Interactive Neyro Walkthrough</p>
                    <p className="text-slate-400 text-sm">Experience how AI transforms your PARA workflow in real-time.</p>
                </div>
              </div>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
