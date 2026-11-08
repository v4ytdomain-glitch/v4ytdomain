import { Link, useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      <div className="text-center relative">
        <div className="text-9xl font-black text-border mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>404</div>
        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PAGE NOT FOUND</h1>
        <p className="text-muted-foreground mb-8">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">← GO BACK</button>
          <Link to="/" className="btn-primary">GO HOME</Link>
          <Link to="/leaderboard" className="btn-secondary">VIEW LEADERBOARD</Link>
        </div>
      </div>
    </div>
  );
}
