import { useState, useEffect, useCallback, memo } from 'react'
import { useMindMap } from '../context/MindMapContext'
import { useDebounce } from '../hooks'

const NodePanel = memo(function NodePanel() {
  const { selectedNode, selectedNodeId, activeMap, activeMapId, updateNode, setSelectedNode, addNode } = useMindMap()

  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [childLabel, setChildLabel] = useState('')

  // Sync when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.label || '')
      setNotes(selectedNode.notes || '')
    }
  }, [selectedNodeId, selectedNode])

  // Debounced auto-save for notes
  const debouncedNotes = useDebounce(notes, 600)
  const debouncedLabel = useDebounce(label, 400)

  useEffect(() => {
    if (!selectedNodeId || !activeMapId || !selectedNode) return
    if (debouncedNotes !== selectedNode.notes) {
      updateNode(activeMapId, selectedNodeId, { notes: debouncedNotes })
    }
  }, [debouncedNotes])

  useEffect(() => {
    if (!selectedNodeId || !activeMapId || !selectedNode) return
    if (debouncedLabel.trim() && debouncedLabel !== selectedNode.label) {
      updateNode(activeMapId, selectedNodeId, { label: debouncedLabel.trim() })
    }
  }, [debouncedLabel])

  const handleAddChild = useCallback(() => {
    if (!childLabel.trim() || !activeMapId || !selectedNodeId) return
    addNode(activeMapId, selectedNodeId, childLabel.trim())
    setChildLabel('')
  }, [childLabel, activeMapId, selectedNodeId, addNode])

  const typeColors = {
    root: 'var(--node-root)',
    branch: 'var(--node-branch)',
    leaf: 'var(--node-leaf)',
    child: 'var(--node-child)',
  }

  const typeLabels = {
    root: 'Root Node',
    branch: 'Branch',
    leaf: 'Leaf',
    child: 'Child',
  }

  if (!selectedNode) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full"
        style={{ width: 260, minWidth: 260, padding: '32px 20px', borderLeft: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, marginBottom: 12,
          }}
        >🎯</div>
        <p className="text-sm font-semibold text-center mb-1" style={{ color: 'var(--text-secondary)' }}>
          Select a node
        </p>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Click any node in the map to edit its label and notes.
        </p>
      </div>
    )
  }

  const color = typeColors[selectedNode.type] || 'var(--text-muted)'
  const typeLabel = typeLabels[selectedNode.type] || selectedNode.type

  // Count descendants
  const countDescendants = (nodeId) => {
    const node = activeMap?.nodes[nodeId]
    if (!node || node.children.length === 0) return 0
    return node.children.length + node.children.reduce((sum, c) => sum + countDescendants(c), 0)
  }
  const descendantCount = countDescendants(selectedNodeId)

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ width: 300, minWidth: 300, borderLeft: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {typeLabel}
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-4">
        {/* Label edit */}
        <div>
          <label className="text-xs font-mono font-semibold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Label
          </label>
          <input
            className="mind-input w-full px-3 py-2.5 text-sm font-semibold"
            value={label}
            onChange={e => setLabel(e.target.value)}
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-mono font-semibold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Notes
          </label>
          <textarea
            className="mind-input w-full px-3 py-2.5 text-sm resize-none"
            rows={4}
            placeholder="Add notes or description…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ lineHeight: 1.6 }}
          />
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
            Auto-saved
          </p>
        </div>

        {/* Stats */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-mono font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Node Info
          </p>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Direct children</span>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
              {selectedNode.children?.length || 0}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>All descendants</span>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
              {descendantCount}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collapsed</span>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
              {selectedNode.collapsed ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Add child */}
        <div>
          <label className="text-xs font-mono font-semibold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Add Child Node
          </label>
          <div className="flex gap-2">
            <input
              className="mind-input flex-1 px-3 py-2 text-sm"
              placeholder="Label…"
              value={childLabel}
              onChange={e => setChildLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddChild()}
            />
            <button
              className="btn-primary px-3 py-2 text-sm rounded-lg"
              onClick={handleAddChild}
              style={{ whiteSpace: 'nowrap', marginRight: '8px' }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default NodePanel
