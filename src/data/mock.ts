export const players = [
  { id: 1, username: "V4YT_KING", level: 42, points: 12450, xp: 9200, rank: 1, wins: 8, tier: "legend", avatar: "VK", winRate: 72, tournaments: 14, streak: 5 },
  { id: 2, username: "DARK_WARRIOR", level: 38, points: 11980, xp: 8400, rank: 2, wins: 7, tier: "master", avatar: "DW", winRate: 65, tournaments: 13, streak: 3 },
  { id: 3, username: "SHADOW_X", level: 35, points: 10750, xp: 7800, rank: 3, wins: 6, tier: "master", avatar: "SX", winRate: 61, tournaments: 12, streak: 2 },
  { id: 4, username: "GAMER_777", level: 31, points: 9830, xp: 6900, rank: 4, wins: 5, tier: "diamond", avatar: "G7", winRate: 58, tournaments: 11, streak: 1 },
  { id: 5, username: "V4YT_RIDER", level: 29, points: 9120, xp: 6200, rank: 5, wins: 4, tier: "diamond", avatar: "VR", winRate: 54, tournaments: 10, streak: 0 },
  { id: 6, username: "BLAZE_STORM", level: 27, points: 8450, xp: 5800, rank: 6, wins: 4, tier: "platinum", avatar: "BS", winRate: 51, tournaments: 9, streak: 2 },
  { id: 7, username: "NIGHT_HAWK", level: 25, points: 7890, xp: 5100, rank: 7, wins: 3, tier: "platinum", avatar: "NH", winRate: 48, tournaments: 9, streak: 0 },
  { id: 8, username: "APEX_FORCE", level: 23, points: 7200, xp: 4500, rank: 8, wins: 3, tier: "gold", avatar: "AF", winRate: 45, tournaments: 8, streak: 1 },
  { id: 9, username: "CYBER_WOLF", level: 21, points: 6540, xp: 3900, rank: 9, wins: 2, tier: "gold", avatar: "CW", winRate: 42, tournaments: 7, streak: 0 },
  { id: 10, username: "INFERNO_ACE", level: 19, points: 5980, xp: 3200, rank: 10, wins: 2, tier: "silver", avatar: "IA", winRate: 38, tournaments: 7, streak: 3 },
];

export const tournaments = [
  {
    id: 1,
    name: "V4YT Championship #13",
    game: "Free Fire",
    date: "Aug 28, 2026",
    time: "8:00 PM IST",
    players: 78,
    maxPlayers: 100,
    prize: "₹5,000 + Trophy",
    status: "open",
    countdown: { d: 2, h: 14, m: 38 },
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop&auto=format",
    description: "The flagship V4YT tournament returns for Season 01. Compete against the best players in the community for glory and prizes.",
    rules: ["Solo mode only", "No hacks or cheats", "Must have V4YT Player ID", "Admin decision is final", "Players must join lobby 15 minutes before start"],
    schedule: [
      { round: "Round 1", time: "8:00 PM", type: "Battle Royale" },
      { round: "Round 2", time: "9:00 PM", type: "Battle Royale" },
      { round: "Finals", time: "10:00 PM", type: "Grand Final" },
    ],
  },
  {
    id: 2,
    name: "V4YT Championship #12",
    game: "Free Fire",
    date: "Aug 15, 2026",
    time: "8:00 PM IST",
    players: 100,
    maxPlayers: 100,
    prize: "₹5,000 + Trophy",
    status: "completed",
    countdown: { d: 0, h: 0, m: 0 },
    winner: "V4YT_KING",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=400&fit=crop&auto=format",
    description: "The twelfth installment of the V4YT Championship. Intense battles across three rounds with 100 players.",
    rules: [],
    schedule: [],
    results: { first: "V4YT_KING", second: "DARK_WARRIOR", third: "SHADOW_X" },
  },
  {
    id: 3,
    name: "V4YT Clash Royale Cup",
    game: "Free Fire",
    date: "Sep 5, 2026",
    time: "7:00 PM IST",
    players: 24,
    maxPlayers: 48,
    prize: "₹2,000 + Badge",
    status: "soon",
    countdown: { d: 13, h: 6, m: 22 },
    image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=400&fit=crop&auto=format",
    description: "A fast-paced solo clash tournament with 48 players battling for the Clash Royale Cup.",
    rules: [],
    schedule: [],
  },
  {
    id: 4,
    name: "V4YT Weekly Showdown",
    game: "Free Fire",
    date: "Aug 23, 2026",
    time: "9:00 PM IST",
    players: 40,
    maxPlayers: 40,
    prize: "V4YT Points",
    status: "live",
    countdown: { d: 0, h: 0, m: 0 },
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=400&fit=crop&auto=format",
    description: "Weekly community showdown — fast format, pure competition.",
    rules: [],
    schedule: [],
  },
];

export const videos = [
  { id: 1, title: "V4YT Championship #12 — Grand Final Highlights", views: "124K", date: "2 days ago", game: "Free Fire", duration: "18:42", type: "highlight", thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&auto=format" },
  { id: 2, title: "How I Won 3 V4YT Tournaments in a Row", views: "89K", date: "5 days ago", game: "Free Fire", duration: "22:15", type: "video", thumb: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=640&h=360&fit=crop&auto=format" },
  { id: 3, title: "V4YT LIVE — Championship #13 Registration Day", views: "34K", date: "1 day ago", game: "Free Fire", duration: "LIVE", type: "live", thumb: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=640&h=360&fit=crop&auto=format" },
  { id: 4, title: "Top 10 Plays — Season 01", views: "67K", date: "1 week ago", game: "Free Fire", duration: "11:30", type: "highlight", thumb: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=640&h=360&fit=crop&auto=format" },
  { id: 5, title: "V4YT Short: Insane 1v4 Clutch #shorts", views: "210K", date: "3 days ago", game: "Free Fire", duration: "0:58", type: "short", thumb: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop&auto=format" },
  { id: 6, title: "Meet the V4YT Community Champions", views: "45K", date: "2 weeks ago", game: "Free Fire", duration: "14:22", type: "video", thumb: "https://images.unsplash.com/photo-1549476464-37392f717541?w=640&h=360&fit=crop&auto=format" },
];

export const achievements = [
  { id: 1, icon: "🏆", name: "Champion", desc: "Win your first tournament", unlocked: true, category: "Tournament" },
  { id: 2, icon: "🔥", name: "Unstoppable", desc: "Win 3 tournaments in a row", unlocked: true, category: "Performance" },
  { id: 3, icon: "⚡", name: "Veteran", desc: "Participate in 10 tournaments", unlocked: false, progress: 7, max: 10, category: "Milestones" },
  { id: 4, icon: "🎯", name: "Sharpshooter", desc: "Achieve 70%+ win rate", unlocked: false, progress: 65, max: 70, category: "Performance" },
  { id: 5, icon: "👑", name: "V4YT Legend", desc: "Reach Legend rank", unlocked: false, progress: 4, max: 7, category: "Milestones" },
  { id: 6, icon: "🥇", name: "First Win", desc: "Win your first match", unlocked: true, category: "Tournament" },
  { id: 7, icon: "🌟", name: "Top 10", desc: "Place in top 10 globally", unlocked: true, category: "Community" },
  { id: 8, icon: "💎", name: "Diamond Climber", desc: "Reach Diamond rank", unlocked: true, category: "Milestones" },
  { id: 9, icon: "🎮", name: "100 Matches", desc: "Play 100 total matches", unlocked: false, progress: 68, max: 100, category: "Milestones" },
  { id: 10, icon: "🚀", name: "Season Hero", desc: "Finish Season 01 in Top 5", unlocked: false, progress: 3, max: 5, category: "Special Events" },
];

export const hallOfFame = [
  { year: "2026", tournament: "V4YT Championship #12", champion: "V4YT_KING", runnerUp: "DARK_WARRIOR", third: "SHADOW_X", date: "Aug 15, 2026", avatar: "VK" },
  { year: "2026", tournament: "V4YT Championship #11", champion: "DARK_WARRIOR", runnerUp: "V4YT_KING", third: "GAMER_777", date: "Jul 20, 2026", avatar: "DW" },
  { year: "2026", tournament: "V4YT Championship #10", champion: "SHADOW_X", runnerUp: "BLAZE_STORM", third: "V4YT_RIDER", date: "Jun 28, 2026", avatar: "SX" },
  { year: "2026", tournament: "V4YT Championship #9", champion: "GAMER_777", runnerUp: "NIGHT_HAWK", third: "DARK_WARRIOR", date: "Jun 5, 2026", avatar: "G7" },
];

export const pointHistory = [
  { id: 1, action: "Tournament Winner", event: "V4YT Championship #12", points: 500, date: "Aug 15", type: "gain" },
  { id: 2, action: "Match Win", event: "Round 3", points: 100, date: "Aug 15", type: "gain" },
  { id: 3, action: "Match Win", event: "Round 2", points: 100, date: "Aug 15", type: "gain" },
  { id: 4, action: "Tournament Participation", event: "V4YT Championship #12", points: 50, date: "Aug 15", type: "gain" },
  { id: 5, action: "Daily Login Streak", event: "7-day streak", points: 35, date: "Aug 14", type: "gain" },
  { id: 6, action: "Admin Adjustment", event: "Score correction", points: -100, date: "Aug 10", type: "loss" },
  { id: 7, action: "Tournament Participation", event: "V4YT Championship #11", points: 50, date: "Jul 20", type: "gain" },
  { id: 8, action: "Runner-up", event: "V4YT Championship #11", points: 300, date: "Jul 20", type: "gain" },
];

export const notifications = [
  { id: 1, icon: "🏆", text: "You won V4YT Championship #12!", sub: "+500 V4YT Points earned", time: "2 days ago", read: false },
  { id: 2, icon: "🔥", text: "Achievement unlocked: Unstoppable", sub: "Win 3 tournaments in a row", time: "2 days ago", read: false },
  { id: 3, icon: "📢", text: "Championship #13 registration is now open", sub: "78/100 spots filled — register fast!", time: "1 day ago", read: false },
  { id: 4, icon: "⬆️", text: "You moved up to Rank #1 globally", sub: "V4YT Legend tier unlocked", time: "2 days ago", read: true },
  { id: 5, icon: "🎮", text: "V4YT Weekly Showdown starts in 1 hour", sub: "You are registered — prepare for battle", time: "3 hours ago", read: true },
  { id: 6, icon: "👑", text: "New Season 01 has begun", sub: "Aug – Oct 2026. Compete for the Season Championship!", time: "1 week ago", read: true },
];

export const rewards = [
  { id: 1, name: "V4YT Special Badge", cost: 500, desc: "Exclusive profile badge for loyal V4YT players", icon: "🎖️", available: true },
  { id: 2, name: "Golden Profile Frame", cost: 1000, desc: "Rare golden frame that surrounds your avatar", icon: "🖼️", available: true },
  { id: 3, name: "Priority Tournament Access", cost: 2500, desc: "Skip the queue and secure your spot first", icon: "⚡", available: false },
  { id: 4, name: "V4YT Legend Badge", cost: 5000, desc: "The most exclusive badge on the platform", icon: "👑", available: false },
  { id: 5, name: "Custom Username Color", cost: 750, desc: "Stand out with a unique colored username", icon: "🎨", available: true },
  { id: 6, name: "Animated Avatar Border", cost: 1500, desc: "Animated neon border effect on your profile", icon: "✨", available: false },
];

export const teams = [
  { id: 1, name: "V4YT ELITES", logo: "VE", captain: "V4YT_KING", members: ["V4YT_KING", "DARK_WARRIOR", "SHADOW_X"], wins: 12, points: 4200, rank: 1 },
  { id: 2, name: "DARK SQUAD", logo: "DS", captain: "GAMER_777", members: ["GAMER_777", "NIGHT_HAWK", "BLAZE_STORM"], wins: 9, points: 3600, rank: 2 },
  { id: 3, name: "APEX UNIT", logo: "AU", captain: "APEX_FORCE", members: ["APEX_FORCE", "CYBER_WOLF", "V4YT_RIDER"], wins: 7, points: 2900, rank: 3 },
];

export const announcements = [
  { id: 1, title: "V4YT Championship #13 — Registration Now Open!", category: "Tournament", date: "Aug 22, 2026", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop&auto=format", desc: "Registration for Championship #13 is officially open. 78 out of 100 spots have already been claimed. Secure your place now before it fills up." },
  { id: 2, title: "V4YT_KING Is Your Championship #12 Champion!", category: "Winner", date: "Aug 15, 2026", image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=400&fit=crop&auto=format", desc: "After three fierce rounds, V4YT_KING has claimed the Championship #12 crown. A dominant performance from start to finish." },
  { id: 3, title: "Season 01 Has Officially Launched", category: "Community", date: "Aug 1, 2026", image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=400&fit=crop&auto=format", desc: "V4YT Season 01 runs from August to October 2026. Compete across all tournaments this season to earn your place on the Season Leaderboard." },
  { id: 4, title: "New Reward: Golden Profile Frame Now Available", category: "Update", date: "Jul 28, 2026", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=400&fit=crop&auto=format", desc: "Spend 1,000 V4YT Points to unlock the golden profile frame. Exclusive to dedicated community members." },
];

export const ranks = [
  { name: "BRONZE", color: "#cd7f32", min: 0, max: 999, icon: "🥉" },
  { name: "SILVER", color: "#c0c0c0", min: 1000, max: 2499, icon: "🥈" },
  { name: "GOLD", color: "#ffd700", min: 2500, max: 4999, icon: "🥇" },
  { name: "PLATINUM", color: "#00b4d8", min: 5000, max: 7999, icon: "💠" },
  { name: "DIAMOND", color: "#b9f2ff", min: 8000, max: 10999, icon: "💎" },
  { name: "MASTER", color: "#c084fc", min: 11000, max: 12999, icon: "🔮" },
  { name: "V4YT LEGEND", color: "url(#legend)", min: 13000, max: Infinity, icon: "👑" },
];
