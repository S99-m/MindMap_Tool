import { useState, useCallback, memo } from 'react'
import { useMindMap } from '../context/MindMapContext'

// ─── Inline Edit Input ────────────────────────────────────────────────────────
const InlineEdit = memo(({ value, onSave, onCancel, className = '' }) => {
  const [text, setText] = useState(value)
  return (
    <input
      autoFocus
      className={`mind-input px-2 py-1 text-sm w-full min-w-[120px] ${className}`}
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => onSave(text)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSave(text)
        if (e.key === 'Escape') onCancel()
      }}
    />
  )
})

// ─── Single Tree Node ─────────────────────────────────────────────────────────
const TreeNode = memo(function TreeNode({ nodeId, mapId, depth = 0 }) {
  const {
    activeMap, selectedNodeId,
    setSelectedNode, addNode, updateNode, deleteNode, toggleCollapse
  } = useMindMap()

  const [editing, setEditing] = useState(false)
  const [showAddInput, setShowAddInput] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const node = activeMap?.nodes[nodeId]
  if (!node) return null

  const isSelected = selectedNodeId === nodeId
  const isRoot = node.type === 'root'
  const hasChildren = node.children?.length > 0

  const handleSelect = useCallback((e) => {
    e.stopPropagation()
    setSelectedNode(nodeId)
  }, [nodeId, setSelectedNode])

  const handleSaveLabel = useCallback((newLabel) => {
    if (newLabel.trim()) updateNode(mapId, nodeId, { label: newLabel.trim() })
    setEditing(false)
  }, [mapId, nodeId, updateNode])

  const handleAddChild = useCallback(() => {
    if (newLabel.trim()) {
      addNode(mapId, nodeId, newLabel.trim())
      setNewLabel('')
      setShowAddInput(false)
    }
  }, [mapId, nodeId, newLabel, addNode])

  const handleDelete = useCallback((e) => {
    e.stopPropagation()
    if (!isRoot) deleteNode(mapId, nodeId)
  }, [mapId, nodeId, isRoot, deleteNode])

  const handleToggle = useCallback((e) => {
    e.stopPropagation()
    toggleCollapse(mapId, nodeId)
  }, [mapId, nodeId, toggleCollapse])

  // Indent per depth level
  const indentPx = depth * 32

  // Color accent per type
  const typeColor = {
    root: 'var(--node-root)',
    branch: 'var(--node-branch)',
    leaf: 'var(--node-leaf)',
    child: 'var(--node-child)',
  }[node.type] || 'var(--text-muted)'

  return (
    <div
      className="tree-node animate-fade-in"
      style={{ marginLeft: depth === 0 ? 0 : indentPx }}
    >
      {/* Connector line from parent */}
      {depth > 0 && (
        <div
          className="absolute"
          style={{
            left: -16,
            top: '50%',
            width: 16,
            height: 2,
            background: 'var(--border-strong)',
            transform: 'translateY(-50%)',
          }}
        />
      )}

      <div className="relative flex items-start gap-2 mb-2">
        {/* Vertical line for children */}
        {hasChildren && !node.collapsed && (
          <div
            style={{
              position: 'absolute',
              left: indentPx + 18,
              top: 40,
              bottom: 8,
              width: 2,
              background: 'var(--border)',
              borderRadius: 2,
            }}
          />
        )}

        {/* Node card */}
        <div
          className={`node-card ${node.type} ${isSelected ? 'selected' : ''} flex-1`}
          onClick={handleSelect}
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
          style={{ borderLeftColor: node.type !== 'root' ? typeColor : undefined }}
        >
          <div className="flex items-center gap-2">
            {/* Collapse toggle */}
            {hasChildren && (
              <button
                onClick={handleToggle}
                className="shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{
                  background: node.collapsed ? typeColor : 'transparent',
                  border: `1.5px solid ${typeColor}`,
                  color: node.collapsed ? 'white' : typeColor,
                  fontSize: 10,
                }}
              >
                {node.collapsed ? '+' : '−'}
              </button>
            )}

            {/* Label */}
            {editing ? (
              <InlineEdit
                value={node.label}
                onSave={handleSaveLabel}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <span
                className="flex-1 text-sm font-semibold leading-snug"
                style={{ color: isRoot ? 'var(--bg-primary)' : 'var(--text-primary)' }}
              >
                {node.label}
              </span>
            )}

            {/* Action buttons — show on hover/select */}
            {isSelected && !editing && (
              <div className="flex items-center gap-1 animate-fade-in ml-auto">
                {/* Add child */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAddInput(v => !v) }}
                  title="Add child node"
                  style={{
                    background: typeColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  }}
                >+</button>

                {/* Edit */}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                  title="Edit label"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 6,
                    width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 11,
                  }}
                >✎</button>

                {/* Delete (not root) */}
                {!isRoot && (
                  <button
                    onClick={handleDelete}
                    title="Delete node"
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: 6,
                      width: 22, height: 22,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 11,
                    }}
                  >✕</button>
                )}
              </div>
            )}
          </div>

          {/* Notes snippet */}
          {node.notes && !isRoot && (
            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {node.notes.slice(0, 60)}{node.notes.length > 60 ? '…' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Add child input */}
      {showAddInput && isSelected && (
        <div
          className="flex gap-2 mb-3 animate-scale-in"
          style={{ marginLeft: 32 }}
          onClick={e => e.stopPropagation()}
        >
          <input
            autoFocus
            className="mind-input flex-1 px-3 py-2 text-sm"
            placeholder="New node label…"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddChild()
              if (e.key === 'Escape') { setShowAddInput(false); setNewLabel('') }
            }}
          />
          <button className="btn-primary px-4 py-2 text-sm" onClick={handleAddChild}>Add</button>
          <button
            className="btn-secondary px-3 py-2 text-sm"
            onClick={() => { setShowAddInput(false); setNewLabel('') }}
          >✕</button>
        </div>
      )}

      {/* Recursive children */}
      {hasChildren && !node.collapsed && (
        <div className="relative" style={{ marginLeft: 32 }}>
          {/* Vertical connector */}
          <div
            style={{
              position: 'absolute',
              left: -16,
              top: 0,
              bottom: 16,
              width: 2,
              background: 'var(--border)',
              borderRadius: 2,
            }}
          />
          {node.children.map(childId => (
            <TreeNode key={childId} nodeId={childId} mapId={mapId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
})

export default TreeNode
