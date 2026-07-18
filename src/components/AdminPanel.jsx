import { useEffect, useMemo, useState } from "react";
import { addMatch, addPrize } from "../data/adminApi";
import { useAuth } from "../hooks/useAuth";

const emptyMatchForm = {
  playedOn: todayIsoDate(),
  gameName: "",
  playerNames: [],
  winnerNames: [],
  notes: ""
};

const emptyPrizeForm = {
  awardedOn: todayIsoDate(),
  playerName: "",
  notes: ""
};

export function AdminPanel({ games, players, onModeChange, onSaved }) {
  const auth = useAuth();
  const [mode, setMode] = useState("public");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const [prizeForm, setPrizeForm] = useState(emptyPrizeForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);

  const gameOptions = useMemo(() => Object.keys(games).sort((a, b) => a.localeCompare(b)), [games]);
  const playerOptions = useMemo(
    () => Object.values(players).map((player) => player.name).sort((a, b) => a.localeCompare(b)),
    [players]
  );

  const isAdminView = mode === "login" || mode === "admin";


  useEffect(() => {
    onModeChange?.(isAdminView);
  }, [isAdminView, onModeChange]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });

    try {
      await auth.login(loginForm.email, loginForm.password);
      setLoginForm({ email: "", password: "" });
      setMode("admin");
      setStatus({ type: "success", message: "Logged in." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Could not log in." });
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setStatus({ type: "", message: "" });

    try {
      await auth.logout();
      setMode("public");
      setStatus({ type: "success", message: "Logged out." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Could not log out." });
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMatch(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });

    try {
      await addMatch(matchForm);
      setMatchForm({ ...emptyMatchForm, playedOn: todayIsoDate() });
      await onSaved();
      setStatus({ type: "success", message: "Game result logged." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Could not log the game result." });
    } finally {
      setBusy(false);
    }
  }

  async function handleAddPrize(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });

    try {
      await addPrize(prizeForm);
      setPrizeForm({ ...emptyPrizeForm, awardedOn: todayIsoDate() });
      await onSaved();
      setStatus({ type: "success", message: "Prize cash-out recorded." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Could not record the prize." });
    } finally {
      setBusy(false);
    }
  }

  function enterPrivateView() {
    setStatus({ type: "", message: "" });
    const nextMode = auth.user ? "admin" : "login";
    setMode(nextMode);
    onModeChange?.(true);
  }

  function returnToPublicView() {
    setStatus({ type: "", message: "" });
    setMode("public");
    onModeChange?.(false);
  }

  function toggleMatchPlayer(name) {
    setMatchForm((current) => {
      const nextPlayers = toggleName(current.playerNames, name);
      return {
        ...current,
        playerNames: nextPlayers,
        winnerNames: current.winnerNames.filter((winner) => nextPlayers.includes(winner))
      };
    });
  }

  function toggleWinner(name) {
    setMatchForm((current) => ({
      ...current,
      winnerNames: toggleName(current.winnerNames, name)
    }));
  }

  return (
    <div className={isAdminView ? "admin-shell admin-shell-view" : "admin-shell"}>
      {!isAdminView ? (
        <div className="admin-toolbar">
          {auth.user ? <span className="admin-user">{auth.user.email}</span> : null}
          <button className="back-button" type="button" onClick={enterPrivateView}>
            {auth.user ? "Log result" : "Log in"}
          </button>
          {auth.user ? (
            <button className="text-button admin-logout" type="button" onClick={handleLogout} disabled={busy}>
              Log out
            </button>
          ) : null}
        </div>
      ) : (
        <section className={`panel admin-panel admin-view-panel ${auth.user ? "" : "login-view-panel"}`}> 
          <div className="panel-header">
            <div>
              <h2>{auth.user ? "Log results" : "Log in"}</h2>
            </div>
            <div className="admin-view-actions">
              {auth.user ? <span className="admin-user">{auth.user.email}</span> : null}
              {auth.user ? (
                <button className="text-button admin-logout" type="button" onClick={handleLogout} disabled={busy}>
                  Log out
                </button>
              ) : null}
              <button className="admin-close-button" type="button" onClick={returnToPublicView} aria-label="Close">
                X
              </button>
            </div>
          </div>

          {status.message ? <p className={`admin-status ${status.type}`}>{status.message}</p> : null}
          {auth.loading ? <p className="admin-help">Checking login status...</p> : null}

          {!auth.loading && !auth.user ? (
            <form className="admin-form compact-admin-form" onSubmit={handleLogin}>
              <label>
                Email
                <input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} required />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
              </label>
              <button className="back-button" type="submit" disabled={busy}>
                Log in
              </button>
            </form>
          ) : null}

          {!auth.loading && auth.user ? (
            <div className="admin-grid">
              <form className="admin-form" onSubmit={handleAddMatch}>
                <h3>Add game result</h3>
                <label>
                  Date
                  <input type="date" value={matchForm.playedOn} onChange={(event) => setMatchForm({ ...matchForm, playedOn: event.target.value })} required />
                </label>
                <label>
                  Game
                  <select value={matchForm.gameName} onChange={(event) => setMatchForm({ ...matchForm, gameName: event.target.value })} required>
                    <option value="">Choose game</option>
                    {gameOptions.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </label>
                <CheckboxGroup label="Players" options={playerOptions} selected={matchForm.playerNames} onToggle={toggleMatchPlayer} />
                <CheckboxGroup label="Winners" options={matchForm.playerNames} selected={matchForm.winnerNames} onToggle={toggleWinner} />
                <label>
                  Notes
                  <textarea value={matchForm.notes} onChange={(event) => setMatchForm({ ...matchForm, notes: event.target.value })} rows="3" />
                </label>
                <button className="back-button" type="submit" disabled={busy}>
                  Save result
                </button>
              </form>

              <form className="admin-form" onSubmit={handleAddPrize}>
                <h3>Record prize</h3>
                <label>
                  Date
                  <input type="date" value={prizeForm.awardedOn} onChange={(event) => setPrizeForm({ ...prizeForm, awardedOn: event.target.value })} required />
                </label>
                <label>
                  Player
                  <select value={prizeForm.playerName} onChange={(event) => setPrizeForm({ ...prizeForm, playerName: event.target.value })} required>
                    <option value="">Choose player</option>
                    {playerOptions.map((player) => (
                      <option key={player} value={player}>
                        {player}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea value={prizeForm.notes} onChange={(event) => setPrizeForm({ ...prizeForm, notes: event.target.value })} rows="3" />
                </label>
                <button className="back-button" type="submit" disabled={busy}>
                  Save cash-out
                </button>
              </form>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <fieldset className="checkbox-group">
      <legend>{label}</legend>
      {options.length ? (
        <div className="checkbox-list">
          {options.map((option) => (
            <label key={option} className="checkbox-pill">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="admin-help">Choose players first.</p>
      )}
    </fieldset>
  );
}

function toggleName(names, name) {
  return names.includes(name) ? names.filter((current) => current !== name) : [...names, name];
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}




