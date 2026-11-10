import { Link } from "react-router";

const socialLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@V4YT_Official",
    color: "hover:border-red-500/50 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" /></svg>,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/v4yt_official?igsh=ejdlMXdob3UwamE0",
    color: "hover:border-pink-500/50 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" /></svg>,
  },
  {
    label: "WhatsApp",
    href: "https://whatsapp.com/channel/0029VbBCQZ1KbYMFqLp4pP2m",
    color: "hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l.9-4.7a8.5 8.5 0 1 1 16.6-3.6Z" /><path d="M8.5 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4-.1.6.6 1.1 1.4 1.9 2.5 2.5.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .4-.2 1.1-.7 1.4-.5.4-1.1.6-1.8.5-1-.2-2.2-.7-3.6-1.9-1.7-1.4-2.8-3.2-3.1-4.3-.3-1 .1-1.6.7-1.9Z" /></svg>,
  },
  {
    label: "Kick",
    href: "https://kick.com/v4yt-official",
    color: "hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M4 3h8v5h3V5h5v6h-4v2h4v6h-5v-3h-3v5H4V3Zm8 5-3 4 3 4h4l-3-4 3-4h-4Z" /></svg>,
  },
];

const footerLinks = {
  navigate: [["Tournaments", "/tournaments"], ["Leaderboard", "/leaderboard"], ["Players", "/players"], ["Hall of Fame", "/hall-of-fame"]],
  community: [["Announcements", "/announcements"], ["Achievements", "/achievements"], ["Dashboard", "/dashboard"]],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border overflow-hidden pb-20 lg:pb-0" style={{ background: "linear-gradient(to bottom, var(--background), rgba(10,12,22,0.98))" }}>
      <div className="absolute top-0 left-0 right-0 laser-line"></div>
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", transform: "translate(30%, 30%)" }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm" style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>V4</div>
              <div><span className="text-white font-black text-lg tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT</span><span className="text-violet-400 ml-1.5 text-xs font-bold tracking-widest">OFFICIAL</span></div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Play. Compete. Earn. Dominate.</p>
            <div className="flex items-center gap-2">
              {socialLinks.map(social => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`V4YT Official on ${social.label}`} title={social.label} className={`w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground transition-all ${social.color}`}>{social.icon}</a>)}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NAVIGATE</h4>
            <div className="space-y-2.5">{footerLinks.navigate.map(([label, path]) => <Link key={path} to={path} className="block text-sm text-muted-foreground hover:text-violet-400 transition-colors cyber-line pb-px">{label}</Link>)}</div>
          </div>

          <div>
            <h4 className="text-xs font-black tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>COMMUNITY</h4>
            <div className="space-y-2.5">{footerLinks.community.map(([label, path]) => <Link key={path} to={path} className="block text-sm text-muted-foreground hover:text-cyan-400 transition-colors cyber-line pb-px">{label}</Link>)}</div>
          </div>
        </div>

        <div className="mt-12 pt-6 relative">
          <div className="laser-line mb-6"></div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 V4YT OFFICIAL. All rights reserved.</p>
            <p className="text-xs font-mono-data text-muted-foreground">V4YT SEASON 01 · 2,481 PLAYERS · 18 TOURNAMENTS</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
