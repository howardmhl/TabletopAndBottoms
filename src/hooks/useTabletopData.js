import { useCallback, useEffect, useState } from "react";
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

  const loadData = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const data = await fetchTabletopDataFromApi();
      setState({
        loading: false,
        error: "",
        ...data,
        lastUpdated: new Date()
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Something went wrong while loading the leaderboard."
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { ...state, refresh: loadData };
}
