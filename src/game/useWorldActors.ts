import { useEffect, useRef, useState } from 'react'
import { pairActions } from './pairActions'
import { blocked, isFood } from './state'
type Point = { x: number; y: number }
type Attack = {
  x: number
  y: number
  target: 'player' | 'companion'
  age: number
  hit: boolean
}
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
// A short breadth-first walk lets the companion go around cabins and fences.
function followStep(
  start: Point,
  player: Point,
  map: number,
  avoid?: Point,
): Point {
  const goals = [
    { x: player.x + 1, y: player.y },
    { x: player.x - 1, y: player.y },
    { x: player.x, y: player.y + 1 },
    { x: player.x, y: player.y - 1 },
  ].filter((p) => !blocked(p.x, p.y, map) && (!avoid || distance(p, avoid) > 0))
  const goal =
    goals.find((p) => p.x === start.x && p.y === start.y && p.y === player.y) ||
    goals[0]
  if (!goal || distance(start, goal) === 0) return start
  const queue = [{ ...start, first: start }]
  const visited = new Set([`${start.x},${start.y}`])
  for (let index = 0; index < queue.length; index++) {
    const point = queue[index]
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = { x: point.x + dx, y: point.y + dy }
      const key = `${next.x},${next.y}`
      if (
        visited.has(key) ||
        blocked(next.x, next.y, map) ||
        (avoid && distance(next, avoid) === 0) ||
        distance(next, player) === 0
      )
        continue
      const first = index === 0 ? next : point.first
      if (distance(next, goal) === 0) return first
      visited.add(key)
      queue.push({ ...next, first })
    }
  }
  return start
}
export function useWorldActors({
  position,
  character,
  map,
  paused,
  busy = false,
  onMove,
  onReaction,
  decor,
  onEat,
  ownedActions = [],
  pairRequest,
}: {
  ownedActions?: number[]
  pairRequest?: { id: number; nonce: number } | null
  character: 'wolf' | 'fox'
  decor: Record<string, number>
  onEat: (key: string, kind: number, map: number) => void
  position: Point
  map: number
  paused: boolean
  busy?: boolean
  onMove: (point: Point) => void
  onReaction: (text: string) => void
}) {
  const [actors, setActors] = useState({
    companion: { x: 19, y: 20 },
    walking: false,
    idle: 'rest',
    idleAge: 0,
    pairOffset: { x: 0, y: 0 },
    stillTicks: 0,
    previousPlayer: position,
    facingRight: false,
    eating: null as string | null,
    eatingAge: 0,
    tick: 0,
    attack: null as Attack | null,
    protecting: false,
  })
  const pending = useRef(pairRequest)
  const collection = useRef(ownedActions)
  useEffect(() => { collection.current = ownedActions }, [ownedActions])
  useEffect(() => { pending.current = pairRequest }, [pairRequest])
  const simulation = useRef(actors)
  const current = useRef({ position, onMove, onReaction, decor, onEat })
  useEffect(() => {
    current.current = { position, onMove, onReaction, decor, onEat }
  }, [position, onMove, onReaction, decor, onEat])
  useEffect(() => {
    const initial = {
      companion: { x: 19, y: 20 },
      walking: false,
      idle: 'rest',
      idleAge: 0,
      pairOffset: { x: 0, y: 0 },
      stillTicks: 0,
      previousPlayer: current.current.position,
      facingRight: false,
      eating: null as string | null,
      eatingAge: 0,
      tick: 0,
      attack: null as Attack | null,
      protecting: false,
    }
    simulation.current = initial
    setActors(initial)
  }, [map, character])
  useEffect(() => {
    if (paused) return
    // Effects outside the state updater keep reactions and knockback single-shot.
    let state = simulation.current
    const timer = setInterval(() => {
      if (document.hidden) return
      const {
        position: player,
        onMove: move,
        onReaction: react,
      } = current.current
      let { companion, attack } = state
      const tick = state.tick + 1
      const moved = distance(player, state.previousPlayer) > 0
      const stillTicks = moved ? 0 : state.stillTicks + 1
      let idle = state.idle
      let idleAge = state.idleAge + 1
      const together =
        distance(player, companion) <= 1.5 && player.y === companion.y
      if (idle.startsWith('pair-') && (moved || busy || idleAge >= pairActions[Number(idle.slice(5))].duration)) {
        idle = 'rest'
        idleAge = 0
      }
      if (pending.current && together && stillTicks >= 3 && !busy) {
        idle = `pair-${pending.current.id}`
        idleAge = 0
        pending.current = null
      }
      if (
        idle === 'head' &&
        ((character === 'fox' && moved) || (idleAge >= 8 && stillTicks >= 3))
      ) {
        idle = 'rest'
        idleAge = 0
        // A rider always lands on a free neighbouring tile.
        if (character === 'wolf') companion = followStep(player, player, map)
      }
      if (
        idle !== 'head' && !idle.startsWith('pair-') &&
        (idleAge > (idle === 'nap' ? 48 : idle === 'chase' ? 36 : 24) ||
          ((moved || busy) && ['hug', 'lean', 'cuddle', 'drink', 'nap', 'chase'].includes(idle)))
      ) {
        idle = 'rest'
        idleAge = 0
      }
      if (tick % 40 === 12 && idle === 'rest' && !busy) {
        const choices =
          together && stillTicks >= 3
            ? ['head', 'hug', 'lean', 'cuddle', 'drink', 'nap', 'chase', ...collection.current.map((id) => `pair-${id}`), 'rest']
            : [character === 'wolf' ? 'hop' : 'sleep', 'rest']
        idle = choices[Math.floor(Math.random() * choices.length)]
        if (
          idle === 'chase' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
          idle = 'nap'
        idleAge = 0
      }
      // Shared, temporary staging keeps idle play away from blocked tiles and
      // leaves the player's saved position and farming actions untouched.
      let pairOffset = idle === 'chase' ? state.pairOffset : { x: 0, y: 0 }
      if (idle === 'chase' && idleAge % 2 === 0) {
        const steps = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ]
          .map((step) => ({
            x: pairOffset.x + step.x,
            y: pairOffset.y + step.y,
          }))
          .filter(
            (offset) =>
              Math.abs(offset.x) <= 3 &&
              Math.abs(offset.y) <= 2 &&
              !blocked(player.x + offset.x, player.y + offset.y, map) &&
              !blocked(companion.x + offset.x, companion.y + offset.y, map),
          )
        const returning = idleAge >= 28
        const candidates = returning
          ? steps.filter(
              (offset) =>
                Math.abs(offset.x) + Math.abs(offset.y) <
                Math.abs(pairOffset.x) + Math.abs(pairOffset.y),
            )
          : steps
        pairOffset =
          candidates[Math.floor(Math.random() * candidates.length)] ||
          pairOffset
      }
      const food = Object.entries(current.current.decor)
        .filter(([key, kind]) => {
          const [x, y] = key.split(',').map(Number)
          return isFood(kind) && !blocked(x, y, map)
        })
        .sort(([a], [b]) => {
          const point = (key: string) => {
            const [x, y] = key.split(',').map(Number)
            return { x, y }
          }
          return distance(companion, point(a)) - distance(companion, point(b))
        })[0]
      let eating: string | null = null
      let eatingAge = 0
      let protecting = false
      let walking = false
      if (map === 3 && tick % 100 === 70) {
        const target = Math.floor(tick / 100) % 2 ? 'companion' : 'player'
        const point = target === 'player' ? player : companion
        attack = { x: point.x + 3, y: point.y, target, age: 0, hit: false }
      }
      if (attack) {
        attack = { ...attack, age: attack.age + 1 }
        const victim = attack.target === 'player' ? player : companion
        const d = distance(attack, victim)
        if (!attack.hit && d > 0.8) {
          attack.x += ((victim.x - attack.x) / d) * 0.5
          attack.y += ((victim.y - attack.y) / d) * 0.5
        } else if (!attack.hit) {
          const retreat =
            [
              { x: victim.x - 1, y: victim.y },
              { x: victim.x, y: victim.y + 1 },
              { x: victim.x + 1, y: victim.y },
              { x: victim.x, y: victim.y - 1 },
            ].find((p) => !blocked(Math.round(p.x), Math.round(p.y), map)) ||
            victim
          if (attack.target === 'player') move(retreat)
          else companion = retreat
          attack.hit = true
          // The partner takes the vacated tile, between the creature and its target.
          const guard =
            distance(retreat, victim) > 0
              ? victim
              : [
                  { x: victim.x + 1, y: victim.y },
                  { x: victim.x, y: victim.y + 1 },
                  { x: victim.x - 1, y: victim.y },
                ].find((p) => !blocked(p.x, p.y, map))
          if (guard) {
            if (attack.target === 'player') companion = guard
            else move(guard)
          }
          react(
            attack.target === 'player'
              ? '别怕，我挡在你前面。我们都好好的。'
              : '你挡在我前面了……有你在，真好。',
          )
        }
        if (attack.hit) {
          protecting = true
          attack.x += 0.3
        }
        if (attack.age > 16) attack = null
      } else if (idle === 'head') {
        if (character === 'wolf') companion = player
      } else if (food) {
        const [key, kind] = food
        const [x, y] = key.split(',').map(Number)
        const target = { x, y }
        if (distance(companion, target) <= 1) {
          eating = key
          eatingAge = state.eating === key ? state.eatingAge + 1 : 1
          if (eatingAge >= 8) {
            current.current.onEat(key, kind, map)
            eating = null
          }
        } else {
          const next = followStep(companion, target, map, player)
          walking = distance(next, companion) > 0
          companion = next
        }
      } else if (
        !idle.startsWith('pair-') && !['drink', 'hug', 'lean', 'cuddle', 'hop', 'sleep', 'nap', 'chase'].includes(idle)
      ) {
        const next = followStep(companion, player, map)
        walking = distance(next, companion) > 0
        companion = next
      }
      if (attack || (food && idle !== 'head')) {
        idle = 'rest'
        idleAge = 0
        pairOffset = { x: 0, y: 0 }
      }
      const facingRight =
        eating && food && Number(food[0].split(',')[0]) !== companion.x
          ? Number(food[0].split(',')[0]) > companion.x
          : companion.x === state.companion.x
            ? state.facingRight
            : companion.x > state.companion.x
      state = {
        companion,
        walking,
        idle,
        idleAge,
        pairOffset,
        stillTicks,
        previousPlayer: player,
        tick,
        attack,
        protecting,
        facingRight,
        eating,
        eatingAge,
      }
      simulation.current = state
      setActors(state)
    }, 220)
    return () => clearInterval(timer)
    // The interval reads current player callbacks through the ref; actor state is its local simulation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, paused, character, busy])
  return {
    ...actors,
    close:
      distance(position, actors.companion) <= 1.5 &&
      position.y === actors.companion.y &&
      !actors.attack,
  }
}
