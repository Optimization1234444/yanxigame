import { blocked } from './state'
export const materials = [
  { name: '竹子', sell: 6 },
  { name: '竹叶', sell: 3 },
  { name: '韧草', sell: 5 },
  { name: '野花', sell: 4 },
  { name: '柳木', sell: 7 },
  { name: '荷叶', sell: 5 },
  { name: '霜木', sell: 8 },
  { name: '幽兰', sell: 6 },
  { name: '胡杨木', sell: 8 },
  { name: '棕榈叶', sell: 5 },
  { name: '野果', sell: 5 },
]
export const fishKinds = [
  { name: '鲫鱼', sell: 18 },
  { name: '鲤鱼', sell: 26 },
  { name: '鲈鱼', sell: 35 },
]
export type Site = { x: number; y: number; id: string; kind: number }
export function landscape(map: number, seed: number) {
  let value = (seed + map * 7919) >>> 0
  const random = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    return value / 4294967296
  }
  const used = new Set<string>()
  const point = () => {
    for (let i = 0; i < 500; i++) {
      const p = {
        x: 3 + Math.floor(random() * 57),
        y: 14 + Math.floor(random() * 45),
      }
      const key = `${p.x},${p.y}`
      if (
        !blocked(p.x, p.y, map) &&
        !used.has(key) &&
        !(p.x < 32 && p.y < 32)
      ) {
        used.add(key)
        return p
      }
    }
    return { x: 35, y: 20 }
  }
  const regionNames = [
    ['青篁坡', '野果林', '听风竹径', '石笋谷', '新笋地', '竹影溪'],
    ['百花坡', '蒲草甸', '牧风原', '野果洼', '萤火草地', '风车丘'],
    ['采莲汀', '柳荫堤', '烟雨洲', '旧茶园', '水巷外滩', '芦苇荡'],
    ['白枝坡', '霜木谷', '幽兰地', '迷雾小径', '冷月丘', '朱棺旧址'],
    ['胡杨坡', '月牙沙丘', '棕榈谷', '风蚀石林', '古道驿址', '流沙台地'],
  ][map]
  const regions = regionNames.map((name) => ({ ...point(), name }))
  const count = 2 + Math.floor(random() * 2)
  // Preserve the random sequence of older saves without creating retired locations.
  for (let i = 0; i < count; i++) point()
  const resources: Site[] = Array.from({ length: 34 }, (_, i) => ({
    ...point(),
    id: `r${i}`,
    kind: i % 5 === 0 ? 10 : map * 2 + (i % 2),
  }))
  const scenery = Array.from({ length: 90 }, () => point())
  return { resources, scenery, regions }
}
export const ponds = (map: number) => [
  { x: map === 2 ? 20 : 22, y: map === 0 ? 25 : map === 2 ? 18 : 24 },
  { x: 41, y: 40 },
]
export const near = (
  a: { x: number; y: number },
  b: { x: number; y: number },
) => Math.hypot(a.x - b.x, a.y - b.y) <= 2
