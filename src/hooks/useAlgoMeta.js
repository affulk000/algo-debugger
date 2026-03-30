import { useReducer, useEffect } from "react";
import { getAlgoMeta } from "../api.js";

function reducer(state, action) {
  switch (action.type) {
    case 'fetch':   return { meta: null,        loading: true,  error: null          };
    case 'success': return { meta: action.data, loading: false, error: null          };
    case 'error':   return { meta: null,        loading: false, error: action.error  };
    default:        return state;
  }
}

export default function useAlgoMeta(algoName) {
  const [state, dispatch] = useReducer(reducer, { meta: null, loading: true, error: null });

  useEffect(() => {
    dispatch({ type: 'fetch' });
    getAlgoMeta(algoName)
      .then(data => dispatch({ type: 'success', data }))
      .catch(err  => dispatch({ type: 'error',   error: err.message }));
  }, [algoName]);

  return state;
}
