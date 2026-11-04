import { TouchControls } from '../game/TouchControls'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronRight,
  CircleHelp,
  CloudSun,
  Coins,
  Droplets,
  Flower2,
  Grid2X2,
  Heart,
  House,
  Leaf,
  Map,
  Moon,
  MousePointer2,
  Pause,
  Play,
  Settings,
  ShoppingBasket,
  Sprout,
  Sun,
  Volume2,
  VolumeX,
  Wheat,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Character, Animal, Plant, Decoration } from '@/game/art'
import { Meadow, Weapon } from '@/game/scenery'
import { ExplorationPanel, WildHarvest } from '@/game/ExplorationPanel'
import { Cabin } from '@/game/Cabin'
import { World } from '@/game/World'
import { fishKinds, landscape, materials } from '@/game/exploration'
import {
  blocked,
  decorations,
  indoorFurniture,
  roomSlots,
  isFood,
  crops,
  decodeSave,
  encodeSave,
  initialSave,
  levelOf,
  maps,
  saveSchema,
  type Save,
} from '@/game/state'
export const Route = createFileRoute('/')({ component: Home })
const companionLines = {
  wolf: [
    '……奚咪，过来。',
    '水浇好了。你歇着。',
    '喜欢奚咪。……只说一次。',
    '没等你。只是刚好在这里。',
    '奚咪在，就很好。',
    '手给我。陪你走走。',
  ],
  fox: [
    '晏咪，送你一颗爱心！要不要一起牵手去浇地呀？',
    '最喜欢晏咪啦！今天也要黏在一起种地！',
    '晏咪晏咪，快看！这颗草莓要留给你！',
    '给晏咪发出爱心邀请！一起回小木屋休息吧~',
    '嘿嘿，晏咪话不多，可是一直都在照顾我呢！',
    '今天轮到你浇地了，我负责给晏咪加油！',
  ],
}
function companionLine(character: Save['character']) {
  const lines = companionLines[character === 'wolf' ? 'fox' : 'wolf']
  return lines[Math.floor(Math.random() * lines.length)]
}
const tools = [
  {
    name: '移动',
    icon: MousePointer2,
    key: '1',
    hint: '点击空地移动，也可以使用方向键。',
  },
  {
    name: '播种',
    icon: Sprout,
    key: '2',
    hint: '选择种子，点击空地播种。每次消耗 2 点体力。',
  },
  {
    name: '浇水',
    icon: Droplets,
    key: '3',
    hint: '点击已播种地块浇水，作物才会继续生长。',
  },
  {
    name: '收获',
    icon: Wheat,
    key: '4',
    hint: '点击闪光的成熟作物，收获果实与经验。',
  },
  {
    name: '装饰',
    icon: Flower2,
    key: '5',
    hint: '点击空地放置装饰（15 宋元通宝），再次点击装饰可收回（返还 10 宋元通宝）。',
  },
]
function Home() {
  const [save, setSave] = useState<Save>(initialSave)
  const [ready, setReady] = useState(false)
  const [backupReady, setBackupReady] = useState(false)
  const [tool, setTool] = useState(0)
  const [seed, setSeed] = useState(0)
  const [decor, setDecor] = useState(0)
  const [roomSlot, setRoomSlot] = useState(0)
  const [tab, setTab] = useState('种子')
  const [modal, setModal] = useState<
    'settings' | 'shop' | 'house' | 'help' | null
  >(null)
  const [now, setNow] = useState(Date.now())
  const [grid, setGrid] = useState(false)
  const [paused, setPaused] = useState(false)
  const [sound, setSound] = useState(false)
  const [position, setPosition] = useState({ x: 16, y: 22 })
  const [reactions, setReactions] = useState<string[]>([])
  const previousXp = useRef<number | null>(null)
  function reactToEvent(text: string) {
    setReactions((queue) => [...queue, text].slice(-12))
  }
  function purchaseReaction(item: string) {
    const endings =
      save.character === 'wolf'
        ? ['我们一起摆好它吧！', '嘿嘿，我也好喜欢！', '要和晏咪一起用！']
        : ['……不错。', '我陪你。', '喜欢就好。']
    reactToEvent(
      `你买了${item}吗？${endings[Math.floor(Math.random() * endings.length)]}`,
    )
  }
  const [message, setMessage] = useState('今天轮到你浇地了。')
  const [code, setCode] = useState('')
  const [codeMessage, setCodeMessage] = useState('')
  const [saved, setSaved] = useState(true)
  const [storageOk, setStorageOk] = useState(true)
  const level = levelOf(save.xp)
  const world = save.worlds[save.map]
  const mature = Object.values(world.crops).filter(
    (c) => c.watered && now - c.planted >= crops[c.kind].time * 1000,
  ).length
  useEffect(() => {
    if (!reactions.length) return
    const timer = setTimeout(
      () => setReactions((queue) => queue.slice(1)),
      7000,
    )
    return () => clearTimeout(timer)
  }, [reactions])
  useEffect(() => {
    if (!ready || !backupReady) return
    const before = previousXp.current
    previousXp.current = save.xp
    if (before === null || levelOf(before) >= level) return
    const foxSpeaking = save.character === 'wolf'
    reactToEvent(
      foxSpeaking
        ? `晏咪，升到 Lv.${level} 啦！最喜欢和你一起进步！`
        : `Lv.${level} 了。……做得不错。`,
    )
    const unlocked = [
      ...crops
        .filter((c) => c.level > levelOf(before) && c.level <= level)
        .map((c) => c.name + '种子'),
      ...['原木小屋', '青苔小屋', '暮色小屋'].filter(
        (_, i) => i + 1 > levelOf(before) && i + 1 <= level,
      ),
    ]
    if (unlocked.length)
      reactToEvent(
        `解锁了${unlocked.join('、')}！${foxSpeaking ? '一起试试看吧！' : '选你喜欢的。'}`,
      )
  }, [save.xp, ready, backupReady, level, save.character])
  useEffect(() => {
    let hasLocalSave = false
    try {
      const data = localStorage.getItem('fox-wolf-farm-v1')
      if (data) {
        setSave(saveSchema.parse(JSON.parse(data)))
        hasLocalSave = true
      }
    } catch {
      setMessage('未能读取旧存档，已进入新农场。可在设置中导入储存码。')
    }
    setReady(true)
    if (hasLocalSave) setBackupReady(true)
    else
      fetch('/api/backup', { signal: AbortSignal.timeout(4000) })
        .then(async (response) => {
          if (!response.ok) return
          const data = await response.json()
          const restored = saveSchema.parse(data.save)
          setSave((current) => (current === save ? restored : current))
        })
        .catch(() => {})
        .finally(() => {
          setSave((current) =>
            current === save
              ? {
                  ...current,
                  worlds: current.worlds.map((w) => ({
                    ...w,
                    seed: Math.floor(Math.random() * 4294967294) + 1,
                  })),
                }
              : current,
          )
          setBackupReady(true)
        })
    if ('serviceWorker' in navigator)
      navigator.serviceWorker
        .register('/sw.js')
        .then(async () => {
          const reg = await navigator.serviceWorker.ready
          const urls = Array.from(
            new Set([
              ...performance.getEntriesByType('resource').map((r) => r.name),
              ...Array.from(
                document.querySelectorAll('script[src],link[rel=stylesheet]'),
              ).map(
                (el) => el.getAttribute('src') || el.getAttribute('href') || '',
              ),
            ]),
          ).filter(
            (url) =>
              url && new URL(url, location.href).origin === location.origin,
          )
          reg.active?.postMessage({ type: 'CACHE_ASSETS', urls })
        })
        .catch(() => {})
  }, [])
  useEffect(() => {
    if (!ready) return
    setSaved(false)
    const t = setTimeout(() => {
      try {
        localStorage.setItem('fox-wolf-farm-v1', JSON.stringify(save))
        setSaved(true)
        setStorageOk(true)
      } catch {
        setStorageOk(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [save, ready])
  useEffect(() => {
    if (!ready || !backupReady) return
    const t = setTimeout(() => {
      fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save }),
        credentials: 'same-origin',
      }).catch(() => {})
    }, 2500)
    return () => clearTimeout(t)
  }, [save, ready, backupReady])
  useEffect(() => {
    const t = setInterval(() => {
      if (!paused) setNow(Date.now())
    }, 1000)
    return () => clearInterval(t)
  }, [paused])
  useEffect(() => {
    if (!ready || paused || modal) return
    const timer = setInterval(() => {
      setMessage(companionLine(save.character))
    }, 18000)
    return () => clearInterval(timer)
  }, [ready, paused, modal, save.character, message])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        modal ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      if ('12345'.includes(e.key)) setTool(Number(e.key) - 1)
      const dirs: Record<string, number[]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      }
      const dir = dirs[e.key]
      if (dir && !paused) {
        e.preventDefault()
        setPosition((p) => {
          const x = p.x + dir[0],
            y = p.y + dir[1]
          return blocked(x, y, save.map) ? p : { x, y }
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, paused, save.map])
  function chime() {
    if (!sound) return
    try {
      const audio = new AudioContext()
      const o = audio.createOscillator(),
        g = audio.createGain()
      o.type = 'sine'
      o.frequency.value = 660
      g.gain.setValueAtTime(0.04, audio.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.3)
      o.connect(g).connect(audio.destination)
      o.start()
      o.stop(audio.currentTime + 0.3)
      o.onended = () => {
        void audio.close()
      }
    } catch {
      /* audio is optional */
    }
  }
  function gatherResource(id: string) {
    if (paused || modal !== null) return
    const resource = landscape(save.map, world.seed).resources.find(
      (p) => p.id === id,
    )
    if (!resource || world.gathered[id] === save.day) return
    if (save.energy < 1) {
      setMessage('有点累了，回屋休息后再采集吧。')
      return
    }
    setPosition({ x: resource.x, y: resource.y })
    setSave((s) => {
      const n = structuredClone(s),
        w = n.worlds[n.map]
      if (w.gathered[id] === n.day || n.energy < 1) return s
      w.gathered[id] = n.day
      n.materials[resource.kind] = Math.min(
        1000000,
        n.materials[resource.kind] + 2,
      )
      n.energy--
      n.xp = Math.min(1000000, n.xp + 3)
      return n
    })
    setMessage(`采到${materials[resource.kind].name} ×2，已放入收获栏。`)
  }
  function tile(x: number, y: number) {
    if (paused) {
      setMessage('时光暂停中，点击继续后再照料农场。')
      return
    }
    if (blocked(x, y, save.map)) {
      setMessage('这里留给自然吧，换一块空地试试。')
      return
    }
    if (tool === 0) {
      const placed = world.decor[`${x},${y}`]
      const lines: Record<number, string> = {
        0: '坐一会儿吧，今天的风很舒服。',
        5: '替你倒了一杯茶，慢慢喝。',
        8: '一曲清音，正好弹给你听。',
        15: '风铃响了，听见了吗？',
        16: '石灯亮着，回家的路就在这里。',
        17: '一缕清香，陪你发一会儿呆。',
        18: '来下一局棋吧，这一步让你先。',
        19: '我推你荡秋千，抓稳啦。',
        20: '打开食盒，一起分享今天的点心。',
      }
      if (lines[placed]) {
        reactToEvent(lines[placed])
        const fresh = world.interactions[`${x},${y}`] !== save.day
        setMessage(
          lines[placed] +
            (fresh
              ? ' 体力 +4，经验 +2。'
              : ' 今天已经一起玩过啦，再陪你待一会儿。'),
        )
        if (fresh)
          setSave((s) => {
            const n = structuredClone(s),
              w = n.worlds[n.map],
              key = `${x},${y}`
            if (w.interactions[key] === n.day) return s
            w.interactions[key] = n.day
            n.energy = Math.min(100, n.energy + 4)
            n.xp = Math.min(1000000, n.xp + 2)
            return n
          })
      }
      setPosition({ x, y })
      return
    }
    const key = `${x},${y}`
    const c = world.crops[key]
    if (tool === 1) {
      if (c || world.decor[key] !== undefined) {
        setMessage('这块地已经有东西啦。')
        return
      }
      if (level < crops[seed].level) {
        setMessage(`达到 Lv.${crops[seed].level} 后解锁这份种子。`)
        return
      }
      if (save.seeds[seed] < 1) {
        setMessage('种子不够了，去杂货铺补充一些吧。')
        return
      }
      if (save.energy < 2) {
        setMessage('有点累了，回小屋休息吧。')
        return
      }
      setSave((s) => {
        const n = structuredClone(s)
        n.energy -= 2
        n.seeds[seed]--
        n.worlds[n.map].crops[key] = {
          kind: seed,
          planted: Date.now(),
          watered: false,
        }
        return n
      })
      setMessage(`种下了${crops[seed].name}，记得给它浇水。`)
    }
    if (tool === 2) {
      if (!c) {
        setMessage('先种下一颗种子，再来浇水吧。')
        return
      }
      if (c.watered) {
        setMessage('水分充足，等它慢慢长大吧。')
        return
      }
      if (save.energy < 1) {
        setMessage('回小屋休息一下吧。')
        return
      }
      setSave((s) => {
        const n = structuredClone(s)
        n.energy--
        n.worlds[n.map].crops[key].watered = true
        n.worlds[n.map].crops[key].planted = Date.now()
        return n
      })
      setMessage('咕噜咕噜，喝饱水啦。')
    }
    if (tool === 3) {
      if (!c) {
        setMessage('这块地还没有作物。')
        return
      }
      if (!c.watered || now - c.planted < crops[c.kind].time * 1000) {
        setMessage(
          c.watered ? '还在长大，再耐心等一会儿。' : '作物有点口渴，请先浇水。',
        )
        return
      }
      setSave((s) => {
        const n = structuredClone(s)
        delete n.worlds[n.map].crops[key]
        n.harvest[c.kind]++
        n.xp += 12
        return n
      })
      setMessage(`收获了${crops[c.kind].name}！经验 +12，果实已放入背包。`)
      chime()
    }
    if (tool === 4) {
      if (world.decor[key] !== undefined) {
        setSave((s) => {
          const n = structuredClone(s)
          delete n.worlds[n.map].decor[key]
          n.coins += 10
          return n
        })
        setMessage('装饰已收回，返还 10 宋元通宝。重新布置也很快乐。')
        return
      }
      if (c) {
        setMessage('这块地已有物品，请选一块空地。')
        return
      }
      if (save.coins < 15) {
        setMessage('装饰需要 15 宋元通宝，出售一些收获吧。')
        return
      }
      setSave((s) => {
        const n = structuredClone(s)
        n.coins -= 15
        n.worlds[n.map].decor[key] = decor
        n.xp += 3
        return n
      })
      purchaseReaction(decorations[decor].name)
      setMessage(
        isFood(decor)
          ? '点心放好啦，等伙伴过来尝一口。'
          : '又多了一个喜欢的小角落。',
      )
    }
  }
  function feed(i: number) {
    if (paused) return
    if (world.animals[i].fed === save.day) {
      setMessage('今天已经吃饱啦，明天再来看看它吧。')
      return
    }
    if (save.coins < 3) {
      setMessage('饲料需要 3 宋元通宝。')
      return
    }
    setSave((s) => {
      const n = structuredClone(s)
      n.coins += 7
      n.xp += 8
      n.worlds[n.map].animals[i].fed = n.day
      return n
    })
    setMessage('小家伙开心地蹭了蹭你。饲料 −3，礼物 +10 宋元通宝，经验 +8。')
    chime()
  }
  function buy(kind: number, animal = false) {
    const price = animal ? 45 : crops[kind].cost
    if (!animal && level < crops[kind].level) {
      setMessage('等级还没达到，先照顾现有的作物吧。')
      return
    }
    if (save.coins < price) {
      setMessage('宋元通宝不够，先去卖一些收获吧。')
      return
    }
    if (animal && world.animals.length >= 12) {
      setMessage('这片牧场已经住满 12 位小伙伴啦。')
      return
    }
    setSave((s) => {
      const n = structuredClone(s)
      n.coins -= price
      if (animal) n.worlds[n.map].animals.push({ kind, fed: 0 })
      else n.seeds[kind] += 5
      return n
    })
    purchaseReaction(
      animal ? ['小鸡', '小兔', '小绵羊'][kind] : crops[kind].name + '种子',
    )
    setMessage(
      animal
        ? '新伙伴来到牧场啦！点击它可以喂食。'
        : `买到了 5 颗${crops[kind].name}种子。`,
    )
  }
  function rest() {
    setSave((s) => {
      const n = structuredClone(s)
      n.energy = 100
      n.day++
      for (const w of n.worlds)
        for (const c of Object.values(w.crops))
          if (c.watered) c.planted -= 86400000
      return n
    })
    setNow(Date.now())
    setModal(null)
    setPaused(false)
    setMessage('一觉醒来，体力满满。浇过水的作物都长大啦。')
  }
  const harvestSaleValue = (s: Save) =>
    s.harvest.reduce((v, n, i) => v + n * crops[i].sell, 0) +
    s.fish.reduce((v, n, i) => v + n * fishKinds[i].sell, 0) +
    s.materials.reduce((v, n, i) => v + n * materials[i].sell, 0)
  const sellValue = harvestSaleValue(save)
  return (
    <div className="app-shell">
      <header className="header">
        <a className="brand" href="/" aria-label="晏奚的庄园首页">
          <span className="brand-mark">
            <svg viewBox="0 0 40 40">
              <g transform="translate(1 2)">
                <Character fox />
              </g>
            </svg>
          </span>
          <span>
            <h1>
              晏奚的庄园<span className="brand-dot">.</span>
            </h1>
            <small>A LITTLE FARM, A SLOWER LIFE</small>
          </span>
        </a>
        <div className="header-note">
          <span className="status-dot" />
          不赶时间，慢慢种田。
        </div>
        <div className="header-actions">
          <span className="saved">
            <Check size={14} />
            {!storageOk ? '请导出备份' : saved ? '进度已保存' : '正在保存'}
          </span>
          <button
            aria-label={sound ? '关闭音效' : '开启音效'}
            onClick={() => setSound(!sound)}
          >
            {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <button aria-label="玩法指南" onClick={() => setModal('help')}>
            <CircleHelp size={19} />
          </button>
          <button
            aria-label="游戏设置"
            onClick={() => {
              setModal('settings')
              setCodeMessage('')
            }}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>
      <main>
        <div className="intro">
          <div>
            <span className="eyebrow">YOUR LITTLE CORNER OF THE WORLD</span>
            <h2>如果一起种地的话……</h2>
            <p>可以在小木屋里面休息哦~</p>
          </div>
          <div className="day-stamp">
            <Sun size={30} />
            <div>
              <strong>春 · 第 {save.day} 天</strong>
              <span>晴朗　宜种下小小期待</span>
            </div>
          </div>
        </div>
        <div className="game-layout">
          <aside className="left-column">
            <section className="panel profile">
              <div className="section-top">
                <span className="eyebrow">我们的农场</span>
                <span className="level-badge">Lv. {level}</span>
              </div>
              <div className="profile-main">
                <div className="avatar">
                  <svg viewBox="-3 -3 42 40">
                    <Character fox={save.character === 'fox'} />
                  </svg>
                </div>
                <div>
                  <h3>晏奚的庄园</h3>
                  <p>
                    {level === 1
                      ? '初来乍到的种田人'
                      : level < 4
                        ? '与万物一起生长'
                        : '田园里的老朋友'}
                  </p>
                </div>
              </div>
              <div className="xp-label">
                <span>成长经验</span>
                <span>{save.xp % 60} / 60</span>
              </div>
              <div className="progress">
                <i style={{ width: `${((save.xp % 60) / 60) * 100}%` }} />
              </div>
              <div className="wallet">
                <span>
                  <Coins size={17} />
                  宋元通宝
                </span>
                <strong>
                  {save.coins}
                  <small>枚</small>
                </strong>
              </div>
              <div className="energy">
                <div>
                  <span>
                    <Heart size={14} />
                    体力
                  </span>
                  <span>
                    {save.energy}
                    <small>/100</small>
                  </span>
                </div>
                <div className="progress">
                  <i style={{ width: `${save.energy}%` }} />
                </div>
              </div>
              <button
                className="character-switch"
                onClick={() => {
                  const character = save.character === 'wolf' ? 'fox' : 'wolf'
                  setSave((s) => ({ ...s, character }))
                  setReactions([])
                  setMessage(companionLine(character))
                }}
              >
                和{save.character === 'wolf' ? '奚咪' : '晏咪'}交换一下{' '}
                <span>⇄</span>
              </button>
            </section>
            <section className="panel maps-panel">
              <div className="section-top">
                <h3>
                  <Map size={16} />
                  去哪里待一会儿
                </h3>
                <small>5 个世界</small>
              </div>
              <div className="map-list">
                {maps.map((m, i) => (
                  <button
                    key={m.name}
                    className={
                      save.map === i ? 'map-choice active' : 'map-choice'
                    }
                    onClick={() => {
                      setSave((s) => ({ ...s, map: i }))
                      setPosition({ x: 16, y: 22 })
                      setMessage(m.sub)
                    }}
                  >
                    <span className={`map-thumbnail map-${i}`}>
                      <svg viewBox="0 0 45 35">
                        <path d="M0 25h45v10H0z" fill={m.color} />
                        {i === 2 ? (
                          <>
                            <path d="M0 23h45v12H0z" fill={m.water} />
                            <path
                              d="M8 19h23v6H8zM11 13h17v8H11z"
                              fill="#e5d3a3"
                            />
                            <path d="m7 14 13-8 12 8z" fill="#617e72" />
                          </>
                        ) : i === 4 ? (
                          <path
                            d="M20 6h5v27h-5zM12 15h5v6h6v4H12zm16-5h4v11h-9v-4h5z"
                            fill="#7d9465"
                          />
                        ) : i === 3 ? (
                          <g transform="translate(5 4)">
                            <Weapon />
                          </g>
                        ) : i === 1 ? (
                          <g transform="translate(8 12)">
                            <Meadow flower />
                            <g transform="translate(16 3)">
                              <Meadow flower variant={1} />
                            </g>
                          </g>
                        ) : (
                          <g transform="translate(6 0)">
                            <path
                              d={
                                i === 0
                                  ? 'M9 2h3v31H9zm14 6h3v25h-3z'
                                  : 'M13 5h11v5h7v17H5V10h8z'
                              }
                              fill="#5d7f50"
                            />
                            <path
                              d={
                                i === 0
                                  ? 'M9 10 1 4v6l8 5zm3 5 9-8-2 8-7 5z'
                                  : 'M15 24h6v11h-6z'
                              }
                              fill="#7e9660"
                            />
                          </g>
                        )}
                      </svg>
                    </span>
                    <span>
                      <strong>{m.name}</strong>
                      <small>
                        {
                          [
                            '竹影悠悠',
                            '风吹麦浪',
                            '烟雨人家',
                            '雾林相守',
                            '绿洲来信',
                          ][i]
                        }
                      </small>
                    </span>
                    {save.map === i ? (
                      <span className="map-active-dot" />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                ))}
              </div>
            </section>
            <div className="tiny-note">
              <Leaf size={16} />
              <span>酒逢知己千杯少</span>
            </div>
          </aside>
          <section className="center-column">
            <div className="farm-frame">
              <div className="farm-topbar">
                <div>
                  <span className="live-dot" />
                  <strong>{maps[save.map].name}小院</strong>
                  <span className="map-size">64 × 64</span>
                </div>
                <div>
                  <CloudSun size={17} />
                  <span>
                    {
                      [
                        '微风 · 22°C',
                        '晴暖 · 24°C',
                        '薄雾 · 20°C',
                        '清凉 · 16°C',
                        '干燥 · 31°C',
                      ][save.map]
                    }
                  </span>
                  <button
                    aria-label={paused ? '继续游戏' : '暂停游戏'}
                    onClick={() => setPaused(!paused)}
                  >
                    {paused ? <Play size={15} /> : <Pause size={15} />}
                  </button>
                  <button
                    aria-label="切换网格显示"
                    className={grid ? 'selected' : ''}
                    onClick={() => setGrid(!grid)}
                  >
                    <Grid2X2 size={16} />
                  </button>
                </div>
              </div>
              <div className="world-wrap">
                <World
                  save={save}
                  now={now}
                  grid={grid}
                  onTile={tile}
                  onHouse={() => setModal('house')}
                  onAnimal={feed}
                  position={position}
                  paused={paused || modal !== null}
                  companionSpeech={reactions[0] || ''}
                  onMove={setPosition}
                  onReaction={reactToEvent}
                  onGather={gatherResource}
                  onFishStart={() => {
                    if (save.energy < 2) {
                      setMessage('先回小屋休息，再来钓鱼吧。')
                      return false
                    }
                    setSave((s) =>
                      s.energy < 2 ? s : { ...s, energy: s.energy - 2 },
                    )
                    setMessage('鱼竿抛好啦，等浮漂动一动。')
                    return true
                  }}
                  onFishCaught={(kind) => {
                    setSave((s) => {
                      const n = structuredClone(s)
                      n.fish[kind] = Math.min(1000000, n.fish[kind] + 1)
                      n.xp = Math.min(1000000, n.xp + 4)
                      return n
                    })
                    setMessage(`钓到了${fishKinds[kind].name}，已放入收获栏！`)
                    reactToEvent('鱼上钩了！先放进收获栏吧。')
                  }}
                  onEat={(key, kind, map) => {
                    setSave((s) => {
                      if (s.worlds[map].decor[key] !== kind) return s
                      const n = structuredClone(s)
                      delete n.worlds[map].decor[key]
                      return n
                    })
                    reactToEvent(
                      `这份${decorations[kind].name}真好吃，给你留一口！`,
                    )
                  }}
                />
                <div className="map-caption">
                  <Leaf size={12} />
                  {maps[save.map].sub}
                </div>
                {paused && (
                  <div className="pause-overlay">
                    <Pause size={30} />
                    <strong>让时光停一会儿</strong>
                    <button onClick={() => setPaused(false)}>继续小日子</button>
                  </div>
                )}
                <button
                  className="map-bag-button"
                  onClick={() => {
                    setTab('收获')
                    document
                      .getElementById('harvest-inventory')
                      ?.scrollIntoView({ block: 'nearest' })
                  }}
                >
                  <ShoppingBasket size={16} />
                  收获 · 鱼 ×{save.fish.reduce((a, b) => a + b, 0)}
                </button>
                <button
                  className="home-shortcut"
                  onClick={() => setModal('house')}
                >
                  <House size={14} />
                  回小屋
                </button>
              </div>
              <div className="map-footer">
                <span>
                  <MousePointer2 size={13} />
                  点击地块{['移动', '播种', '浇水', '收获', '装饰'][tool]}
                </span>
                <span>
                  <kbd>W</kbd>
                  <kbd>A</kbd>
                  <kbd>S</kbd>
                  <kbd>D</kbd> 移动角色
                </span>
                <span>
                  <i />
                  世界在慢慢生长
                </span>
              </div>
            </div>
            <TouchControls
              position={position}
              map={save.map}
              paused={paused || modal !== null}
              onMove={setPosition}
            />
            <ExplorationPanel
              save={save}
              setSave={setSave}
              position={position}
              onMove={setPosition}
              paused={paused || modal !== null}
              onMessage={setMessage}
              onGather={gatherResource}
            />
            <div className="toolbox">
              <div className="tools">
                {tools.map((t, i) => (
                  <button
                    className={tool === i ? 'tool active' : 'tool'}
                    key={t.name}
                    onClick={() => setTool(i)}
                  >
                    <kbd>{t.key}</kbd>
                    <t.icon size={25} strokeWidth={1.6} />
                    <span>{t.name}</span>
                  </button>
                ))}
                <span className="tool-divider" />
                <button
                  className="tool shop-tool"
                  onClick={() => setModal('shop')}
                >
                  <ShoppingBasket size={25} strokeWidth={1.6} />
                  <span>杂货铺</span>
                </button>
              </div>
              <p>
                <span className="hint-dot" />
                {tools[tool].hint}
              </p>
            </div>
            <div className="message" role="status">
              <span className="message-avatar">
                <svg viewBox="0 0 36 35">
                  <Character fox={save.character !== 'fox'} />
                </svg>
              </span>
              <p>
                <strong>{save.character === 'wolf' ? '奚咪' : '晏咪'}说</strong>
                {message.includes('爱心') && (
                  <Heart size={14} aria-hidden="true" fill="currentColor" />
                )}
                {message}
                {reactions[0] && (
                  <span className="companion-reaction">{reactions[0]}</span>
                )}
              </p>
              <span className="message-sparkle">✧</span>
            </div>
          </section>
          <aside className="right-column">
            <section id="harvest-inventory" className="panel inventory">
              <div className="section-top">
                <h3>
                  <ShoppingBasket size={16} />
                  随身背包
                </h3>
                <span className="small-tag">随时整理</span>
              </div>
              <div className="tabs">
                {['种子', '收获', '装饰'].map((t) => (
                  <button
                    className={tab === t ? 'active' : ''}
                    key={t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {tab === '种子' ? (
                <>
                  <p className="inventory-note">选一颗种子，种下今天的期待。</p>
                  <div className="seed-grid">
                    {crops.map((c, i) => (
                      <button
                        className={`seed-card ${seed === i ? 'active' : ''} ${level < c.level ? 'locked' : ''}`}
                        key={c.name}
                        onClick={() => {
                          setSeed(i)
                          setTool(1)
                        }}
                      >
                        <span className="seed-count">×{save.seeds[i]}</span>
                        <svg viewBox="-8 -3 32 32">
                          <Plant kind={i} />
                        </svg>
                        <strong>{c.name}</strong>
                        <small>
                          {level < c.level
                            ? `Lv.${c.level} 解锁`
                            : `${c.time / 60} 分钟`}
                        </small>
                        {seed === i && (
                          <span className="seed-check">
                            <Check size={10} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-link"
                    onClick={() => setModal('shop')}
                  >
                    去杂货铺补充种子 <ChevronRight size={13} />
                  </button>
                </>
              ) : tab === '收获' ? (
                <div className="harvest-list">
                  {crops.map((c, i) => (
                    <div key={c.name}>
                      <svg viewBox="-5 -3 26 30">
                        <Plant kind={i} />
                      </svg>
                      <span>
                        {c.name}
                        <small>{c.sell} 宋元通宝 / 个</small>
                      </span>
                      <strong>×{save.harvest[i]}</strong>
                    </div>
                  ))}
                  <WildHarvest
                    save={save}
                    setSave={setSave}
                    position={position}
                    paused={paused || modal !== null}
                    onMessage={setMessage}
                  />
                  <button
                    className="primary-button"
                    disabled={paused || modal !== null || !sellValue}
                    onClick={() => {
                      setSave((s) => ({
                        ...s,
                        coins: Math.min(
                          10000000,
                          s.coins + harvestSaleValue(s),
                        ),
                        harvest: [0, 0, 0, 0],
                        fish: [0, 0, 0],
                        materials: Array(11).fill(0),
                      }))
                      setMessage(
                        `收获分享给了邻居，得到 ${sellValue} 宋元通宝。`,
                      )
                    }}
                  >
                    出售全部 · {sellValue} 宋元通宝
                  </button>
                </div>
              ) : (
                <div className="decor-list">
                  <p>
                    宋式家具与点心 ·
                    点心吸引伙伴；移动模式点击茶案、琴案、秋千等可互动，每天首次恢复体力。
                  </p>
                  {decorations.map((d, i) =>
                    i >= 12 && i <= 14 ? null : (
                      <button
                        className={decor === i ? 'active' : ''}
                        key={d.name}
                        onClick={() => {
                          setDecor(i)
                          setTool(4)
                        }}
                      >
                        <svg
                          width="30"
                          height="32"
                          viewBox="-8 -12 36 36"
                          shapeRendering="crispEdges"
                          aria-hidden="true"
                        >
                          <Decoration kind={i} />
                        </svg>
                        <span>
                          {d.name}
                          <small>可放置 · 15 宋元通宝</small>
                        </span>
                        {decor === i && <Check size={15} />}
                      </button>
                    ),
                  )}
                </div>
              )}
            </section>
            <section className="panel today">
              <div className="section-top">
                <h3>
                  <Sprout size={16} />
                  小院近况
                </h3>
                <span className="live-dot" />
              </div>
              <div className="today-row">
                <span className="round-icon">
                  <Wheat size={19} />
                </span>
                <div>
                  <strong>
                    {mature > 0 ? `${mature} 株作物成熟啦` : '作物正在慢慢生长'}
                  </strong>
                  <small>
                    {mature > 0
                      ? '带上篮子，去收获吧'
                      : '阳光与耐心，都会有回报'}
                  </small>
                </div>
              </div>
              <div className="today-row">
                <span className="round-icon peach">
                  <Heart size={18} />
                </span>
                <div>
                  <strong>{world.animals.length} 位动物小伙伴</strong>
                  <small>
                    今天还有{' '}
                    {world.animals.filter((a) => a.fed !== save.day).length}{' '}
                    位等你来照料
                  </small>
                </div>
              </div>
              <div className="unlock">
                <span>下一份小惊喜</span>
                <strong>
                  Lv. {level + 1} <ChevronRight size={12} />{' '}
                  {level < 4
                    ? ['白萝卜 & 暖灯笼', '草莓 & 花盆', '南瓜种子'][level - 1]
                    : '自由装点你的小院'}
                </strong>
                <div className="progress">
                  <i style={{ width: `${((save.xp % 60) / 60) * 100}%` }} />
                </div>
              </div>
            </section>
            <section className="quote-card">
              <Flower2 size={25} strokeWidth={1.3} />
              <p>一起经营晏与奚的猫咪生活吧</p>
              <span>今天轮到你浇地了</span>
              <div className="quote-flowers">✧　·　✧</div>
            </section>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <span>
          <Leaf size={13} />
          晏奚的庄园 <i>·</i> 一方属于你的像素田园
        </span>
        <span>
          <span className="status-dot" />
          支持离线游玩 <i>·</i> 进度自动保存 <i>·</i>
          <button onClick={() => setModal('settings')}>储存码备份</button>
        </span>
      </footer>
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null)
        }}
      >
        <DialogContent className="farm-dialog">
          <DialogTitle>
            {modal === 'settings'
              ? '把小日子好好收藏'
              : modal === 'shop'
                ? '林间杂货铺'
                : modal === 'house'
                  ? '欢迎回到小木屋'
                  : '慢慢来，也会长大'}
          </DialogTitle>
          <DialogDescription>
            {modal === 'settings'
              ? '导出储存码，可以在另一台设备继续这段田园时光。'
              : modal === 'shop'
                ? '用收获换来新种子，和更多小伙伴。'
                : modal === 'house'
                  ? '休息一下，给自己和作物一个慢慢生长的夜晚。'
                  : '没有强制目标，也没有错过的季节。这里一直等着你。'}
          </DialogDescription>
          {modal === 'settings' && (
            <div className="settings-content">
              <div className="setting-row">
                <span>
                  <Volume2 size={17} />
                  轻柔操作音效
                </span>
                <button
                  onClick={() => setSound(!sound)}
                  className={sound ? 'toggle on' : 'toggle'}
                  aria-label="切换音效"
                  aria-pressed={sound}
                >
                  <i />
                </button>
              </div>
              <div className="setting-row">
                <span>
                  <Grid2X2 size={17} />
                  显示地图网格
                </span>
                <button
                  onClick={() => setGrid(!grid)}
                  className={grid ? 'toggle on' : 'toggle'}
                  aria-label="切换网格"
                  aria-pressed={grid}
                >
                  <i />
                </button>
              </div>
              <div className="backup-actions">
                <button
                  className="primary-button"
                  onClick={() => {
                    setCode(encodeSave(save))
                    setCodeMessage('已生成当前进度的储存码，请复制并妥善保存。')
                  }}
                >
                  <ArrowDownToLine size={16} />
                  生成储存码
                </button>
                <button
                  className="secondary-button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(code)
                      setCodeMessage('储存码已复制。')
                    } catch {
                      setCodeMessage('请选中文本框中的储存码手动复制。')
                    }
                  }}
                  disabled={!code}
                >
                  复制
                </button>
              </div>
              <label className="code-label" htmlFor="save-code">
                储存码
              </label>
              <textarea
                id="save-code"
                rows={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="在这里粘贴 FIELD1. 开头的储存码"
              />
              <button
                className="secondary-button"
                disabled={!code}
                onClick={() => {
                  try {
                    const imported = decodeSave(code.trim())
                    previousXp.current = imported.xp
                    setSave(imported)
                    setNow(Date.now())
                    setCodeMessage('已导入存档，小院里的大家都在等你。')
                  } catch {
                    setCodeMessage('储存码无效或不完整，请检查后重试。')
                  }
                }}
              >
                <ArrowUpFromLine size={16} />
                导入并替换当前进度
              </button>
              <p className="code-message" role="status">
                {codeMessage}
              </p>
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/backup')
                    if (!response.ok) throw Error()
                    const data = await response.json()
                    const restored = saveSchema.parse(data.save)
                    previousXp.current = restored.xp
                    setSave(restored)
                    setCodeMessage('已从当前浏览器的联网备份恢复进度。')
                  } catch {
                    setCodeMessage(
                      '尚无可用联网备份，或当前处于离线状态。请使用储存码恢复。',
                    )
                  }
                }}
              >
                恢复联网备份并替换当前进度
              </button>
              <small className="muted">
                浏览器自动保留离线副本，联网时备份到
                Netlify。导入会覆盖当前进度，建议先生成储存码保存。
              </small>
            </div>
          )}
          {modal === 'shop' && (
            <div className="shop-content">
              <h4>种子 · 每份 5 颗</h4>
              {crops.map((c, i) => (
                <div className="shop-row" key={c.name}>
                  <svg viewBox="-4 -3 26 30">
                    <Plant kind={i} />
                  </svg>
                  <span>
                    <strong>{c.name}</strong>
                    <small>
                      {level < c.level
                        ? `Lv.${c.level} 解锁`
                        : `${c.time / 60} 分钟成熟 · 售价 ${c.sell} 宋元通宝`}
                    </small>
                  </span>
                  <button
                    disabled={level < c.level || save.coins < c.cost}
                    onClick={() => buy(i)}
                  >
                    {c.cost} 宋元通宝
                  </button>
                </div>
              ))}
              <h4>动物小伙伴 · 每天照料可获得礼物</h4>
              {['小鸡', '小兔', '小绵羊'].map((a, i) => (
                <div className="shop-row" key={a}>
                  <svg viewBox="-2 -2 28 26">
                    <Animal kind={i} />
                  </svg>
                  <span>
                    <strong>{a}</strong>
                    <small>每天喂食一次，休息后重置</small>
                  </span>
                  <button
                    disabled={save.coins < 45 || world.animals.length >= 12}
                    onClick={() => buy(i, true)}
                  >
                    45 宋元通宝
                  </button>
                </div>
              ))}
              <p className="shop-wallet">
                <Coins size={16} />
                现有 {save.coins} 宋元通宝
              </p>
              <p role="status" className="code-message">
                {message}
              </p>
              {reactions[0] && (
                <p className="companion-reaction" role="status">
                  {save.character === 'wolf' ? '奚咪' : '晏咪'}：{reactions[0]}
                </p>
              )}
            </div>
          )}
          {modal === 'house' && (
            <div className="house-content">
              <Cabin room={world.room} furniture={world.roomDecor} />
              <p>
                炕上暖暖的，{save.character === 'wolf' ? '奚咪' : '晏咪'}
                已经替你铺好了床。
              </p>
              <button className="primary-button" onClick={rest}>
                <Moon size={17} />
                休息到明天 · 恢复全部体力
              </button>
              {reactions[0] && (
                <p className="companion-reaction" role="status">
                  {save.character === 'wolf' ? '奚咪' : '晏咪'}：{reactions[0]}
                </p>
              )}
              <h4>屋内陈设 · {save.coins} 宋元通宝</h4>
              <p>
                先选位置，再购买家具；每件 15 宋元通宝，更换会返还旧物的 10
                宋元通宝。
              </p>
              <div className="indoor-slots" aria-label="家具摆放位置">
                {roomSlots.map((name, i) => (
                  <button
                    key={name}
                    aria-pressed={roomSlot === i}
                    onClick={() => setRoomSlot(i)}
                  >
                    {name}
                    <small>
                      {world.roomDecor[i] === null
                        ? '空位'
                        : decorations[world.roomDecor[i]!].name}
                    </small>
                  </button>
                ))}
              </div>
              <div className="indoor-shop">
                {indoorFurniture.map((kind) => {
                  const placed = world.roomDecor[roomSlot] === kind
                  const price = world.roomDecor[roomSlot] === null ? 15 : 5
                  return (
                    <button
                      key={kind}
                      disabled={placed || save.coins < price}
                      onClick={() => {
                        setSave((s) => {
                          const n = structuredClone(s)
                          const old = n.worlds[n.map].roomDecor[roomSlot]
                          const cost = old === null ? 15 : 5
                          if (old === kind || n.coins < cost) return s
                          n.coins -= cost
                          n.worlds[n.map].roomDecor[roomSlot] = kind
                          return n
                        })
                        purchaseReaction(decorations[kind].name)
                        setMessage(
                          `${decorations[kind].name}摆在${roomSlots[roomSlot]}了。`,
                        )
                      }}
                    >
                      <svg
                        viewBox="-8 -12 36 36"
                        aria-hidden="true"
                        shapeRendering="crispEdges"
                      >
                        <Decoration kind={kind} />
                      </svg>
                      <span>
                        {decorations[kind].name}
                        <small>
                          {placed
                            ? '已摆放'
                            : `购买${price === 5 ? '并更换 · 补 5' : ' · 15'} 宋元通宝`}
                        </small>
                      </span>
                    </button>
                  )
                })}
              </div>
              <button
                className="secondary-button"
                disabled={world.roomDecor[roomSlot] === null}
                onClick={() => {
                  setSave((s) => {
                    if (s.worlds[s.map].roomDecor[roomSlot] === null) return s
                    const n = structuredClone(s)
                    n.worlds[n.map].roomDecor[roomSlot] = null
                    n.coins += 10
                    return n
                  })
                  setMessage('屋内陈设已收回，返还 10 宋元通宝。')
                }}
              >
                收回{roomSlots[roomSlot]}陈设 · 返还 10 宋元通宝
              </button>
              <p className="code-message" role="status">
                {message}
              </p>
              <h4>小屋的模样</h4>
              <div className="room-choices">
                {['原木小屋', '青苔小屋', '暮色小屋'].map((r, i) => (
                  <button
                    disabled={level < i + 1}
                    className={world.room === i ? 'active' : ''}
                    key={r}
                    onClick={() => {
                      setSave((s) => {
                        const n = structuredClone(s)
                        n.worlds[n.map].room = i
                        return n
                      })
                      reactToEvent(
                        save.character === 'wolf'
                          ? `换成${r}啦！晏咪，一起住吧！`
                          : `${r}。你喜欢就住这里。`,
                      )
                    }}
                  >
                    {r}
                    <small>
                      {level < i + 1
                        ? `Lv.${i + 1} 解锁`
                        : world.room === i
                          ? '正在使用'
                          : '换上新装'}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          )}
          {modal === 'help' && (
            <div className="help-content">
              <p>
                用鼠标点击地图，或使用方向键 / WASD 移动角色。工具栏也支持数字键
                1–5。
              </p>
              <p>
                点击地图池边的小鱼即可钓鱼，进度在右上角显示，钓获不会自动弹出背包。采集点点击一次即可采集；鱼与采集材料统一存放在收获栏，可一起出售，鱼也能放在地上喂伙伴。休息到次日后采集点恢复。
              </p>
              <ol>
                <li>
                  <strong>播种：</strong>
                  在背包选择种子，切换播种工具，点击空地。
                </li>
                <li>
                  <strong>浇水：</strong>
                  切换浇水工具，点击作物。水分充足后开始生长。
                </li>
                <li>
                  <strong>收获：</strong>
                  作物闪光时，用收获工具收集。在背包「收获」页出售。
                </li>
                <li>
                  <strong>照料：</strong>
                  点击围栏里的动物喂食，每天收获礼物与经验。
                </li>
                <li>
                  <strong>休息：</strong>
                  进入小屋睡到明天，恢复体力，并让浇过水的作物成熟。
                </li>
                <li>
                  <strong>装饰：</strong>
                  背包选择装饰后点击空地，家具无需等级解锁。小木屋内可选位置购买、替换宋式家具。
                </li>
              </ol>
              <p>
                隐雾之林中的生物偶尔会靠近并将角色击退，伙伴会挡在对方身前。不会死亡，也不会损失体力、物品或进度。靠近伙伴时会自动互动和亲亲。
              </p>
              <p>
                五张地图都有独立的作物、动物和小屋，共享宋元通宝与背包。作物不会枯萎，动物不会离开。暂停时无法操作，已经浇水的作物仍按现实时间生长。
              </p>
              <p>
                首次完整打开后可离线游玩。设置中可导出储存码，记得为你的田园留一份备份。
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
