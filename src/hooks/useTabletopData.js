import { useEffect, useState } from "react";
import { fetchTabletopDataFromApi } from "../data/apiData";

const initialTabletopState = {
  loading: true,
  error: "",
  matches: [],
  players: {},
  games: {},
  prizes: {},
  lastUpdated: null
};

export function useTabletopData() {
  const [state, setState] = useState(initialTabletopState);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const data = await fetchTabletopDataFromApi();
        if (!isMounted) return;

        setState({
          loading: false,
          error: "",
          ...data,
          lastUpdated: new Date()
        });
      } catch (error) {
        if (!isMounted) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Something went wrong while loading the leaderboard."
        }));
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
