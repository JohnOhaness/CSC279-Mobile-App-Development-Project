import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
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

function withProgress(game) {
  const completed = game.status === "completed";
  return {
    ...game,
    completedAt: completed ? (game.completedAt ?? Date.now()) : null,
    allAchievements: completed && game.allAchievements === true,
  };
}

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
        hoursPlayed: null,
        addedAt: Date.now(),
        completedAt: null,
        ...action.game,
      };
      return { ...state, games: [withProgress(game), ...state.games] };
    }

    case "UPDATE_GAME":
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.id ? withProgress({ ...g, ...action.changes }) : g,
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

export function LibraryProvider({ children, storageKey }) {
  const [state, dispatch] = useReducer((previous, action) => {
    const next = reducer(previous, action);
    return action.type === "LOAD" ? next : { ...next, changed: true };
  }, {
    version: 2,
    games: [],
    categories: [],
    loaded: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadLibrary(storageKey).then((library) => {
      if (active) dispatch({ type: "LOAD", library });
    }).catch(() => {
      if (active) setError("Could not read your library. Reopen the app to retry.");
    });
    return () => { active = false; };
  }, [storageKey]);

  useEffect(() => {
    if (!state.changed) return;
    let active = true;
    const { version, games, categories } = state;
    saveLibrary(storageKey, { version, games, categories }).then(() => {
      if (active) setError("");
    }).catch(() => {
      if (active) setError("Could not save your library on this device.");
    });
    return () => { active = false; };
  }, [state, storageKey]);

  const actions = {
    addGame: (game) => dispatch({ type: "ADD_GAME", game }),
    updateGame: (id, changes) => dispatch({ type: "UPDATE_GAME", id, changes }),
    setStatus: (id, status) => dispatch({ type: "UPDATE_GAME", id, changes: { status } }),
    deleteGame: (id) => dispatch({ type: "DELETE_GAME", id }),
    addCategory: (name, color) =>
      dispatch({ type: "ADD_CATEGORY", name, color }),
    deleteCategory: (id) => dispatch({ type: "DELETE_CATEGORY", id }),
  };

  return (
    <LibraryContext.Provider value={{ ...state, error, ...actions }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
