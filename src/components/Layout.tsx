import { Outlet, useLocation } from "react-router";
import Nav from "./Nav";
import Footer from "./Footer";
import { useEffect } from "react";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className={`pt-16 page-enter ${isAdmin ? "" : ""}`}>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
