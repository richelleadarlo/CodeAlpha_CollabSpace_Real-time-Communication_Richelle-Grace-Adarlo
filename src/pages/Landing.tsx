import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Video,
  MessageSquare,
  Share2,
  PenTool,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Mic,
  Monitor,
  Globe,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Video,
    title: 'HD Video Calls',
    description: 'Crystal-clear video conferencing with adaptive quality that works on any connection.',
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Real-time messaging with file previews, reactions, and threaded conversations.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: PenTool,
    title: 'Shared Whiteboard',
    description: 'Collaborate visually on an infinite canvas — draw, sketch, and brainstorm together.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Share2,
    title: 'File Sharing',
    description: 'Drag-and-drop files directly into your meeting room for instant team access.',
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  {
    icon: Shield,
    title: 'Private Rooms',
    description: 'End-to-end encrypted rooms with password protection and owner controls.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Join',
    description: 'No downloads or plugins required — start collaborating directly in your browser.',
    color: 'from-yellow-400 to-amber-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
];

const STATS = [
  { value: '50ms', label: 'Average latency' },
  { value: '4K', label: 'Max resolution' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '∞', label: 'Collaborators' },
];

const PERKS = [
  'No credit card required',
  'Free rooms forever',
  'No download needed',
  'Works on all devices',
];

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060A14]">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#060A14] text-white overflow-x-hidden">
      {/* ── Background blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-teal-600/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-64 w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Video className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">CollabSpace</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#why" className="hover:text-white transition-colors">Why Us</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 md:px-12 pt-24 pb-20 text-center max-w-5xl mx-auto">
        {/* badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          Real-time collaboration — no installs needed
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight mb-6">
          Meet, <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">create</span>,{' '}
          <br className="hidden md:block" />
          and&nbsp;
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            collaborate
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
          CollabSpace brings your team together with HD video calls, live chat, a shared whiteboard,
          and file sharing — all in one beautiful, browser-based room.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/register"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-base shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.03] transition-all"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-medium text-base hover:bg-white/10 transition-all"
          >
            Sign in to your workspace
          </Link>
        </div>

        {/* Perks row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-1.5 text-sm text-white/45">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
              {perk}
            </div>
          ))}
        </div>
      </section>

      {/* ── Mock UI Preview ── */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-black/20">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-4 text-center">
              <div className="inline-block px-4 py-1 rounded-lg bg-white/5 text-white/30 text-xs font-mono">
                collabspace.app/room/team-sync
              </div>
            </div>
          </div>
          {/* Fake room UI */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'You', color: 'from-teal-600 to-emerald-600', mic: true, cam: true },
                { name: 'Alex K.', color: 'from-violet-600 to-purple-600', mic: true, cam: true },
                { name: 'Sam R.', color: 'from-sky-600 to-blue-600', mic: false, cam: true },
                { name: 'Maria L.', color: 'from-rose-600 to-pink-600', mic: true, cam: false },
                { name: 'Jo P.', color: 'from-amber-600 to-orange-600', mic: true, cam: true },
                { name: 'Chris W.', color: 'from-indigo-600 to-violet-600', mic: false, cam: false },
              ].map((p, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl relative overflow-hidden flex items-center justify-center bg-black/30 border border-white/5"
                >
                  {p.cam ? (
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-25`} />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {p.name[0]}
                  </div>
                  {/* Name tag */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-xs font-medium text-white/80">
                    {!p.mic && <Mic className="w-2.5 h-2.5 text-red-400" />}
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
            {/* Fake controls bar */}
            <div className="mt-4 flex items-center justify-center gap-3">
              {[Mic, Video, Monitor, MessageSquare, Share2, PenTool].map((Icon, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    i === 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {value}
              </div>
              <div className="text-sm text-white/40 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Everything your team needs
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            All the tools to connect, communicate, and create — in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
            <div
              key={title}
              className={`group p-6 rounded-2xl border ${border} ${bg} hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5.5 h-5.5 text-white" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why section ── */}
      <section id="why" className="relative z-10 px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden grid md:grid-cols-2 gap-0">
          {/* Left text */}
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6 w-fit">
              <Globe className="w-3 h-3" />
              Works anywhere
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight leading-tight">
              Your workspace,<br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                anywhere in the world
              </span>
            </h2>
            <p className="text-white/50 mb-8 leading-relaxed">
              No software to install. Works on Chrome, Firefox, Safari, and Edge.
              Just share a link and your team is instantly connected — from home, the office, or anywhere in between.
            </p>
            <ul className="space-y-3">
              {[
                'Instant room creation with one click',
                'Persistent room history and chat logs',
                'Custom display names & profile photos',
                'Mobile-friendly responsive design',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/65">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Right visual */}
          <div className="relative flex items-center justify-center p-8 bg-gradient-to-br from-teal-900/20 via-violet-900/10 to-emerald-900/20 border-l border-white/5">
            <div className="w-full max-w-xs space-y-3">
              {/* Mock chat messages */}
              {[
                { from: 'Alex', text: 'Just pushed the new design!', avatar: 'A', color: 'from-violet-500 to-purple-600' },
                { from: 'Sam', text: 'Looks great, love the colors 🎨', avatar: 'S', color: 'from-sky-500 to-blue-600' },
                { from: 'You', text: 'Sharing my screen now', avatar: 'Y', color: 'from-teal-500 to-emerald-600' },
              ].map(({ from, text, avatar, color }) => (
                <div key={from} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {avatar}
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-2.5 bg-white/5 border border-white/5">
                    <p className="text-xs font-semibold text-white/80 mb-0.5">{from}</p>
                    <p className="text-sm text-white/60">{text}</p>
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              <div className="flex items-center gap-3 pl-11">
                <div className="flex gap-1 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
              {/* Online users badge */}
              <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 w-fit">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs text-teal-400 font-medium">3 people in this room</span>
                <Users className="w-3.5 h-3.5 text-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 px-6 md:px-12 py-24 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Ready to{' '}
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            collaborate?
          </span>
        </h2>
        <p className="text-white/45 text-lg mb-10">
          Create your free workspace in seconds. No setup required.
        </p>
        <Link
          to="/register"
          className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-lg shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.04] transition-all"
        >
          Create your free room
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-5 text-sm text-white/30">Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:underline">Sign in →</Link>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
              <Video className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-semibold text-white/70">CollabSpace</span>
          </div>
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} CollabSpace. Built for real-time collaboration.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link to="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white/60 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
