import { useMemo, useState } from "react";
import { addGame, addMatch, addPrize } from "../../data/adminApi";
import { useAuth } from "../../hooks/useAuth";
import { AddGameForm } from "./AddGameForm";
import { AddMatchForm } from "./AddMatchForm";
import { AdminMenu } from "./AdminMenu";
import { ADD_GAME, ADD_MATCH, ADD_PRIZE, ADMIN_MENU, createGameForm, createMatchForm, createPrizeForm } from "./adminConstants";
import { LoginForm } from "./LoginForm";
import { PrizeCashOutForm } from "./PrizeCashOutForm";

export function AdminPanel({ games, players, mode = "public", defaultPrizePlayerName = "", onModeChange, onSaved }) {
  const auth = useAuth();
  const [adminSection, setAdminSection] = useState(ADMIN_MENU);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [matchForm, setMatchForm] = useState(() => createMatchForm());
  const [prizeForm, setPrizeForm] = useState(() => createPrizeForm(defaultPrizePlayerName));
  const [gameForm, setGameForm] = useState(() => createGameForm());
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);

  const gameOptions = useMemo(() => Object.keys(games).sort((a, b) => a.localeCompare(b)), [games]);
  const playerOptions = useMemo(
    () => Object.values(players).map((player) => player.name).sort((a, b) => a.localeCompare(b)),
    [players]
  );

  const isAdminView = mode === "login" || mode === "admin";
  const panelTitle = getPanelTitle(auth.user, adminSection);

  async function handleLogin(event) {
    event.preventDefault();
    await runAdminAction(async () => {
      await auth.login(loginForm.email, loginForm.password);
      setLoginForm({ email: "", password: "" });
      setAdminSection(ADMIN_MENU);
      onModeChange?.("public");
    }, "Could not log in.");
  }

  async function handleLogout() {
    await runAdminAction(async () => {
      await auth.logout();
      setAdminSection(ADMIN_MENU);
      onModeChange?.("public");
    }, "Could not log out.");
  }

  async function handleAddMatch(event) {
    event.preventDefault();
    await runAdminAction(async () => {
      await addMatch(matchForm);
      setMatchForm(createMatchForm());
      await onSaved();
      setStatus({ type: "success", message: "Game result logged." });
      setAdminSection(ADMIN_MENU);
    }, "Could not log the game result.");
  }

  async function handleAddPrize(event) {
    event.preventDefault();
    await runAdminAction(async () => {
      await addPrize(prizeForm);
      setPrizeForm(createPrizeForm(defaultPrizePlayerName));
      await onSaved();
      setStatus({ type: "success", message: "Prize cash-out recorded." });
      setAdminSection(ADMIN_MENU);
    }, "Could not record the prize.");
  }

  async function handleAddGame(event) {
    event.preventDefault();
    await runAdminAction(async () => {
      await addGame(gameForm);
      setGameForm(createGameForm());
      await onSaved();
      setStatus({ type: "success", message: "Game added." });
      setAdminSection(ADMIN_MENU);
    }, "Could not add the game.");
  }

  async function runAdminAction(action, fallbackMessage) {
    setBusy(true);
    setStatus({ type: "", message: "" });

    try {
      await action();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : fallbackMessage });
    } finally {
      setBusy(false);
    }
  }

  function enterPrivateView() {
    setStatus({ type: "", message: "" });
    setAdminSection(ADMIN_MENU);
    onModeChange?.(auth.user ? "admin" : "login");
  }

  function returnToPublicView() {
    setStatus({ type: "", message: "" });
    setAdminSection(ADMIN_MENU);
    onModeChange?.("public");
  }

  function showSection(section) {
    setStatus({ type: "", message: "" });
    if (section === ADD_PRIZE) {
      setPrizeForm((current) => ({
        ...current,
        playerName: current.playerName || defaultPrizePlayerName
      }));
    }
    setAdminSection(section);
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
        <PublicAdminActions isLoggedIn={Boolean(auth.user)} busy={busy} onEnter={enterPrivateView} onLogout={handleLogout} />
      ) : (
        <section className={`panel admin-panel admin-view-panel admin-section-${auth.user ? adminSection : "login"} ${auth.user ? "" : "login-view-panel"}`}>
          <div className="panel-header">
            <div>
              {auth.user && adminSection !== ADMIN_MENU ? (
                <button className="secondary-button admin-back-button" type="button" onClick={() => showSection(ADMIN_MENU)}>
                  Back
                </button>
              ) : null}
              {panelTitle ? <h2>{panelTitle}</h2> : null}
            </div>
            <div className="admin-view-actions">
              <button className="admin-close-button" type="button" onClick={returnToPublicView} aria-label="Close">
                X
              </button>
            </div>
          </div>

          {status.message ? <p className={`admin-status ${status.type}`}>{status.message}</p> : null}
          {auth.loading ? <p className="admin-help">Checking login status...</p> : null}

          {!auth.loading && !auth.user ? <LoginForm form={loginForm} busy={busy} onChange={setLoginForm} onSubmit={handleLogin} /> : null}

          {!auth.loading && auth.user && adminSection === ADMIN_MENU ? <AdminMenu onSelect={showSection} /> : null}

          {!auth.loading && auth.user && adminSection === ADD_MATCH ? (
            <AddMatchForm
              form={matchForm}
              busy={busy}
              gameOptions={gameOptions}
              playerOptions={playerOptions}
              onChange={setMatchForm}
              onSubmit={handleAddMatch}
              onTogglePlayer={toggleMatchPlayer}
              onToggleWinner={toggleWinner}
            />
          ) : null}

          {!auth.loading && auth.user && adminSection === ADD_PRIZE ? (
            <PrizeCashOutForm form={prizeForm} busy={busy} playerOptions={playerOptions} onChange={setPrizeForm} onSubmit={handleAddPrize} />
          ) : null}

          {!auth.loading && auth.user && adminSection === ADD_GAME ? (
            <AddGameForm form={gameForm} busy={busy} onChange={setGameForm} onSubmit={handleAddGame} />
          ) : null}
        </section>
      )}
    </div>
  );
}

function PublicAdminActions({ isLoggedIn, busy, onEnter, onLogout }) {
  return (
    <div className="admin-inline-actions">
      <button className="back-button toolbar-button" type="button" onClick={onEnter}>
        {isLoggedIn ? "Manage" : "Log in"}
      </button>
      {isLoggedIn ? (
        <button className="secondary-button admin-logout" type="button" onClick={onLogout} disabled={busy}>
          Log out
        </button>
      ) : null}
    </div>
  );
}

function getPanelTitle(user, section) {
  if (!user) return "Log in";
  if (section === ADD_MATCH) return "Add game result";
  if (section === ADD_PRIZE) return "Prize Cash Out";
  if (section === ADD_GAME) return "Add new game";
  return "";
}

function toggleName(names, name) {
  return names.includes(name) ? names.filter((current) => current !== name) : [...names, name];
}
