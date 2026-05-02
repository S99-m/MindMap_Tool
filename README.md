# 🧠 MindFlow — React Mind Mapping Tool

A capstone-grade Mind Mapping application built with React (Vite), demonstrating all core syllabus constraints.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

---

## 📐 Tech Stack & Constraints (Syllabus Compliance)

| Requirement | Implementation |
|---|---|
| **Build Tool** | React + Vite (`vite.config.js`) |
| **Styling** | `@tailwindcss/vite` plugin — Tailwind v4 |
| **State Management** | Context API + `useContext` via `MindMapContext.jsx` |
| **No Redux** | ✅ Pure Context + `useReducer` |
| **API Handling** | `axios` in `hooks/index.js` via `useWeather` |
| **Side Effects** | `useEffect` for weather fetch, auto-refresh intervals |
| **Routing** | `react-router-dom` with `Link`, `useParams`, `useNavigate` |
| **Debouncing** | `useDebounce` hook applied to search + node label/notes auto-save |
| **useMemo** | Derived state: `activeMap`, `filteredMaps`, `nodeCount`, `mapStats` |
| **useCallback** | All action dispatchers and event handlers |

---

## 🏗️ Project Architecture

```
src/
├── context/
│   └── MindMapContext.jsx   # Global state: useReducer + Context API
│                            # Exports: MindMapProvider, useMindMap()
├── hooks/
│   └── index.js             # useDebounce, useWeather (axios), useLocalStorage
├── components/
│   ├── TreeNode.jsx          # Recursive tree node renderer
│   ├── Sidebar.jsx           # Map list, search (debounced), new map form
│   ├── NodePanel.jsx         # Selected node editor (auto-save with debounce)
│   └── WeatherWidget.jsx     # Live weather via Open-Meteo API (axios + interval)
├── pages/
│   ├── Dashboard.jsx         # Landing page: stats + map cards overview
│   └── MapEditor.jsx         # Main editor: tree canvas + toolbar + auto-refresh
├── App.jsx                   # Route setup: / and /map/:mapId
├── main.jsx                  # ReactDOM.createRoot
└── index.css                 # CSS variables + animations + component styles
```

---

## ✨ Feature Breakdown

### Dashboard (`/`)
- Overview stats: total maps, nodes, branches
- Map cards with mini-tree preview
- Dark mode toggle
- Click any card to navigate to the editor

### Map Editor (`/map/:mapId`)
- **Recursive tree visualization** of all nodes
- **Node types**: Root → Branch → Leaf → Child (with distinct colors)
- **Inline editing**: double-click any node label
- **Auto-save notes**: debounced 600ms → Context dispatch
- **Collapse/expand** subtrees per node
- **Add child** from inline `+` button or right panel
- **Delete nodes** (with full subtree cleanup)
- **Real-time refresh** button + auto-refresh every 30 seconds
- **Keyboard shortcuts**: `Esc` to deselect
- Node detail panel with stats (children count, descendants)

### Sidebar
- Debounced search across all maps (350ms)
- Create new map with title, description, color picker
- Per-map: node count, last updated date
- Delete map with confirmation

### Weather Widget
- Fetches real-time weather via **Open-Meteo API** (free, no key needed!)
- Uses **Nominatim** for reverse geolocation → city name
- Auto-refresh every 60 seconds via `useEffect` interval
- Manual refresh button
- Shows: temperature, feels like, humidity, wind, condition emoji

---

## 🔄 State Management (Context API)

```jsx
// MindMapContext shape:
{
  maps: MindMap[],          // All mind maps
  activeMapId: string,
  selectedNodeId: string | null,
  theme: 'light' | 'dark',
  searchQuery: string,
  weather: WeatherData | null,

  // Derived (useMemo):
  activeMap: MindMap,
  selectedNode: Node,
  filteredMaps: MindMap[],
  nodeCount: number,

  // Actions (useCallback):
  addMap, deleteMap, updateMapMeta,
  addNode, updateNode, deleteNode,
  toggleCollapse, toggleTheme,
  setActiveMap, setSelectedNode,
  setSearchQuery, setWeather,
}
```

### Reducer Actions
`SET_THEME` · `SET_ACTIVE_MAP` · `SET_SELECTED_NODE` · `SET_SEARCH`
`ADD_MAP` · `DELETE_MAP` · `UPDATE_MAP_META`
`ADD_NODE` · `UPDATE_NODE` · `DELETE_NODE` · `TOGGLE_COLLAPSE`
`SET_WEATHER` · `SET_WEATHER_LOADING` · `SET_WEATHER_ERROR`

---

## 🎨 Design System

- **Fonts**: Syne (headings/UI) + DM Mono (code/labels)
- **Theme**: CSS variables for full light/dark switching
- **Colors**: Warm off-whites, burnt orange accent (#e8521a)
- **Node Colors**: Root (dark), Branch (orange), Leaf (teal), Child (purple)
- **Animations**: fadeInUp, scaleIn, spin-slow, pulse-ring

---

## 🌐 API Used

| API | Purpose | Auth |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | Weather data | None (free) |
| [Nominatim](https://nominatim.org/) | Reverse geocoding | None (free) |
| Browser Geolocation API | User coordinates | User permission |

---

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.24.1",
  "axios": "^1.7.2"
}
```

```json
devDependencies: {
  "vite": "^5.3.4",
  "@vitejs/plugin-react": "^4.3.1",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0"
}
```
