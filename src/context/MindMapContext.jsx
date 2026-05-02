import { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react'

// ─── Initial Data ───────────────────────────────────────────────────────────
const INITIAL_MAPS = [
  {
    id: 'map-1',
    title: 'Product Roadmap Q3',
    description: 'Feature planning and milestone tracking',
    color: '#e8521a',
    createdAt: new Date('2024-07-01').toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: {
      'root': {
        id: 'root', label: 'Product Q3', type: 'root',
        children: ['n1', 'n2', 'n3'], collapsed: false, notes: 'Main roadmap root',
      },
      'n1': {
        id: 'n1', label: 'Authentication', type: 'branch',
        children: ['n1a', 'n1b'], collapsed: false, notes: 'Auth system overhaul',
      },
      'n2': {
        id: 'n2', label: 'Dashboard', type: 'branch',
        children: ['n2a', 'n2b', 'n2c'], collapsed: false, notes: 'New dashboard design',
      },
      'n3': {
        id: 'n3', label: 'API v2', type: 'branch',
        children: ['n3a'], collapsed: false, notes: 'REST API version 2',
      },
      'n1a': { id: 'n1a', label: 'SSO Integration', type: 'leaf', children: [], collapsed: false, notes: '' },
      'n1b': { id: 'n1b', label: '2FA Setup', type: 'leaf', children: [], collapsed: false, notes: '' },
      'n2a': { id: 'n2a', label: 'Analytics Widgets', type: 'leaf', children: [], collapsed: false, notes: '' },
      'n2b': { id: 'n2b', label: 'Dark Mode', type: 'leaf', children: [], collapsed: false, notes: '' },
      'n2c': { id: 'n2c', label: 'Mobile Responsive', type: 'leaf', children: [], collapsed: false, notes: '' },
      'n3a': { id: 'n3a', label: 'Rate Limiting', type: 'leaf', children: [], collapsed: false, notes: '' },
    },
    rootId: 'root',
  },
  {
    id: 'map-2',
    title: 'Study Notes — React',
    description: 'Deep dive into React patterns and hooks',
    color: '#4a9d8f',
    createdAt: new Date('2024-06-15').toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: {
      'root': {
        id: 'root', label: 'React Mastery', type: 'root',
        children: ['h1', 'h2'], collapsed: false, notes: 'Core React concepts',
      },
      'h1': {
        id: 'h1', label: 'Hooks', type: 'branch',
        children: ['h1a', 'h1b', 'h1c'], collapsed: false, notes: '',
      },
      'h2': {
        id: 'h2', label: 'Patterns', type: 'branch',
        children: ['h2a', 'h2b'], collapsed: false, notes: '',
      },
      'h1a': { id: 'h1a', label: 'useState & useReducer', type: 'leaf', children: [], collapsed: false, notes: '' },
      'h1b': { id: 'h1b', label: 'useEffect & cleanup', type: 'leaf', children: [], collapsed: false, notes: '' },
      'h1c': { id: 'h1c', label: 'useMemo & useCallback', type: 'leaf', children: [], collapsed: false, notes: '' },
      'h2a': { id: 'h2a', label: 'Compound Components', type: 'leaf', children: [], collapsed: false, notes: '' },
      'h2b': { id: 'h2b', label: 'Render Props', type: 'leaf', children: [], collapsed: false, notes: '' },
    },
    rootId: 'root',
  },
]

// ─── Reducer ─────────────────────────────────────────────────────────────────
function mindMapReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
  localStorage.setItem('theme', action.payload)
  return { ...state, theme: action.payload }

    case 'SET_ACTIVE_MAP':
      return { ...state, activeMapId: action.payload, selectedNodeId: null }

    case 'SET_SELECTED_NODE':
      return { ...state, selectedNodeId: action.payload }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }

    case 'ADD_MAP': {
      const newMap = {
        id: `map-${Date.now()}`,
        title: action.payload.title || 'Untitled Map',
        description: action.payload.description || '',
        color: action.payload.color || '#e8521a',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rootId: 'root',
        nodes: {
          'root': {
            id: 'root',
            label: action.payload.title || 'Central Idea',
            type: 'root',
            children: [],
            collapsed: false,
            notes: '',
          }
        }
      }
      return {
        ...state,
        maps: [...state.maps, newMap],
        activeMapId: newMap.id,
      }
    }

    case 'DELETE_MAP':
      return {
        ...state,
        maps: state.maps.filter(m => m.id !== action.payload),
        activeMapId: state.activeMapId === action.payload
          ? (state.maps.find(m => m.id !== action.payload)?.id || null)
          : state.activeMapId,
      }

    case 'UPDATE_MAP_META': {
      return {
        ...state,
        maps: state.maps.map(m =>
          m.id === action.payload.mapId
            ? { ...m, ...action.payload.data, updatedAt: new Date().toISOString() }
            : m
        )
      }
    }

    case 'ADD_NODE': {
      const { mapId, parentId, label } = action.payload
      const newId = `node-${Date.now()}`
      const parentNode = state.maps.find(m => m.id === mapId)?.nodes[parentId]
      const depth = parentNode?.type === 'root' ? 'branch'
        : parentNode?.type === 'branch' ? 'leaf' : 'child'

      return {
        ...state,
        maps: state.maps.map(m => {
          if (m.id !== mapId) return m
          return {
            ...m,
            updatedAt: new Date().toISOString(),
            nodes: {
              ...m.nodes,
              [parentId]: {
                ...m.nodes[parentId],
                children: [...(m.nodes[parentId]?.children || []), newId],
              },
              [newId]: {
                id: newId,
                label: label || 'New Node',
                type: depth,
                children: [],
                collapsed: false,
                notes: '',
              }
            }
          }
        }),
        selectedNodeId: newId,
      }
    }

    case 'UPDATE_NODE': {
      const { mapId, nodeId, data } = action.payload
      return {
        ...state,
        maps: state.maps.map(m => {
          if (m.id !== mapId) return m
          return {
            ...m,
            updatedAt: new Date().toISOString(),
            nodes: {
              ...m.nodes,
              [nodeId]: { ...m.nodes[nodeId], ...data }
            }
          }
        })
      }
    }

    case 'DELETE_NODE': {
      const { mapId, nodeId } = action.payload
      const map = state.maps.find(m => m.id === mapId)
      if (!map || nodeId === map.rootId) return state

      // Recursively collect all descendant IDs
      const collectDescendants = (id) => {
        const node = map.nodes[id]
        if (!node) return []
        return [id, ...(node.children || []).flatMap(collectDescendants)]
      }
      const toDelete = new Set(collectDescendants(nodeId))

      return {
        ...state,
        selectedNodeId: state.selectedNodeId && toDelete.has(state.selectedNodeId) ? null : state.selectedNodeId,
        maps: state.maps.map(m => {
          if (m.id !== mapId) return m
          const newNodes = {}
          Object.entries(m.nodes).forEach(([id, node]) => {
            if (!toDelete.has(id)) {
              newNodes[id] = {
                ...node,
                children: node.children.filter(c => !toDelete.has(c))
              }
            }
          })
          return { ...m, updatedAt: new Date().toISOString(), nodes: newNodes }
        })
      }
    }

    case 'TOGGLE_COLLAPSE': {
      const { mapId, nodeId } = action.payload
      return {
        ...state,
        maps: state.maps.map(m => {
          if (m.id !== mapId) return m
          return {
            ...m,
            nodes: {
              ...m.nodes,
              [nodeId]: { ...m.nodes[nodeId], collapsed: !m.nodes[nodeId].collapsed }
            }
          }
        })
      }
    }

    default:
      return state
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  maps: INITIAL_MAPS,
  activeMapId: 'map-1',
  selectedNodeId: null,
  theme: localStorage.getItem('theme') || 'light',
  searchQuery: '',
}

// ─── Context ──────────────────────────────────────────────────────────────────
const MindMapContext = createContext(null)

export function MindMapProvider({ children }) {
  const [state, dispatch] = useReducer(mindMapReducer, INITIAL_STATE)

  // Sync theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme)
  }, [state.theme])

  // Derived: active map
  const activeMap = useMemo(
    () => state.maps.find(m => m.id === state.activeMapId) || null,
    [state.maps, state.activeMapId]
  )

  // Derived: selected node
  const selectedNode = useMemo(
    () => activeMap?.nodes[state.selectedNodeId] || null,
    [activeMap, state.selectedNodeId]
  )

  // Derived: filtered maps by search
  const filteredMaps = useMemo(() => {
    if (!state.searchQuery.trim()) return state.maps
    const q = state.searchQuery.toLowerCase()
    return state.maps.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    )
  }, [state.maps, state.searchQuery])

  // Derived: node count for active map
  const nodeCount = useMemo(
    () => activeMap ? Object.keys(activeMap.nodes).length : 0,
    [activeMap]
  )

  // Actions
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' })
  }, [state.theme])

  const setActiveMap = useCallback((id) => {
    dispatch({ type: 'SET_ACTIVE_MAP', payload: id })
  }, [])

  const setSelectedNode = useCallback((id) => {
    dispatch({ type: 'SET_SELECTED_NODE', payload: id })
  }, [])

  const setSearchQuery = useCallback((q) => {
    dispatch({ type: 'SET_SEARCH', payload: q })
  }, [])

  const addMap = useCallback((data) => {
    dispatch({ type: 'ADD_MAP', payload: data })
  }, [])

  const deleteMap = useCallback((id) => {
    dispatch({ type: 'DELETE_MAP', payload: id })
  }, [])

  const updateMapMeta = useCallback((mapId, data) => {
    dispatch({ type: 'UPDATE_MAP_META', payload: { mapId, data } })
  }, [])

  const addNode = useCallback((mapId, parentId, label) => {
    dispatch({ type: 'ADD_NODE', payload: { mapId, parentId, label } })
  }, [])

  const updateNode = useCallback((mapId, nodeId, data) => {
    dispatch({ type: 'UPDATE_NODE', payload: { mapId, nodeId, data } })
  }, [])

  const deleteNode = useCallback((mapId, nodeId) => {
    dispatch({ type: 'DELETE_NODE', payload: { mapId, nodeId } })
  }, [])

  const toggleCollapse = useCallback((mapId, nodeId) => {
    dispatch({ type: 'TOGGLE_COLLAPSE', payload: { mapId, nodeId } })
  }, [])

  const value = useMemo(() => ({
    ...state,
    activeMap,
    selectedNode,
    filteredMaps,
    nodeCount,
    toggleTheme,
    setActiveMap,
    setSelectedNode,
    setSearchQuery,
    addMap,
    deleteMap,
    updateMapMeta,
    addNode,
    updateNode,
    deleteNode,
    toggleCollapse,
  }), [
    state, activeMap, selectedNode, filteredMaps, nodeCount,
    toggleTheme, setActiveMap, setSelectedNode, setSearchQuery,
    addMap, deleteMap, updateMapMeta, addNode, updateNode, deleteNode,
    toggleCollapse])

  return (
    <MindMapContext.Provider value={value}>
      {children}
    </MindMapContext.Provider>
  )
}

export function useMindMap() {
  const ctx = useContext(MindMapContext)
  if (!ctx) throw new Error('useMindMap must be used within MindMapProvider')
  return ctx
}
