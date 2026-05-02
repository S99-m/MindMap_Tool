import { useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMindMap } from '../context/MindMapContext'

function StatCard({ label, value, icon, accent }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-in-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: accent || 'var(--accent)',
          }}
        />
      </div>
      <p
        className="text-3xl font-bold"
        style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}
      >
        {value}
      </p>
      <p className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}

function MapCard({ map, onOpen }) {
  const nodeCount = Object.keys(map.nodes).length
  const rootNode = map.nodes[map.rootId]
  const branchCount = Object.values(map.nodes).filter(n => n.type === 'branch').length

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up transition-all"
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onClick={() => onOpen(map.id)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
        e.currentTarget.style.borderColor = map.color
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Color band */}
      <div style={{ height: 4, background: map.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: map.color, marginTop: 3 }} />
            <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
              {map.title}
            </h3>
          </div>
          <Link
            to={`/map/${map.id}`}
            onClick={e => e.stopPropagation()}
            style={{ textDecoration: 'none' }}
          >
            <span
              className="text-xs font-mono px-2 py-1 rounded-md"
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
              }}
            >
              Open →
            </span>
          </Link>
        </div>

        {map.description && (
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {map.description}
          </p>
        )}

        {/* Mini tree preview */}
        <div
          className="rounded-xl p-3 mb-3"
          style={{ background: 'var(--bg-secondary)', minHeight: 60 }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: map.color }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {rootNode?.label}
            </span>
          </div>
          {rootNode?.children?.slice(0, 3).map(cid => {
            const child = map.nodes[cid]
            return child ? (
              <div key={cid} className="flex items-center gap-1.5 ml-3 mt-1">
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--node-branch)' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{child.label}</span>
              </div>
            ) : null
          })}
          {(rootNode?.children?.length || 0) > 3 && (
            <p className="text-xs ml-3 mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
              +{rootNode.children.length - 3} more…
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="tag tag-orange">{nodeCount} nodes</span>
            <span className="tag tag-green">{branchCount} branches</span>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatDate(map.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { maps, setActiveMap, theme, toggleTheme } = useMindMap()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const totalNodes = maps.reduce((s, m) => s + Object.keys(m.nodes).length, 0)
    const totalBranches = maps.reduce((s, m) =>
      s + Object.values(m.nodes).filter(n => n.type === 'branch').length, 0)
    return { maps: maps.length, nodes: totalNodes, branches: totalBranches }
  }, [maps])

  const handleOpen = useCallback((id) => {
    setActiveMap(id)
    navigate(`/map/${id}`)
  }, [setActiveMap, navigate])

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)', padding: '0' }}
    >
      {/* Top nav */}
      <nav
        className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <line x1="8" y1="1" x2="8" y2="5" stroke="white" strokeWidth="1.5" />
              <line x1="8" y1="11" x2="8" y2="15" stroke="white" strokeWidth="1.5" />
              <line x1="1" y1="8" x2="5" y2="8" stroke="white" strokeWidth="1.5" />
              <line x1="11" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
              StellarMap
            </span>
            <span
              className="ml-2 tag tag-orange"
              style={{ fontSize: 10, verticalAlign: 'middle' }}
            >
              Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="btn-secondary px-3 py-2 text-sm rounded-lg"
            title="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link to="/map/map-1" style={{ textDecoration: 'none' }}>
            <button className="btn-primary px-4 py-2 text-sm rounded-lg">
              Open Editor →
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="px-8 pt-12 pb-8"
        style={{
          background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)`,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
        >
          Your Mind Maps
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Visualize ideas, organize thoughts, build knowledge trees.
        </p>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon="🗂️" label="Total Maps" value={stats.maps} accent="var(--accent)" />
          <StatCard icon="🔵" label="Total Nodes" value={stats.nodes} accent="var(--node-leaf)" />
          <StatCard icon="🌿" label="Branch Nodes" value={stats.branches} accent="var(--node-branch)" />
        </div>

        {/* Maps grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>All Maps</h2>
          <Link to="/map/map-1" style={{ textDecoration: 'none' }}>
            <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>Open Editor →</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {maps.map((map, i) => (
            <div key={map.id} style={{ animationDelay: `${i * 80}ms` }}>
              <MapCard map={map} onOpen={handleOpen} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
