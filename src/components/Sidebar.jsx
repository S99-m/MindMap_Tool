import { useState, useCallback, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMindMap } from '../context/MindMapContext'
import { useDebounce } from '../hooks'

const MAP_COLORS = ['#e8521a', '#4a9d8f', '#7b5ea7', '#d4882a', '#3b7dd8', '#c44b7a']

const Sidebar = memo(function Sidebar({ collapsed, onToggle }) {
  const {
    filteredMaps, activeMapId, theme,
    setActiveMap, setSearchQuery, searchQuery,
    addMap, deleteMap, toggleTheme,
  } = useMindMap()

  const navigate = useNavigate()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(MAP_COLORS[0])

  // Debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debouncedSearch = useDebounce(localSearch, 350)

  // Sync debounced value to context
  useState(() => {
    setSearchQuery(debouncedSearch)
  })

  // Update search context when debounced value changes
  const handleSearchChange = useCallback((e) => {
    setLocalSearch(e.target.value)
    // Direct update for immediate feedback in input
  }, [])

  // Apply debounced search to context
  const [prevDebounced, setPrevDebounced] = useState(debouncedSearch)
  if (prevDebounced !== debouncedSearch) {
    setPrevDebounced(debouncedSearch)
    setSearchQuery(debouncedSearch)
  }

  const handleAddMap = useCallback(() => {
    if (!newTitle.trim()) return
    addMap({ title: newTitle.trim(), description: newDesc.trim(), color: newColor })
    setNewTitle('')
    setNewDesc('')
    setNewColor(MAP_COLORS[0])
    setShowNewForm(false)
  }, [newTitle, newDesc, newColor, addMap])

  const handleDeleteMap = useCallback((e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Delete this map?')) deleteMap(id)
  }, [deleteMap])

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center py-4 gap-4"
        style={{ width: 56, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', height: '100vh' }}
      >
        <button onClick={onToggle} style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
          ☰
        </button>
        <button
          onClick={toggleTheme}
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    )
  }

  return (
    <div
      className="panel flex flex-col h-screen"
      style={{ width: 280, minWidth: 280, overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="white" />
              <line x1="7" y1="1" x2="7" y2="4" stroke="white" strokeWidth="1.5" />
              <line x1="7" y1="10" x2="7" y2="13" stroke="white" strokeWidth="1.5" />
              <line x1="1" y1="7" x2="4" y2="7" stroke="white" strokeWidth="1.5" />
              <line x1="10" y1="7" x2="13" y2="7" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <Link to="/" style={{ textDecoration: 'none' }}>
  <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>StellarMap</span>
</Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}
            title="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onToggle}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
          >
            ◂
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Search */}
        <div className="mb-3 relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >🔍</span>
          <input
            className="mind-input w-full pl-8 pr-3 py-2 text-sm"
            placeholder="Search maps…"
            value={localSearch}
            onChange={handleSearchChange}
          />
        </div>

        {/* Maps list */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Maps ({filteredMaps.length})
          </span>
          <button
            onClick={() => setShowNewForm(v => !v)}
            className="btn-primary text-xs px-2 py-1 rounded-md"
            style={{ fontSize: 11 }}
          >
            + New
          </button>
        </div>

        {/* New map form */}
        {showNewForm && (
          <div
            className="rounded-xl p-4 mb-3 animate-scale-in"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>New Mind Map</p>
            <input
              autoFocus
              className="mind-input w-full px-3 py-2 text-sm mb-2"
              placeholder="Title…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMap()}
            />
            <input
              className="mind-input w-full px-3 py-2 text-sm mb-3"
              placeholder="Description (optional)…"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2 mb-3">
              {MAP_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: c, border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 py-2 text-xs" onClick={handleAddMap}>Create</button>
              <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setShowNewForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Map items */}
        <div className="flex flex-col gap-1">
          {filteredMaps.map(map => (
            <Link
              key={map.id}
              to={`/map/${map.id}`}
              onClick={() => setActiveMap(map.id)}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="rounded-xl px-3 py-3 cursor-pointer transition-all relative group"
                style={{
                  background: map.id === activeMapId ? 'var(--accent-light)' : 'transparent',
                  border: `1.5px solid ${map.id === activeMapId ? 'var(--accent)' : 'transparent'}`,
                }}
                onMouseEnter={e => {
                  if (map.id !== activeMapId) {
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }
                }}
                onMouseLeave={e => {
                  if (map.id !== activeMapId) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: map.color, marginTop: 4, shrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: map.id === activeMapId ? 'var(--accent)' : 'var(--text-primary)' }}
                    >
                      {map.title}
                    </p>
                    {map.description && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {map.description}
                      </p>
                    )}
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {Object.keys(map.nodes).length} nodes · {formatDate(map.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteMap(e, map.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    style={{
                      color: '#dc2626', background: 'none', border: 'none',
                      cursor: 'pointer', padding: '2px 4px', borderRadius: 4,
                    }}
                    title="Delete map"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </Link>
          ))}

          {filteredMaps.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? 'No maps match your search.' : 'No maps yet. Create one!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Dashboard</span>
        </Link>
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          v1.0
        </span>
      </div>
    </div>
  )
})

export default Sidebar
