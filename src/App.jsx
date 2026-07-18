import { useState } from "react";
import { BetrayalPage } from "./views/BetrayalPage";
import { LeaderboardPage } from "./views/LeaderboardPage";

export default function App() {
  const [activeView, setActiveView] = useState("leaderboard");

  const showView = (nextView) => {
    setActiveView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      {activeView === "betrayal" ? <BetrayalPage onBack={() => showView("leaderboard")} /> : <LeaderboardPage onOpenBetrayal={() => showView("betrayal")} />}
    </div>
  );
}

