import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { blocked, type Save } from './state'
import { fishKinds, landscape, materials } from './exploration'
import { Decoration } from './art'
type Point = { x: number; y: number }
type Props = {
  save: Save
  setSave: Dispatch<SetStateAction<Save>>
  position: Point
  paused: boolean
  onMessage: (s: string) => void
}
export function WildHarvest({
  save,
  setSave,
  position,
  paused,
  onMessage,
}: Props) {
  const world = save.worlds[save.map]
  const [notice, setNotice] = useState(
    '鱼与采集材料都在收获栏，可出售；鱼也可放到地上喂伙伴。',
  )
  const tell = (text: string) => {
    setNotice(text)
    onMessage(text)
  }
  function dropFish(kind: number) {
    const tile = [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
      .map(([dx, dy]) => ({ x: position.x + dx, y: position.y + dy }))
      .find(
        (p) =>
          !blocked(p.x, p.y, save.map) &&
          !world.crops[`${p.x},${p.y}`] &&
          world.decor[`${p.x},${p.y}`] === undefined,
      )
    if (!tile) {
      tell('身边没有空地，换个位置再放鱼吧。')
      return
    }
    setSave((s) => {
      if (!s.fish[kind]) return s
      const n = structuredClone(s)
      const key = `${tile.x},${tile.y}`
      if (
        n.worlds[n.map].decor[key] !== undefined ||
        n.worlds[n.map].crops[key]
      )
        return s
      n.fish[kind]--
      n.worlds[n.map].decor[key] = 12 + kind
      return n
    })
    tell(`放下了一条${fishKinds[kind].name}，伙伴会走来吃掉它。`)
  }
  const sell = (kind: 'fish' | 'materials', i: number, price: number) => {
    setSave((s) => {
      const n = structuredClone(s)
      n.coins = Math.min(10000000, n.coins + n[kind][i] * price)
      n[kind][i] = 0
      return n
    })
    tell('分享给了路过的商人，宋元通宝已放进钱袋。')
  }
  return (
    <div className="fish-bag">
      {fishKinds.map((f, i) => (
        <div className="expedition-row" key={f.name}>
          <svg width="42" height="36" viewBox="-5 -4 30 25" aria-hidden="true">
            <Decoration kind={12 + i} />
          </svg>
          <span>
            {f.name} ×{save.fish[i]}
            <small>{f.sell} 宋元通宝 / 条</small>
          </span>
          <button
            disabled={paused || !save.fish[i]}
            onClick={() => sell('fish', i, f.sell)}
          >
            出售全部
          </button>
          <button
            disabled={paused || !save.fish[i]}
            onClick={() => dropFish(i)}
          >
            放到地上
          </button>
        </div>
      ))}
      {materials.map((m, i) => (
        <div className="expedition-row" key={m.name}>
          <span>
            {m.name} ×{save.materials[i]}
            <small>{m.sell} 宋元通宝 / 份</small>
          </span>
          <button
            disabled={paused || !save.materials[i]}
            onClick={() => sell('materials', i, m.sell)}
          >
            出售全部
          </button>
        </div>
      ))}
      <p role="status" className="code-message">
        {notice}
      </p>
    </div>
  )
}
export function ExplorationPanel({
  save,
  position,
  onMove,
  paused,
  onGather,
}: Props & { onMove: (p: Point) => void; onGather: (id: string) => void }) {
  const world = save.worlds[save.map]
  const sites = useMemo(
    () => landscape(save.map, world.seed),
    [save.map, world.seed],
  )
  return (
    <section className="panel exploration-panel">
      <div className="section-top">
        <h3>山野手记</h3>
        <span>
          64 × 64 · {position.x}, {position.y}
        </span>
      </div>
      <p className="inventory-note">
        点击地图采集点即可采集，所得放入收获栏。休息到次日后恢复。钓鱼进度在地图右上角。
      </p>
      <div className="region-grid">
        {[
          { name: '旧庄园', x: 16, y: 22 },
          { name: '野外池塘', x: 41, y: 40 },
          ...sites.regions,
        ].map((p) => (
          <button key={p.name} disabled={paused} onClick={() => onMove(p)}>
            {p.name}
          </button>
        ))}
      </div>
      <svg
        className="exploration-overview"
        viewBox="0 0 64 64"
        role="img"
        aria-label="全图总览，绿点为采集点，红点为当前位置"
      >
        <rect width="64" height="64" rx="2" fill="#c8d0ac" />
        <rect x="1" y="1" width="31" height="31" fill="#e1d6ac" />
        <path d="M42 38h8v6h-8z" fill="#85aaa8" />
        {sites.resources
          .filter((p) => world.gathered[p.id] !== save.day)
          .map((p) => (
            <circle key={p.id} cx={p.x} cy={p.y} r=".7" fill="#608154" />
          ))}
        <circle cx={position.x} cy={position.y} r="1.3" fill="#b65f50" />
      </svg>
      <details>
        <summary>采集地点</summary>
        {sites.resources
          .filter((p) => world.gathered[p.id] !== save.day)
          .map((p) => (
            <button
              className="gather-destination"
              key={p.id}
              disabled={paused}
              onClick={() => onGather(p.id)}
            >
              {materials[p.kind].name} · {p.x},{p.y}
            </button>
          ))}
      </details>
    </section>
  )
}
