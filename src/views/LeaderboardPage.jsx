import { useMemo, useState } from "react";
import { GAMES_SUMMARY_PAGE_SIZE } from "../config";
import { ALL_GAMES } from "../constants";
import { ErrorState, LoadingState } from "../components/StatusCards";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { StatsView } from "../components/StatsView";
import { ViewToggle } from "../components/ViewToggle";
import { AdminPanel } from "../components/admin/AdminPanel";
import { computePerGameStats, computePlayerStats, getGamePlayerEntries, getGameSummaryEntries, getRankedLeaderboard } from "../data/stats";
import { useTabletopData } from "../hooks/useTabletopData";
import { normalizeAppLink } from "../utils/links";

export function LeaderboardPage({ onOpenBetrayal }) {
  const [view, setView] = useState("leaderboard");
  const [selectedGame, setSelectedGame] = useState(ALL_GAMES);
  const [summaryLimit, setSummaryLimit] = useState(GAMES_SUMMARY_PAGE_SIZE);
  const [adminMode, setAdminMode] = useState("public");
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
  const isPrivateView = adminMode !== "public";
  const firstPlacePlayerName = computed.leaderboard[0]?.name ?? "";

  return (
    <main>
      {!state.loading && !state.error && isPrivateView ? (
        <AdminPanel
          games={state.games}
          players={state.players}
          mode={adminMode}
          defaultPrizePlayerName={firstPlacePlayerName}
          onModeChange={setAdminMode}
          onSaved={state.refresh}
        />
      ) : null}

      {!isPrivateView ? (
        <>
          {!state.loading && !state.error ? (
            <div className="top-admin-actions">
              <AdminPanel
                games={state.games}
                players={state.players}
                mode={adminMode}
                defaultPrizePlayerName={firstPlacePlayerName}
                onModeChange={setAdminMode}
                onSaved={state.refresh}
              />
            </div>
          ) : null}

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

    </main>
  );
}
