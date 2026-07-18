import { useMemo, useState } from "react";
import { GAMES_SUMMARY_PAGE_SIZE } from "../config";
import { ALL_GAMES } from "../constants";
import { ErrorState, LoadingState } from "../components/StatusCards";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { StatsView } from "../components/StatsView";
import { ViewToggle } from "../components/ViewToggle";
import { AdminPanel } from "../components/AdminPanel";
import { computePerGameStats, computePlayerStats, getGamePlayerEntries, getGameSummaryEntries, getRankedLeaderboard } from "../data/stats";
import { useTabletopData } from "../hooks/useTabletopData";
import { normalizeAppLink } from "../utils/links";

export function LeaderboardPage({ onOpenBetrayal }) {
  const [view, setView] = useState("leaderboard");
  const [selectedGame, setSelectedGame] = useState(ALL_GAMES);
  const [summaryLimit, setSummaryLimit] = useState(GAMES_SUMMARY_PAGE_SIZE);
  const [isPrivateView, setIsPrivateView] = useState(false);
  const state = useTabletopData();

  const computed = useMemo(() => {
    const playerStats = computePlayerStats(state.matches, state.prizes);
    const perGame = computePerGameStats(state.matches);

    return {
      leaderboard: getRankedLeaderboard(playerStats),
      gameSummary: getGameSummaryEntries(perGame.summary),
      perGamePlayers: perGame.players,
      gameOptions: Object.keys(perGame.players).sort((a, b) => a.localeCompare(b))
    };
  }, [state.matches, state.prizes]);

  const selectedGameLink = selectedGame === ALL_GAMES ? "" : normalizeAppLink(state.games[selectedGame]?.page);
  const selectedGamePlayers = getGamePlayerEntries(selectedGame, computed.perGamePlayers);

  return (
    <main>
      {!state.loading && !state.error ? (
        <AdminPanel games={state.games} players={state.players} onModeChange={setIsPrivateView} onSaved={state.refresh} />
      ) : null}

      {!isPrivateView ? (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Games Night Leaderboard</span>
              <h1>Tabletop and Bottoms</h1>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Scoreboard</span>
                <h2>Games Night</h2>
              </div>
              <ViewToggle view={view} onChange={setView} />
            </div>

            {state.error ? <ErrorState message={state.error} /> : null}
            {state.loading ? <LoadingState label="Loading game records" /> : null}

            {!state.loading && !state.error && view === "leaderboard" ? (
              <LeaderboardTable entries={computed.leaderboard} playerMeta={state.players} />
            ) : null}

            {!state.loading && !state.error && view === "stats" ? (
              <StatsView
                games={computed.gameOptions}
                gameSummary={computed.gameSummary}
                selectedGame={selectedGame}
                selectedGamePlayers={selectedGamePlayers}
                selectedGameLink={selectedGameLink}
                summaryLimit={summaryLimit}
                onSelectGame={setSelectedGame}
                onShowMore={() => setSummaryLimit((limit) => limit + GAMES_SUMMARY_PAGE_SIZE)}
                onOpenBetrayal={onOpenBetrayal}
                playerMeta={state.players}
              />
            ) : null}
          </section>
        </>
      ) : null}

      <footer className="site-footer">
        {state.lastUpdated ? <span>Loaded {state.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
        <span>Data served from Turso.</span>
      </footer>
    </main>
  );
}
