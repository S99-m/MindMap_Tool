import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMindMap } from '../context/MindMapContext'
import TreeNode from '../components/TreeNode'
import Sidebar from '../components/Sidebar'
import NodePanel from '../components/NodePanel'

function Toolbar({ map, onRefresh, lastFetched, refreshing }) {
  const { updateMapMeta, activeMapId, nodeCount } = useMindMap()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(map?.title || '')

  useEffect(() => { setTitleValue(map?.title || '') }, [map?.title])

  const handleSaveTitle = () => {
    if (titleValue.trim() && activeMapId) {
      updateMapMeta(activeMapId, { title: titleValue.trim() })
    }
    setEditingTitle(false)
  }

  return (
    <div
      className="flex items-center gap-4 px-6 py-3"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>← Dashboard</span>
      </Link>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Map title */}
      <div className="flex items-center gap-2 flex-1">
        <div
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: map?.color || 'var(--accent)',
          }}
        />
        {editingTitle ? (
          <input
            autoFocus
            className="mind-input px-2 py-1 text-sm font-bold"
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSaveTitle()
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            style={{ maxWidth: 240 }}
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-sm font-bold"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif',
              padding: '2px 6px', borderRadius: 6,
            }}
            title="Click to rename"
          >
            {map?.title}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <span className="tag tag-orange">{nodeCount} nodes</span>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="btn-secondary px-4 py-2 text-xs rounded-lg flex items-center gap-2"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          <span className={refreshing ? 'animate-spin-slow inline-block' : ''}>↻</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}

export default function MapEditor() {
  const { mapId } = useParams()
  const navigate = useNavigate()
  const {
    maps, activeMap, activeMapId, selectedNodeId,
    setActiveMap, setSelectedNode, addNode,
  } = useMindMap()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastFetched, setLastFetched] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const intervalRef = useRef(null)
  const canvasRef = useRef(null)

  // Set active map from URL param
  useEffect(() => {
    if (mapId && mapId !== activeMapId) {
      const found = maps.find(m => m.id === mapId)
      if (found) setActiveMap(mapId)
      else navigate('/')
    }
  }, [mapId])

  // Auto-refresh every 30s (simulates live sync)
  const doRefresh = useCallback(() => {
    setRefreshing(true)
    setLastFetched(new Date().toISOString())
    setRefreshCount(c => c + 1)
    setTimeout(() => setRefreshing(false), 200)
  }, [])

  useEffect(() => {}, [])

  // Click outside to deselect
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.closest('[data-canvas]')) {
      setSelectedNode(null)
    }
  }, [setSelectedNode])

  // Keyboard shortcut: 'n' to add child to selected node
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'Escape') setSelectedNode(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setSelectedNode])

  // Stats for the current map
  const mapStats = useMemo(() => {
    if (!activeMap) return {}
    const nodes = Object.values(activeMap.nodes)
    return {
      total: nodes.length,
      branches: nodes.filter(n => n.type === 'branch').length,
      leaves: nodes.filter(n => n.type === 'leaf' || n.type === 'child').length,
      withNotes: nodes.filter(n => n.notes?.trim()).length,
    }
  }, [activeMap, refreshCount])

  if (!activeMap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: 'var(--text-muted)' }}>Map not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          map={activeMap}
          onRefresh={doRefresh}
          lastFetched={lastFetched}
          refreshing={refreshing}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Tree canvas */}
          <div
            ref={canvasRef}
            data-canvas
            className="flex-1 overflow-auto p-8"
            style={{ background: 'var(--bg-primary)' }}
            onClick={handleCanvasClick}
          >
            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-6">
              <span className="tag tag-orange">{mapStats.total} nodes</span>
              <span className="tag tag-green">{mapStats.branches} branches</span>
              <span className="tag tag-purple">{mapStats.leaves} leaves</span>
              {mapStats.withNotes > 0 && (
                <span className="tag" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  {mapStats.withNotes} with notes
                </span>
              )}

              {refreshing && (
                <span className="flex items-center gap-1 text-xs font-mono animate-fade-in" style={{ color: 'var(--accent)' }}>
                  <span className="animate-spin-slow inline-block">↻</span> Syncing…
                </span>
              )}
            </div>

            {/* Hints */}
            <div
              className="mb-6 text-xs font-mono rounded-xl px-4 py-2 flex gap-4"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
              }}
            >
              <span>Click node to select</span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span>Double-click to rename</span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span>Select + [+] to add child</span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span>Esc to deselect</span>
            </div>

            {/* Tree */}
            <div style={{ position: 'relative', minWidth: 500 }}>
              <TreeNode
                nodeId={activeMap.rootId}
                mapId={activeMap.id}
                depth={0}
              />
            </div>
          </div>

          {/* Node detail panel */}
          <NodePanel />
        </div>
      </div>
    </div>
  )
}
