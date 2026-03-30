import { useState, useEffect } from "react";
import { getAlgoMeta } from "../api.js";

export default function useAlgoMeta(algoName) {
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAlgoMeta(algoName)
      .then(data => { setMeta(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [algoName]);

  return { meta, loading, error };
}
