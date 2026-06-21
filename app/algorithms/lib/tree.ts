// Shared binary-tree helpers for the Trees visualizers.

export type TNode = {
  id: number
  val: number
  idx: number // heap index (root 0, children 2i+1 / 2i+2) — used for layout
  left: number | null
  right: number | null
}

// Parse a LeetCode-style level-order array string, e.g. "3,9,20,null,null,15,7".
export function parseTree(text: string): { nodes: TNode[]; rootId: number | null } {
  const vals = text.split(',').map((t) => {
    const s = t.trim().toLowerCase()
    if (s === '' || s === 'null') return null
    const n = Number(s)
    return Number.isNaN(n) ? null : n
  })
  const nodes: TNode[] = []
  if (!vals.length || vals[0] === null) return { nodes, rootId: null }

  let id = 0
  const root: TNode = { id: id++, val: vals[0]!, idx: 0, left: null, right: null }
  nodes.push(root)
  const queue: TNode[] = [root]
  let i = 1
  while (queue.length && i < vals.length) {
    const node = queue.shift()!
    for (const side of ['left', 'right'] as const) {
      if (i >= vals.length) break
      const v = vals[i++]
      if (v !== null) {
        const child: TNode = {
          id: id++,
          val: v,
          idx: side === 'left' ? node.idx * 2 + 1 : node.idx * 2 + 2,
          left: null,
          right: null,
        }
        node[side] = child.id
        nodes.push(child)
        queue.push(child)
      }
    }
  }
  return { nodes, rootId: root.id }
}

export const depthOf = (idx: number) => Math.floor(Math.log2(idx + 1))

// Compute an SVG layout (viewBox + per-node positions) from heap indices.
export function layout(nodes: TNode[]) {
  const maxDepth = nodes.reduce((m, n) => Math.max(m, depthOf(n.idx)), 0)
  const W = Math.max(360, 2 ** maxDepth * 46)
  const H = (maxDepth + 1) * 72
  const pos = (idx: number) => {
    const d = depthOf(idx)
    const slots = 2 ** d
    const p = idx - (2 ** d - 1)
    return { x: ((p + 0.5) / slots) * W, y: 36 + d * 72 }
  }
  return { W, H, pos, maxDepth }
}
