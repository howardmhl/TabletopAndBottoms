import { useState } from "react";
import { AuthCallbackHandler } from "./components/AuthCallbackHandler";
import { BetrayalPage } from "./views/BetrayalPage";
import { LeaderboardPage } from "./views/LeaderboardPage";

export default function App() {
  const [activeView, setActiveView] = useState("leaderboard");

  const showView = (nextView) => {
    setActiveView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AuthCallbackHandler>
      <div className="app">
        {activeView === "betrayal" ? <BetrayalPage onBack={() => showView("leaderboard")} /> : <LeaderboardPage onOpenBetrayal={() => showView("betrayal")} />}
      </div>
    </AuthCallbackHandler>
  );
}
