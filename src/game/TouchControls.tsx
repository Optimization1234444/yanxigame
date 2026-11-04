import { useEffect, useRef } from 'react'
import { blocked } from './state'

type Point = { x: number; y: number }

export function TouchControls({
  position,
  map,
  paused,
  onMove,
}: {
  position: Point
  map: number
  paused: boolean
  onMove: (point: Point) => void
}) {
  const current = useRef({ position, map, paused, onMove })
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const stop = () => {
    if (timer.current !== null) clearInterval(timer.current)
    timer.current = null
  }
  useEffect(() => {
    current.current = { position, map, paused, onMove }
    if (paused) stop()
  }, [position, map, paused, onMove])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop()
    }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', hide)
    return () => {
      stop()
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [])
  const step = (dx: number, dy: number) => {
    const state = current.current
    if (state.paused || document.hidden) return
    const next = { x: state.position.x + dx, y: state.position.y + dy }
    if (!blocked(next.x, next.y, state.map)) {
      current.current = { ...state, position: next }
      state.onMove(next)
    }
  }
  return (
    <div className="touch-navigation">
      <p>
        按住方向走走<span>搭在头上时，一起出发</span>
      </p>
      <div className="touch-pad" role="group" aria-label="移动方向">
        {[
          { name: '向上', symbol: '↑', dx: 0, dy: -1, area: 'up' },
          { name: '向左', symbol: '←', dx: -1, dy: 0, area: 'left' },
          { name: '向下', symbol: '↓', dx: 0, dy: 1, area: 'down' },
          { name: '向右', symbol: '→', dx: 1, dy: 0, area: 'right' },
        ].map(({ name, symbol, dx, dy, area }) => (
          <button
            key={name}
            style={{ gridArea: area }}
            aria-label={name}
            disabled={paused}
            onPointerDown={(event) => {
              if (event.button !== 0) return
              event.preventDefault()
              stop()
              event.currentTarget.setPointerCapture(event.pointerId)
              step(dx, dy)
              timer.current = setInterval(() => step(dx, dy), 180)
            }}
            onPointerUp={stop}
            onPointerCancel={stop}
            onLostPointerCapture={stop}
            onClick={(event) => {
              if (event.detail === 0) step(dx, dy)
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  )
}
