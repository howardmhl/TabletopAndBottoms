import { useEffect, useState } from "react";
import { getStoredUser, loginWithIdentity, logoutFromIdentity } from "../data/identityClient";

export function useAuth() {
  const [auth, setAuth] = useState({ loading: false, user: getStoredUser() });

  useEffect(() => {
    const handleAuthChange = (event) => {
      setAuth({ loading: false, user: event.detail ?? null });
    };

    window.addEventListener("ttnb-auth-change", handleAuthChange);
    return () => window.removeEventListener("ttnb-auth-change", handleAuthChange);
  }, []);

  return {
    ...auth,
    login: loginWithIdentity,
    logout: logoutFromIdentity
  };
}
