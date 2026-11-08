import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import TournamentRegister from "./pages/TournamentRegister";
import LiveTournament from "./pages/LiveTournament";
import Leaderboard from "./pages/Leaderboard";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import PlayerComparison from "./pages/PlayerComparison";
import HallOfFame from "./pages/HallOfFame";
import Videos from "./pages/Videos";
import Dashboard from "./pages/Dashboard";
import Achievements from "./pages/Achievements";
import Rewards from "./pages/Rewards";
import Teams from "./pages/Teams";
import Notifications from "./pages/Notifications";
import Announcements from "./pages/Announcements";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminResults from "./pages/admin/AdminResults";
import AdminPoints from "./pages/admin/AdminPoints";
import AdminAchievements from "./pages/admin/AdminAchievements";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "tournaments", Component: Tournaments },
      { path: "tournaments/:id", Component: TournamentDetail },
      { path: "tournaments/:id/register", Component: TournamentRegister },
      { path: "tournaments/:id/live", Component: LiveTournament },
      { path: "leaderboard", Component: Leaderboard },
      { path: "players", Component: Players },
      { path: "players/compare", Component: PlayerComparison },
      { path: "players/:id", Component: PlayerProfile },
      { path: "hall-of-fame", Component: HallOfFame },
      { path: "videos", Component: Videos },
      { path: "dashboard", Component: Dashboard },
      { path: "achievements", Component: Achievements },
      { path: "rewards", Component: Rewards },
      { path: "teams", Component: Teams },
      { path: "notifications", Component: Notifications },
      { path: "announcements", Component: Announcements },
      { path: "search", Component: Search },
      { path: "login", Component: Login },
      { path: "settings", Component: Settings },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "players", Component: AdminPlayers },
      { path: "tournaments", Component: AdminTournaments },
      { path: "results", Component: AdminResults },
      { path: "points", Component: AdminPoints },
      { path: "achievements", Component: AdminAchievements },
      { path: "announcements", Component: AdminAnnouncements },
    ],
  },
]);
