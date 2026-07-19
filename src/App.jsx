import { useEffect, useState } from "react";
import { AuthCallbackHandler } from "./components/AuthCallbackHandler";
import { BetrayalPage } from "./views/BetrayalPage";
import { LeaderboardPage } from "./views/LeaderboardPage";

export default function App() {
  const [activeView, setActiveView] = useState("leaderboard");
  const [crtMode, setCrtMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("crt-mode", crtMode);
    return () => document.body.classList.remove("crt-mode");
  }, [crtMode]);

  const showView = (nextView) => {
    setActiveView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AuthCallbackHandler>
      <div className="app">
        <button className="crt-toggle" type="button" onClick={() => setCrtMode((enabled) => !enabled)} aria-pressed={crtMode}>
          CRT
        </button>
        {activeView === "betrayal" ? <BetrayalPage onBack={() => showView("leaderboard")} /> : <LeaderboardPage onOpenBetrayal={() => showView("betrayal")} />}
      </div>
    </AuthCallbackHandler>
  );
}
