import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { loadLibrary, saveLibrary } from "./storage";

export const STATUSES = [
  "backlog",
  "playing",
  "completed",
  "dropped",
  "wishlist",
];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...action.library, loaded: true };

    case "ADD_GAME": {
      const game = {
        id: makeId(),
        title: "",
        platform: "",
        status: "backlog",
        categories: [],
        rating: null,
        notes: "",
        coverUrl: null,
        addedAt: Date.now(),
        completedAt: null,
        ...action.game,
      };
      return { ...state, games: [game, ...state.games] };
    }

    case "UPDATE_GAME":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.id ? { ...g, ...action.changes } : g,
        ),
      };

    case "SET_STATUS":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.id
            ? {
                ...g,
                status: action.status,
                completedAt: action.status === "completed" ? Date.now() : null,
              }
            : g,
        ),
      };

    case "DELETE_GAME":
      return { ...state, games: state.games.filter((g) => g.id !== action.id) };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [
          ...state.categories,
          { id: makeId(), name: action.name, color: action.color || "#888888" },
        ],
      };

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        games: state.games.map((g) => ({
          ...g,
          categories: g.categories.filter((cid) => cid !== action.id),
        })),
      };

    default:
      return state;
  }
}

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    version: 1,
    games: [],
    categories: [],
    loaded: false,
  });
  const skipNextSave = useRef(true);

  // Load once on mount
  useEffect(() => {
    loadLibrary().then((library) => dispatch({ type: "LOAD", library }));
  }, []);

  // Save whenever games/categories change (but not right after loading)
  useEffect(() => {
    if (!state.loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const { loaded, ...library } = state;
    saveLibrary(library);
  }, [state.games, state.categories]);

  const actions = {
    addGame: (game) => dispatch({ type: "ADD_GAME", game }),
    updateGame: (id, changes) => dispatch({ type: "UPDATE_GAME", id, changes }),
    setStatus: (id, status) => dispatch({ type: "SET_STATUS", id, status }),
    deleteGame: (id) => dispatch({ type: "DELETE_GAME", id }),
    addCategory: (name, color) =>
      dispatch({ type: "ADD_CATEGORY", name, color }),
    deleteCategory: (id) => dispatch({ type: "DELETE_CATEGORY", id }),
  };

  return (
    <LibraryContext.Provider value={{ ...state, ...actions }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
