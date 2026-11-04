import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animal,
  Character,
  House,
  Plant,
  Tree,
  Crow,
  Coffin,
  Decoration,
  WinePot,
} from './art'
import {
  JiangnanBuilding,
  Lotus,
  Meadow,
  ShadowCreature,
  SpeechBubble,
  Weapon,
} from './scenery'
import { landscape, materials, ponds, fishKinds } from './exploration'
import { useWorldActors } from './useWorldActors'
import { blocked, crops, maps, type Save } from './state'
export function World({
  save,
  now,
  grid,
  onTile,
  onHouse,
  onAnimal,
  position,
  paused,
  companionSpeech,
  onMove,
  onReaction,
  onEat,
  onFishStart,
  onFishCaught,
  onGather,
}: {
  onGather: (id: string) => void
  onFishStart: () => boolean
  onFishCaught: (kind: number) => void
  onEat: (key: string, kind: number, map: number) => void
  save: Save
  now: number
  grid: boolean
  onTile: (x: number, y: number) => void
  onHouse: () => void
  onAnimal: (i: number) => void
  companionSpeech: string
  onMove: (point: { x: number; y: number }) => void
  onReaction: (text: string) => void
  paused: boolean
  position: { x: number; y: number }
}) {
  type Fishing = { x: number; y: number; map: number; ticks: number }
  const [fishing, setFishing] = useState<Fishing | null>(null)
  const [fishingNotice, setFishingNotice] = useState('点击池边小鱼开始钓鱼')
  const actors = useWorldActors({
    position,
    character: save.character,
    map: save.map,
    paused,
    busy: !!fishing,
    onMove,
    onReaction,
    decor: save.worlds[save.map].decor,
    onEat,
  })
  const fishingRef = useRef<Fishing | null>(null)
  const caught = useRef(onFishCaught)
  useEffect(() => {
    caught.current = onFishCaught
  }, [onFishCaught])
  const cast = (p: { x: number; y: number }) => {
    if (paused) return
    if (fishingRef.current) {
      fishingRef.current = null
      setFishing(null)
      setFishingNotice('已收竿')
      return
    }
    if (!onFishStart()) {
      setFishingNotice('体力不足，回小屋休息吧')
      return
    }
    onMove(p)
    const next = { ...p, map: save.map, ticks: 0 }
    fishingRef.current = next
    setFishing(next)
  }
  useEffect(() => {
    const active = fishingRef.current
    if (!active) return
    if (
      active.map !== save.map ||
      active.x !== position.x ||
      active.y !== position.y
    ) {
      fishingRef.current = null
      setFishing(null)
      setFishingNotice('已收竿，换个地方逛逛')
      return
    }
    if (paused) return
    const timer = setInterval(() => {
      if (document.hidden || !fishingRef.current) return
      const next = {
        ...fishingRef.current,
        ticks: fishingRef.current.ticks + 1,
      }
      if (next.ticks >= 5) {
        fishingRef.current = null
        setFishing(null)
        const roll = Math.random()
        const kind = roll < 0.55 ? 0 : roll < 0.87 ? 1 : 2
        setFishingNotice(`钓到${fishKinds[kind].name}，已放入收获栏`)
        caught.current(kind)
      } else {
        fishingRef.current = next
        setFishing(next)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [!!fishing, paused, save.map, position.x, position.y])
  const svg = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number[] | null>(null)
  const map = maps[save.map]
  const world = save.worlds[save.map]
  const terrain = useMemo(
    () => landscape(save.map, world.seed),
    [save.map, world.seed],
  )
  const camera = {
    x: Math.max(0, Math.min(512, position.x * 16 - 320)),
    y: Math.max(0, Math.min(512, position.y * 16 - 360)),
  }
  const [walking, setWalking] = useState(false)
  const [facingRight, setFacingRight] = useState(false)
  const kissing =
    actors.close &&
    !walking &&
    !actors.walking &&
    actors.idle === 'rest' &&
    !actors.eating &&
    actors.tick % 60 >= 12 &&
    actors.tick % 60 < 22
  const drinking =
    actors.close && !walking && !actors.walking && actors.idle === 'drink'
  const side = actors.companion.x >= position.x ? 1 : -1
  // One tile backwards each; only stage the interaction when both landing tiles are free.
  const canDrink =
    drinking &&
    !blocked(position.x - side, position.y, save.map) &&
    !blocked(actors.companion.x + side, actors.companion.y, save.map)
  const riding = actors.idle === 'head' && !actors.attack && !actors.eating
  const hugging = actors.idle === 'hug' && actors.close && !walking
  const napping = actors.idle === 'nap' && !walking && !actors.eating
  const chasing = actors.idle === 'chase' && !walking && !actors.eating
  const pairOffset = chasing ? actors.pairOffset : { x: 0, y: 0 }
  const foxPlayer = save.character === 'fox'
  const playerX =
    riding && foxPlayer
      ? actors.companion.x
      : position.x - (canDrink ? side : 0)
  const playerY = riding && foxPlayer ? actors.companion.y : position.y
  const companionY = riding && !foxPlayer ? position.y : actors.companion.y
  const companionX =
    riding && !foxPlayer
      ? position.x
      : actors.companion.x + (canDrink ? side : 0)
  const previous = useRef({ ...position, map: save.map })
  useEffect(() => {
    const moved =
      previous.current.map === save.map &&
      (previous.current.x !== position.x || previous.current.y !== position.y)
    if (moved && position.x !== previous.current.x)
      setFacingRight(position.x > previous.current.x)
    previous.current = { ...position, map: save.map }
    setWalking(moved && !paused)
    const timer = setTimeout(() => setWalking(false), 260)
    return () => clearTimeout(timer)
  }, [position.x, position.y, save.map, paused])
  // Stable seeded scenery keeps offline saves in the same landscape on every visit.
  const scenery = useMemo(() => {
    let seed = 7919 * (save.map + 1)
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    return Array.from({ length: 160 }, () => ({
      x: 8 + random() * 468,
      y: 8 + random() * 460,
    }))
  }, [save.map])
  const treePoints = scenery.filter(
    (p) => p.x < 55 || p.x > 448 || p.y < 35 || p.y > 465,
  )
  const layouts = [
    {
      house: 'translate(96 62)',
      pen: 'translate(0 0)',
      road: 'M155 145H175V372H286V355H320V408H140V220H155Z',
      field: [180, 230, 156, 107],
    },
    {
      house: 'translate(256 110) scale(.9)',
      pen: 'translate(-128 -36) scale(.85)',
      road: 'M285 173H310V222H165V389H340V410H142V202H285Z',
      field: [172, 240, 164, 96],
    },
    {
      house: 'translate(100 64)',
      pen: 'translate(-4 2)',
      road: 'M150 140H174V205H355V225H174V410H150Z',
      field: [184, 240, 140, 112],
    },
    {
      house: 'translate(256 110) scale(.9)',
      pen: 'translate(-128 -36) scale(.85)',
      road: 'M286 173H310V380H148V356H286V225H150V205H286Z',
      field: [180, 236, 148, 100],
    },
    {
      house: 'translate(96 62)',
      pen: 'translate(0 6)',
      road: 'M143 143H166V350H214V390H340V412H192V374H143Z',
      field: [176, 232, 160, 112],
    },
  ]
  const layout = layouts[save.map]
  const waterPaths = [
    'M512 311h-61v16h-36v17h-24v23h-18v34h-10v59h17v52h132z',
    'M512 355H464V337H416V355H384V388H370V442H390V475H448V512H512Z',
    'M403 0h109v512H382v-77h21v-98h-26v-80h27v-86h-20V80h19z',
    'M512 400H472V352H432V325H400V340H380V388H397V432H430V465H480V512H512Z',
    'M425 344H470V360H490V405H475V430H428V417H400V380H412V360H425Z',
  ]
  const playerActor = (
    <g
      key={`player-${save.map}`}
      transform={`translate(${(playerX + pairOffset.x) * 16 - 8} ${(playerY + pairOffset.y) * 16 - 16 - (riding && foxPlayer ? 27 : 0)})`}
      className="player"
    >
      <g
        className={`actor-idle ${riding && foxPlayer ? 'actor-head-hop' : ''} ${kissing ? 'actor-kiss' : ''} ${napping ? 'idle-sleep' : chasing ? 'idle-chase' : ''}`}
      >
        <g
          transform={
            (
              actors.close && !walking
                ? actors.companion.x >= position.x
                : facingRight
            )
              ? 'translate(34 0) scale(-1 1)'
              : undefined
          }
        >
          <Character
            fox={foxPlayer}
            walking={walking || chasing}
            embracing={hugging && !foxPlayer}
          />
        </g>
      </g>
      {!napping && (walking || actors.tick % 40 < 13) && (
        <SpeechBubble fox={save.character === 'fox'} />
      )}
    </g>
  )
  const companionActor = (
    <g
      key="companion"
      transform={`translate(${(companionX + pairOffset.x) * 16 - 8} ${(companionY + pairOffset.y) * 16 - 16 - (riding && !foxPlayer ? 27 : 0)})`}
      className={`companion ${riding && !foxPlayer ? 'player' : 'companion-moving'}`}
    >
      <g
        className={`actor-idle ${riding && !foxPlayer ? 'actor-head-hop' : actors.eating ? 'actor-eating' : !actors.walking && !actors.attack ? `idle-${actors.idle}` : ''} ${kissing ? 'actor-kiss' : ''} ${napping ? 'idle-sleep' : chasing ? 'idle-chase' : ''}`}
      >
        <g
          transform={
            (
              actors.close && !actors.walking && !actors.eating
                ? actors.companion.x < position.x
                : actors.facingRight
            )
              ? 'translate(34 0) scale(-1 1)'
              : undefined
          }
        >
          <Character
            fox={save.character !== 'fox'}
            walking={(actors.walking && !riding) || chasing}
            embracing={hugging && foxPlayer}
          />
        </g>
      </g>
      {!napping &&
        (companionSpeech ||
          actors.eating ||
          actors.walking ||
          actors.tick % 40 < 13) && (
          <SpeechBubble
            fox={save.character !== 'fox'}
            text={companionSpeech || (actors.eating ? '好吃！' : undefined)}
          />
        )}
    </g>
  )
  return (
    <>
      <svg
        ref={svg}
        viewBox={`${camera.x} ${camera.y} 512 512`}
        preserveAspectRatio="none"
        className={`world-svg${paused ? ' world-paused' : ''}`}
        role="img"
        aria-label={`${map.name}，64乘64格庄园与野外，点击地块使用工具`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setHover([
            Math.floor(
              (camera.x + ((e.clientX - r.left) / r.width) * 512) / 16,
            ),
            Math.floor(
              (camera.y + ((e.clientY - r.top) / r.height) * 512) / 16,
            ),
          ])
        }}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          onTile(
            Math.floor(
              (camera.x + ((e.clientX - r.left) / r.width) * 512) / 16,
            ),
            Math.floor(
              (camera.y + ((e.clientY - r.top) / r.height) * 512) / 16,
            ),
          )
        }}
        shapeRendering="crispEdges"
      >
        <defs>
          <clipPath id="water-surface">
            <path d={waterPaths[save.map]} />
          </clipPath>
          <clipPath id="land-surface">
            <path
              d={`M0 0H512V512H0Z ${waterPaths[save.map]}`}
              clipRule="evenodd"
              fillRule="evenodd"
            />
          </clipPath>
          <pattern
            id="grass"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <rect width="32" height="32" fill={map.color} />
            <path
              d="M5 9h2v2H5zm18 14h2v2h-2zM13 29h3v1h-3"
              fill={save.map === 4 ? '#c9ad74' : '#8fa96a'}
              opacity=".55"
            />
            <path d="M12 4h2v3h-2zm16 12h2v2h-2z" fill="#e5e8a4" opacity=".4" />
          </pattern>
          <pattern
            id="water"
            width="30"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <rect width="30" height="25" fill={map.water} />
            <path d="M2 7h12v2H2zm17 12h9v2h-9z" fill="#c4d5bd" opacity=".55" />
          </pattern>
          <pattern
            id="grid"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M16 0H0v16"
              fill="none"
              stroke="#61754e"
              strokeWidth=".4"
              opacity=".25"
            />
          </pattern>
        </defs>
        <rect width="1024" height="1024" fill="url(#grass)" />
        <g pointerEvents="none">
          {terrain.regions.map((p, i) => (
            <g key={p.name}>
              <rect
                x={p.x * 16 - 55}
                y={p.y * 16 - 45}
                width="140"
                height="105"
                rx="12"
                fill={
                  save.map === 3
                    ? '#b8beb4'
                    : save.map === 4
                      ? '#cbb07c'
                      : i % 2
                        ? '#b5c38b'
                        : '#8fa678'
                }
                opacity=".25"
              />
              <text
                x={p.x * 16}
                y={p.y * 16 - 54}
                textAnchor="middle"
                fontSize="11"
                fill="#5b6c58"
                opacity=".8"
              >
                {p.name}
              </text>
            </g>
          ))}
          <path
            d="M512 260H880V280H532V870H260V850H512z"
            fill="#d6c69b"
            opacity=".65"
          />
          <path
            d="M672 608h128v96H672z"
            fill={map.water}
            stroke="#d4cd9e"
            strokeWidth="8"
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g
              key={i}
              transform={`translate(${690 + (i % 3) * 38} ${630 + Math.floor(i / 3) * 44})`}
            >
              <path
                className="water-ripple"
                d="M0 0h22m-10 8h15"
                stroke="#c8d8c4"
                strokeWidth="2"
              />
              {save.map === 2 && <Lotus />}
            </g>
          ))}
          {save.map === 2 && <path d="M320 224h104v64H320z" fill="#d3c5a0" />}
          {terrain.scenery.map((p, i) => (
            <g
              key={i}
              transform={`translate(${p.x * 16} ${p.y * 16}) scale(.8)`}
            >
              {save.map === 1 ? (
                <Meadow flower variant={i} />
              ) : (
                <Tree
                  bamboo={save.map === 0}
                  desert={save.map === 4}
                  pale={save.map === 3}
                />
              )}
            </g>
          ))}
        </g>
        <path
          d={waterPaths[save.map]}
          fill="url(#water)"
          stroke="#c4c794"
          strokeWidth="12"
        />
        <g clipPath="url(#water-surface)" pointerEvents="none">
          {scenery.slice(0, 55).map((p, i) => (
            <g key={`ripple-${i}`} transform={`translate(${p.x} ${p.y})`}>
              <path
                className={`water-ripple ripple-${i % 3}`}
                d="M-14 0h12m5 0h12m-20 5h13"
                stroke="#d4e5d1"
                strokeWidth="1.5"
                fill="none"
              />
            </g>
          ))}
          {(save.map === 2
            ? Array.from({ length: 14 }, (_, i) => ({
                x: 405 + (i % 3) * 31,
                y: 145 + Math.floor(i / 3) * 72,
              }))
            : [
                { x: 425, y: 388 },
                { x: 450, y: 414 },
              ]
          ).map((p, i) => (
            <g key={`lotus-${i}`} transform={`translate(${p.x} ${p.y})`}>
              <Lotus />
            </g>
          ))}
        </g>
        {save.map === 1 && (
          <g pointerEvents="none" clipPath="url(#land-surface)">
            {scenery.map((p, i) => (
              <g key={`meadow-${i}`} transform={`translate(${p.x} ${p.y})`}>
                <Meadow flower={i % 3 !== 0} variant={i} />
              </g>
            ))}
          </g>
        )}
        {save.map === 2 && (
          <g pointerEvents="none">
            <g transform="translate(408 12) scale(.9)">
              <path d="M-5 95h95v33H-5z" fill="#bdb79a" />
              <JiangnanBuilding tower />
              <text
                x="42"
                y="125"
                textAnchor="middle"
                fontSize="9"
                fill="#526858"
              >
                雷峰塔
              </text>
            </g>
            {[
              { x: 430, y: 182 },
              { x: 400, y: 244 },
              { x: 444, y: 306 },
              { x: 405, y: 415 },
              { x: 22, y: 344 },
              { x: 22, y: 410 },
            ].map((p, i) => (
              <g
                key={`street-${i}`}
                transform={`translate(${p.x} ${p.y}) scale(.85)`}
              >
                <path d="M-3 45h73v13H-3z" fill="#bbb59b" />
                <JiangnanBuilding />
              </g>
            ))}
            <path
              d="M372 286h70v12h-70zM370 278v12m12-12v12m12-12v12m12-12v12m12-12v12m12-12v12m12-12v12"
              stroke="#c7b891"
              strokeWidth="3"
              fill="#b9ac88"
            />
          </g>
        )}
        <path d={layout.road} fill="#e4d5a4" stroke="#d8ca96" strokeWidth="5" />
        {Array.from({ length: 100 }, (_, i) => (
          <rect
            key={'stone' + i}
            x={scenery[i].x}
            y={scenery[i].y}
            width={(i % 3) + 2}
            height="2"
            fill="#dbe1a4"
            opacity=".7"
          />
        ))}
        <g
          transform={layout.house}
          role="button"
          tabIndex={0}
          aria-label="进入小木屋"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onHouse()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onHouse()
          }}
          className="map-object"
        >
          <House color={world.room} />
          <text
            x="54"
            y="83"
            textAnchor="middle"
            fill="#516445"
            fontSize="9"
            className="map-label"
          >
            我们的小木屋
          </text>
        </g>
        <g>
          <rect
            x={layout.field[0]}
            y={layout.field[1]}
            width={layout.field[2]}
            height={layout.field[3]}
            fill="#a48155"
          />
          <rect
            x={layout.field[0] + 4}
            y={layout.field[1] + 4}
            width={layout.field[2] - 8}
            height={layout.field[3] - 8}
            fill="#b49163"
          />
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d={`M${layout.field[0] + 5} ${layout.field[1] + 10 + i * 14}h${layout.field[2] - 10}`}
              stroke="#9b794e"
              strokeWidth="2"
            />
          ))}
          {Object.entries(world.crops).map(([key, c]) => {
            const [x, y] = key.split(',').map(Number)
            const mature =
              c.watered && now - c.planted >= crops[c.kind].time * 1000
            return (
              <g key={key} transform={`translate(${x * 16} ${y * 16 - 6})`}>
                <rect
                  y="6"
                  width="16"
                  height="16"
                  fill={c.watered ? '#866d4c' : '#a17e51'}
                />
                <Plant kind={c.kind} stage={mature ? 2 : c.watered ? 1 : 0} />
                {mature && (
                  <path
                    className="sparkle"
                    d="M14 0v6m-3-3h6"
                    stroke="#fff2b7"
                  />
                )}
              </g>
            )
          })}
        </g>
        <g transform={layout.pen}>
          <g stroke="#b59c71" strokeWidth="3">
            <path d="M264 99h112v97H264M264 115h112m-96-16v97m16-97v97m16-97v97m16-97v97m16-97v97m16-97v97M264 181h112" />
            <path d="M264 99v97h112" />
          </g>
          <g fill="#ddc796">
            {[264, 280, 296, 312, 328, 344, 360, 376].map((x) => (
              <rect key={x} x={x - 2} y="94" width="5" height="10" />
            ))}
          </g>
          {world.animals.map((a, i) => (
            <g
              key={i}
              className="animal map-object"
              transform={`translate(${281 + (i % 4) * 22} ${124 + Math.floor(i / 4) * 23 + (i % 2) * 10})`}
              role="button"
              tabIndex={0}
              aria-label={`照料${a.kind === 0 ? '小鸡' : a.kind === 1 ? '小兔' : '小绵羊'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAnimal(i)
              }}
              onClick={(e) => {
                e.stopPropagation()
                onAnimal(i)
              }}
            >
              <Animal kind={a.kind} />
              {a.fed === save.day && (
                <text x="7" y="-4" fill="#b56e65" fontSize="12">
                  ♥
                </text>
              )}
            </g>
          ))}
          <g transform="translate(260 167)">
            <path d="M0 0h17v10H0z" fill="#9b7950" />
            <path d="M2 2h13v4H2z" fill="#c6b880" />
          </g>
        </g>
        {save.map !== 1 &&
          treePoints
            .filter(
              (p) => save.map !== 2 || (p.x < 345 && p.y < 260 && p.y > 160),
            )
            .map((p, i) => (
              <g
                key={'tree' + i}
                transform={`translate(${p.x} ${p.y}) scale(${i % 3 === 0 ? 1.3 : 1})`}
              >
                <Tree
                  bamboo={save.map === 0}
                  desert={save.map === 4}
                  grave={false}
                  pale={save.map === 3}
                />
                {save.map === 3 && i % 9 === 0 && i < 28 && (
                  <g transform="translate(10 4) scale(.7)">
                    <Crow />
                  </g>
                )}
              </g>
            ))}
        {save.map === 3 && (
          <g pointerEvents="none">
            {[
              { x: 90, y: 285 },
              { x: 344, y: 344 },
              { x: 195, y: 432 },
              { x: 276, y: 450 },
              { x: 340, y: 211 },
            ].map((p, i) => (
              <g key={`weapon-${i}`} transform={`translate(${p.x} ${p.y})`}>
                <Weapon variant={i} />
              </g>
            ))}
            <g
              transform="translate(817 333) scale(2)"
              aria-label="一口朱红大棺材"
            >
              <Coffin red />
            </g>
            <g className="forest-mist">
              <path
                d="M0 174q120-22 235 2t277-5v16q-140 22-277 0T0 190zM0 420q140-22 280 0t232-7v19q-110 21-232 3T0 438z"
                fill="#d2d9c8"
                opacity=".3"
              />
            </g>
          </g>
        )}
        {scenery
          .filter((p) => p.x < 75 && p.y > 150 && p.y < 300)
          .slice(0, 7)
          .map((p, i) => (
            <g key={'flower' + i} transform={`translate(${p.x} ${p.y})`}>
              <path d="M4 4v12H2V9H0v-2h4" fill="#71934f" />
              <path
                d="M2 1h6v3H2zM0 3h10v4H0zM2 7h6v2H2z"
                fill={i % 2 ? '#f2dfad' : '#e8b6a0'}
              />
              <rect x="4" y="3" width="2" height="3" fill="#cda657" />
            </g>
          ))}
        <g transform="translate(68 221)">
          <path
            d="M0 7h25v6H0zM3 13v16m18-16v16"
            stroke="#92744f"
            strokeWidth="3"
          />
          <path d="M2 0h21v5H2z" fill="#bba074" />
        </g>
        <g transform="translate(205 112)">
          <path d="M2 5h18v13H2z" fill="#9d9b83" />
          <path d="M0 4h23v5H0z" fill="#c6c0a0" />
          <path d="M5 0v-7h12v7" fill="none" stroke="#82795e" strokeWidth="3" />
          <path d="M8 9h7v5H8z" fill="#7f9b96" />
        </g>
        {Object.entries(world.decor).map(([key, kind]) => {
          const [x, y] = key.split(',').map(Number)
          return (
            <g
              key={key}
              transform={`translate(${x * 16} ${y * 16})`}
              className={`placed-decor decor-${kind}`}
            >
              <title>
                {kind >= 12 && kind <= 14
                  ? '伙伴会过来吃鱼'
                  : '移动模式点击家具可互动，装饰模式点击可收回'}
              </title>
              <Decoration kind={kind} />
            </g>
          )
        })}
        {(riding && foxPlayer) || (hugging && foxPlayer)
          ? [companionActor, playerActor]
          : [playerActor, companionActor]}
        {(actors.idle === 'sleep' || napping) && !actors.eating && (
          <text
            x={companionX * 16 + 12}
            y={companionY * 16 - 15}
            className="sleep-bubble"
            fill="#fff3d7"
            fontSize="12"
          >
            z Z
          </text>
        )}
        {napping && (
          <text
            x={playerX * 16 + 10}
            y={playerY * 16 - 18}
            className="sleep-bubble"
            fill="#fff3d7"
            fontSize="12"
            pointerEvents="none"
            aria-label="晏咪和奚咪一起睡觉"
          >
            z Z
          </text>
        )}
        {canDrink && (
          <g
            transform={`translate(${(position.x + actors.companion.x) * 8} ${position.y * 16 - 4})`}
            pointerEvents="none"
            aria-label="一起喝酒"
          >
            <WinePot />
          </g>
        )}
        {kissing && (
          <g
            transform={`translate(${(position.x + actors.companion.x) * 8 + 3} ${(position.y + actors.companion.y) * 8 - 28})`}
            pointerEvents="none"
          >
            <path
              className="kiss-heart"
              d="M0 2h5l2 3 2-3h5v6l-7 5-7-5z"
              fill="#cf8d91"
            />
          </g>
        )}
        {actors.attack && (
          <g
            transform={`translate(${actors.attack.x * 16 - 8} ${actors.attack.y * 16 - 16})`}
            className={`forest-creature ${actors.attack.hit ? 'creature-retreat' : ''}`}
            pointerEvents="none"
          >
            <ShadowCreature />
          </g>
        )}
        {actors.protecting && actors.attack && (
          <g
            transform={`translate(${(actors.attack.target === 'player' ? actors.companion.x : position.x) * 16 - 8} ${(actors.attack.target === 'player' ? actors.companion.y : position.y) * 16 - 16})`}
            pointerEvents="none"
          >
            <path
              d="M-5-4Q15-14 35-4v22Q15 36-5 18z"
              fill="#ece3bd"
              fillOpacity=".12"
              stroke="#e5d5a2"
              strokeWidth="2"
            />
          </g>
        )}
        {[0, 1, 2].map((i) => (
          <g
            key={'butterfly' + i}
            className="sparkle"
            transform={`translate(${95 + i * 120} ${190 + i * 43})`}
          >
            <path
              d="M1 4h4V1h4v6H5v4H1zM11 1h4v3h4v7h-4V7h-4z"
              fill={save.map === 3 ? '#d3d8ae' : i % 2 ? '#f0dab0' : '#e3c0ac'}
            />
            <path d="M9 3h2v7H9z" fill="#7b8663" />
          </g>
        ))}
        <g transform="translate(401 375)">
          <path d="M0 8h15v6H0zM4 4h8v10H4z" fill="#6e9669" />
          <path d="M6 7h3v2H6z" fill="#f4e1b4" />
        </g>
        {terrain.resources
          .filter((p) => world.gathered[p.id] !== save.day)
          .map((p) => (
            <g
              key={p.id}
              className="map-object"
              transform={`translate(${p.x * 16} ${p.y * 16})`}
              role="button"
              tabIndex={0}
              aria-label={`采集${materials[p.kind].name}`}
              onClick={(e) => {
                e.stopPropagation()
                if (!paused) onGather(p.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!paused) onGather(p.id)
                }
              }}
            >
              <path
                d="M8 14V3M8 8 1 3m7 8 7-7"
                stroke="#58734c"
                strokeWidth="2"
              />
              <path
                d="M0 0h6v6H0zm10 1h6v7h-6z"
                fill={
                  save.map === 3
                    ? '#d6ddd0'
                    : p.kind === 10
                      ? '#b97c65'
                      : '#90a45a'
                }
              />
              <title>{materials[p.kind].name} · 点击即可采集</title>
            </g>
          ))}
        {ponds(save.map).map((p, i) => (
          <g
            key={`fish-${i}`}
            className="map-fishing-spot"
            transform={`translate(${p.x * 16} ${p.y * 16})`}
            role="button"
            tabIndex={0}
            aria-label={fishing ? '收起鱼竿' : '点击钓鱼，消耗两点体力'}
            aria-disabled={paused}
            onClick={(e) => {
              e.stopPropagation()
              cast(p)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                cast(p)
              }
            }}
          >
            <title>点击钓鱼 · 体力 2 · 进度在右上角</title>
            <rect x="16" y="3" width="32" height="28" fill="transparent" />
            <g
              transform="translate(22 10) scale(.75)"
              className={
                fishing?.x === p.x && fishing?.y === p.y
                  ? 'fishing-float active'
                  : 'fishing-float'
              }
            >
              <Decoration kind={12} />
            </g>
          </g>
        ))}
        {grid && (
          <rect
            width="1024"
            height="1024"
            fill="url(#grid)"
            pointerEvents="none"
          />
        )}
        {hover && (
          <rect
            x={hover[0] * 16}
            y={hover[1] * 16}
            width="16"
            height="16"
            rx="1"
            fill="#fff7cd"
            fillOpacity=".3"
            stroke={
              blocked(hover[0], hover[1], save.map) ? '#b97763' : '#fff5cf'
            }
            pointerEvents="none"
          />
        )}
      </svg>
      <div className="map-fishing-status">
        <span role="status">
          {fishing
            ? `钓鱼 ${fishing.ticks}/5 · ${paused ? '已暂停' : '等待浮漂…'}`
            : fishingNotice}
        </span>
        {fishing && (
          <button
            disabled={paused}
            onClick={() => {
              fishingRef.current = null
              setFishing(null)
              setFishingNotice('已收竿')
            }}
          >
            收竿
          </button>
        )}
      </div>
    </>
  )
}
