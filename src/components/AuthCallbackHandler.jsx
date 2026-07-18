import { acceptInvite, handleAuthCallback, updateUser } from "@netlify/identity";
import { useEffect, useState } from "react";

const AUTH_HASH_PATTERN = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;

export function AuthCallbackHandler({ children }) {
  const [callbackState, setCallbackState] = useState(() => ({
    processing: typeof window !== "undefined" && AUTH_HASH_PATTERN.test(window.location.hash),
    error: "",
    mode: "",
    inviteToken: ""
  }));
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !AUTH_HASH_PATTERN.test(window.location.hash)) return;

    handleAuthCallback()
      .then((result) => {
        if (!result) {
          setCallbackState({ processing: false, error: "", mode: "", inviteToken: "" });
          return;
        }

        if (result.type === "invite") {
          setCallbackState({ processing: false, error: "", mode: "invite", inviteToken: result.token ?? "" });
          return;
        }

        if (result.type === "recovery") {
          setCallbackState({ processing: false, error: "", mode: "recovery", inviteToken: "" });
          return;
        }

        setCallbackState({ processing: false, error: "", mode: "complete", inviteToken: "" });
      })
      .catch((error) => {
        setCallbackState({
          processing: false,
          error: error instanceof Error ? error.message : "Could not confirm this login link.",
          mode: "",
          inviteToken: ""
        });
      });
  }, []);

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setCallbackState((current) => ({ ...current, error: "" }));

    if (passwordForm.password.length < 8) {
      setCallbackState((current) => ({ ...current, error: "Use at least 8 characters for the password." }));
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setCallbackState((current) => ({ ...current, error: "The passwords do not match." }));
      return;
    }

    setBusy(true);
    try {
      if (callbackState.mode === "invite") {
        await acceptInvite(callbackState.inviteToken, passwordForm.password);
      } else {
        await updateUser({ password: passwordForm.password });
      }

      setPasswordForm({ password: "", confirmPassword: "" });
      setCallbackState({ processing: false, error: "", mode: "complete", inviteToken: "" });
    } catch (error) {
      setCallbackState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Could not set the password."
      }));
    } finally {
      setBusy(false);
    }
  }

  if (callbackState.processing) {
    return <AuthPanel title="Checking login link" message="Confirming your account..." />;
  }

  if (callbackState.mode === "invite" || callbackState.mode === "recovery") {
    return (
      <AuthPanel title={callbackState.mode === "invite" ? "Set password" : "Reset password"} error={callbackState.error}>
        <form className="admin-form compact-admin-form" onSubmit={handlePasswordSubmit}>
          <label>
            New password
            <input
              type="password"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              required
            />
          </label>
          <button className="back-button" type="submit" disabled={busy}>
            Save password
          </button>
        </form>
      </AuthPanel>
    );
  }

  if (callbackState.error) {
    return <AuthPanel title="Login link failed" error={callbackState.error} />;
  }

  return children;
}

function AuthPanel({ children, error, message, title }) {
  return (
    <main className="auth-callback-view">
      <section className="panel admin-panel admin-view-panel login-view-panel">
        <div className="panel-header">
          <div>
            <h2>{title}</h2>
          </div>
        </div>
        {message ? <p className="admin-help">{message}</p> : null}
        {error ? <p className="admin-status error">{error}</p> : null}
        {children}
      </section>
    </main>
  );
}
