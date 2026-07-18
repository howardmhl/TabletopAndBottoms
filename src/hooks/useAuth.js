import { getUser, login, logout, onAuthChange } from "@netlify/identity";
import { useEffect, useState } from "react";

export function useAuth() {
  const [auth, setAuth] = useState({ loading: true, user: null });

  useEffect(() => {
    let isMounted = true;

    getUser().then((user) => {
      if (isMounted) setAuth({ loading: false, user });
    });

    const unsubscribe = onAuthChange((_event, user) => {
      setAuth({ loading: false, user });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    ...auth,
    login,
    logout
  };
}
