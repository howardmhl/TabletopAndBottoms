import { useEffect, useState } from "react";
import { fetchBetrayalDataFromApi } from "../data/apiData";

export function useBetrayalData() {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const data = await fetchBetrayalDataFromApi();
        if (!isMounted) return;

        setState({ loading: false, error: "", data });
      } catch (error) {
        if (!isMounted) return;
        setState({
          loading: false,
          error: error instanceof Error ? error.message : "Something went wrong while loading the Betrayal archive.",
          data: null
        });
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
