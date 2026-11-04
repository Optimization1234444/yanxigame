import { z } from 'zod'
const crop = z.object({
  kind: z.number().int().min(0).max(3),
  planted: z.number().nonnegative(),
  watered: z.boolean(),
})
const world = z.object({
  crops: z.record(
    z
      .string()
      .regex(/^(?:[0-9]|[1-5][0-9]|6[0-3]),(?:[0-9]|[1-5][0-9]|6[0-3])$/),
    crop,
  ),
  decor: z.record(
    z
      .string()
      .regex(/^(?:[0-9]|[1-5][0-9]|6[0-3]),(?:[0-9]|[1-5][0-9]|6[0-3])$/),
    z.number().int().min(0).max(20),
  ),
  interactions: z
    .record(
      z
        .string()
        .regex(/^(?:[0-9]|[1-5][0-9]|6[0-3]),(?:[0-9]|[1-5][0-9]|6[0-3])$/),
      z.number().int().min(1),
    )
    .default({}),
  seed: z.number().int().min(1).max(4294967295).default(7919),
  gathered: z
    .record(
      z.string().regex(/^r(?:[0-9]|[12][0-9]|3[0-3])$/),
      z.number().int().min(1),
    )
    .default({}),
  // Retired fields are read only for compatibility with existing saves.
  dungeons: z
    .record(
      z.string().regex(/^d[0-2]$/),
      z.object({
        day: z.number().int().min(1),
        depth: z.number().int().min(0).max(3),
      }),
    )
    .default({}),
  animals: z
    .array(
      z.object({
        kind: z.number().int().min(0).max(2),
        fed: z.number().int().nonnegative(),
      }),
    )
    .max(12),
  // Additive v1 field: older local/cloud saves receive four empty indoor slots.
  roomDecor: z
    .array(
      z
        .number()
        .int()
        .min(0)
        .max(20)
        .refine((kind) => kind < 9 || kind > 14)
        .nullable(),
    )
    .length(4)
    .default([null, null, null, null]),
  room: z.number().int().min(0).max(2),
})
export const saveSchema = z.object({
  version: z.literal(1),
  coins: z.number().int().min(0).max(10000000),
  xp: z.number().int().min(0).max(1000000),
  energy: z.number().int().min(0).max(100),
  day: z.number().int().min(1).max(1000000),
  map: z.number().int().min(0).max(4),
  character: z.enum(['wolf', 'fox']),
  seeds: z.array(z.number().int().min(0).max(100000)).length(4),
  harvest: z.array(z.number().int().min(0).max(100000)).length(4),
  materials: z
    .array(z.number().int().min(0).max(1000000))
    .length(11)
    .default(Array(11).fill(0)),
  fish: z
    .array(z.number().int().min(0).max(1000000))
    .length(3)
    .default([0, 0, 0]),
  // No crafting or equipment behavior remains; preserve old save compatibility.
  equipment: z
    .object({
      wolf: z.array(z.number().int().min(0).max(3)).length(5),
      fox: z.array(z.number().int().min(0).max(3)).length(5),
    })
    .default({ wolf: [0, 0, 0, 0, 0], fox: [0, 0, 0, 0, 0] }),
  worlds: z.array(world).length(5),
})
export type Save = z.infer<typeof saveSchema>
export const crops = [
  { name: '胡萝卜', cost: 5, sell: 18, time: 90, color: '#ec9850', level: 1 },
  { name: '白萝卜', cost: 8, sell: 28, time: 150, color: '#f4e8bd', level: 2 },
  { name: '草莓', cost: 12, sell: 42, time: 240, color: '#d86667', level: 3 },
  { name: '南瓜', cost: 18, sell: 65, time: 360, color: '#d99538', level: 4 },
]
// Additive v1 catalog: IDs 0–3 retain their meaning; existing saves need no migration.
export const decorations = [
  { name: '木长椅', level: 1 },
  { name: '暖灯笼', level: 1 },
  { name: '花盆', level: 1 },
  { name: '陶土花盆', level: 1 },
  { name: '青瓷花瓶', level: 1 },
  { name: '宋式茶案', level: 1 },
  { name: '圈椅', level: 1 },
  { name: '山水屏风', level: 1 },
  { name: '琴案', level: 1 },
  { name: '月饼', level: 1 },
  { name: '包子', level: 1 },
  { name: '馒头', level: 1 },
  { name: '鲫鱼', level: 1 },
  { name: '鲤鱼', level: 1 },
  { name: '鲈鱼', level: 1 },
  { name: '风铃架', level: 1 },
  { name: '石灯笼', level: 1 },
  { name: '博山香炉', level: 1 },
  { name: '围棋案', level: 1 },
  { name: '秋千', level: 1 },
  { name: '点心食盒', level: 1 },
]
export const indoorFurniture = [1, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 20]
export const roomSlots = ['窗下', '左侧', '右侧', '门边']
export const isFood = (kind: number) => kind >= 9 && kind <= 14
export const maps = [
  {
    name: '竹林',
    sub: '竹子砍不完',
    color: '#a7bf78',
    water: '#87b7ae',
  },
  {
    name: '草原',
    sub: '在风的方向，慢慢生长',
    color: '#b6c987',
    water: '#8ebac1',
  },
  {
    name: '江南水乡',
    sub: '一畦春韭绿，十里稻花香',
    color: '#a3b8a0',
    water: '#82adb8',
  },
  {
    name: '隐雾之林',
    sub: '迷雾深处，也有人为你挡在身前',
    color: '#a5ada7',
    water: '#8a9ba8',
  },
  {
    name: '沙漠',
    sub: '沙子里面可以游泳',
    color: '#d9bf83',
    water: '#8ebbb4',
  },
]
export function initialSave(): Save {
  return {
    version: 1,
    materials: Array(11).fill(0),
    fish: [0, 0, 0],
    equipment: { wolf: [0, 0, 0, 0, 0], fox: [0, 0, 0, 0, 0] },
    coins: 180,
    xp: 0,
    energy: 100,
    day: 1,
    map: 0,
    character: 'wolf',
    seeds: [12, 4, 0, 0],
    harvest: [0, 0, 0, 0],
    worlds: maps.map((_, i) => ({
      crops:
        i === 0
          ? {
              '12,16': { kind: 0, planted: Date.now() - 95000, watered: true },
              '14,16': { kind: 0, planted: Date.now() - 95000, watered: true },
              '16,16': { kind: 0, planted: Date.now() - 40000, watered: true },
              '12,18': { kind: 0, planted: Date.now(), watered: false },
            }
          : {},
      seed: 7919 + i * 104729,
      gathered: {},
      interactions: {},
      dungeons: {},
      decor: {},
      animals:
        i === 0
          ? [
              { kind: 0, fed: 0 },
              { kind: 0, fed: 0 },
            ]
          : [],
      room: 0,
      roomDecor: [null, null, null, null],
    })),
  }
}
export const levelOf = (xp: number) => Math.floor(xp / 60) + 1
export function encodeSave(save: Save) {
  const bytes = new TextEncoder().encode(JSON.stringify(save))
  return (
    'FIELD1.' + btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
  )
}
export function decodeSave(code: string) {
  if (code.length > 400000) throw Error('储存码太长')
  if (!code.startsWith('FIELD1.')) throw Error('储存码格式不正确')
  return saveSchema.parse(
    JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(code.slice(7)), (c) => c.charCodeAt(0)),
      ),
    ),
  )
}
export function blocked(x: number, y: number, map: number) {
  if (x >= 32 || y >= 32)
    return (
      x < 2 ||
      x > 61 ||
      y < 3 ||
      y > 61 ||
      (x >= 42 && x <= 49 && y >= 38 && y <= 43) ||
      (map === 3 && x >= 51 && x <= 54 && y >= 21 && y <= 24)
    )
  return (
    x < 2 ||
    x > 31 ||
    y < 3 ||
    y > 31 ||
    (x >= 6 && x <= 12 && y >= 3 && y <= 8) ||
    (x >= 16 && x <= 23 && y >= 6 && y <= 12) ||
    (x >= 23 && y >= 19) ||
    (map === 2 && x > 20 && (y < 14 || y > 17)) ||
    (x < 6 && y > 19)
  )
}
