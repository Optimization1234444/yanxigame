import { useEffect, useRef, useState } from 'react'
import type { Save } from './state'
type Point = { x: number; y: number }
// These bounds match the visible desert oasis and the outer rectangular pond.
function inWater(p: Point) {
  if (p.x >= 42 && p.x <= 49 && p.y >= 38 && p.y <= 43) return true
  const polygon = [[425,344],[470,344],[470,360],[490,360],[490,405],[475,405],[475,430],[428,430],[428,417],[400,417],[400,380],[412,380],[412,360],[425,360]]
  const x = p.x * 16, y = p.y * 16
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[i], [bx, by] = polygon[j]
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside
  }
  return inside
}
export function useMummy(save: Save, position: Point, paused: boolean, onMove: (p: Point) => void, onGuard: () => void, onNotice: (text: string) => void) {
  const [mummy, setMummy] = useState<Point | null>(null)
  const [guarding, setGuarding] = useState(false)
  const guardTicks = useRef(0)
  const latest = useRef({ save, position, onMove, onGuard, onNotice })
  useEffect(() => { latest.current = { save, position, onMove, onGuard, onNotice } })
  const simulation = useRef({ point: null as Point | null, ticks: 0, cooldown: 65, guardedDay: 0 })
  useEffect(() => {
    simulation.current = { point: null, ticks: 0, cooldown: 65, guardedDay: latest.current.save.desertGuardDay }
    setMummy(null)
    setGuarding(false)
    guardTicks.current = 0
  }, [save.map])
  useEffect(() => {
    if (paused || save.map !== 4) return
    const timer = setInterval(() => {
      if (document.hidden) return
      const { save: s, position: player, onMove: move, onGuard: guard, onNotice: react } = latest.current
      const state = simulation.current
      state.ticks++
      if (guardTicks.current > 0 && --guardTicks.current === 0) setGuarding(false)
      if (!state.point) {
        if (--state.cooldown > 0) return
        state.point = { x: Math.min(60, player.x + 7), y: player.y }
        react('木乃伊追来了！绕到绿洲另一侧，把它引进水里。')
      }
      const p = state.point
      const d = Math.hypot(player.x - p.x, player.y - p.y)
      const step = Math.min(.32, d)
      const next = d ? { x: p.x + (player.x - p.x) / d * step, y: p.y + (player.y - p.y) / d * step } : p
      if (inWater(next)) {
        state.point = null
        state.cooldown = 120
        react('木乃伊在水中散成了沙。我们安全啦！')
      } else if (d <= .75) {
        if (Math.max(state.guardedDay, s.desertGuardDay) !== s.day) {
          state.guardedDay = s.day
          guard()
          guardTicks.current = 12
          setGuarding(true)
          state.point = { x: Math.min(61, p.x + 5), y: p.y }
          react('同伴替你挡下了致命一击！今天的守护已用完，快把木乃伊引进水里！')
        } else {
          move({ x: 16, y: 22 })
          state.point = null
          state.cooldown = 100
          react('被木乃伊击倒了，已回到出生点。物品和金币都还在；休息到明天可恢复一次同伴守护。')
        }
      } else state.point = next
      setMummy(state.point ? { ...state.point } : null)
    }, 220)
    return () => clearInterval(timer)
  }, [paused, save.map])
  return { mummy, guarding }
}
