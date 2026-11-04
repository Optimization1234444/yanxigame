// Stable IDs are stored in saves; prices use earned in-game coins only.
export const pairActions = [
  { name: '头顶换班', price: 99, detail: '奚咪跳上晏咪头顶，再交换位置。', duration: 28 },
  { name: '尾巴碰碰', price: 99, detail: '转身碰尾巴，再一起轻轻跳。', duration: 24 },
  { name: '击掌蹦蹦', price: 99, detail: '面对面击掌，轮流蹦高。', duration: 24 },
  { name: '舔舔与回吻', price: 999, detail: '奚咪舔舔晏咪，晏咪后退几步，再送奚咪一个吻。', duration: 40 },
  { name: '转圈抱抱', price: 999, detail: '牵手绕圈，最后靠进怀里。', duration: 36 },
  { name: '枕着你入梦', price: 999, detail: '靠肩、蹭蹭，枕在一起打个盹。', duration: 40 },
  { name: '双人小华尔兹', price: 999, detail: '交错舞步、转身，鞠躬谢幕。', duration: 40 },
  { name: '星河共舞', price: 99999, detail: '双人交替腾空、旋转，星光随着舞步绽放。', duration: 64 },
  { name: '流沙月光曲', price: 99999, detail: '绕月起舞，连续跃起，落进彼此怀中。', duration: 72 },
  { name: '天幕花火', price: 99999, detail: '镜像跳跃、空中回旋、交错谢幕，花火为你们盛开。', duration: 80 },
] as const
export function pairPose(id: number, age: number, fox: boolean) {
  const t = age / pairActions[id].duration
  const side = fox ? 1 : -1
  const wave = Math.sin(t * Math.PI * 4 + (fox ? 0 : Math.PI))
  const jump = -Math.abs(Math.sin(t * Math.PI * 4)) * 18
  switch (id) {
    case 0: return { x: side * 5 * Math.sin(t * Math.PI), y: (t < .5) === fox ? -Math.sin((t % .5) * Math.PI * 2) * 30 : 0, rotate: 0 }
    case 1: return { x: side * 5 * Math.sin(t * Math.PI * 2), y: jump / 3, rotate: side * wave * 14 }
    case 2: return { x: -side * 4 * Math.sin(t * Math.PI), y: fox ? jump : -Math.abs(wave) * 14, rotate: 0 }
    case 3: return { x: fox ? (t < .3 ? -8 * Math.sin(t / .3 * Math.PI) : 0) : (t > .3 && t < .7 ? -14 * Math.sin((t - .3) / .4 * Math.PI) : t >= .7 ? 7 * Math.sin((t - .7) / .3 * Math.PI) : 0), y: 0, rotate: fox ? Math.sin(t * Math.PI * 2) * 6 : 0 }
    case 4: return { x: side * Math.sin(t * Math.PI * 4) * 9, y: Math.cos(t * Math.PI * 4) * 4, rotate: side * Math.sin(t * Math.PI * 2) * 18 }
    case 5: return { x: -side * 5 * Math.sin(t * Math.PI), y: 3 * Math.sin(t * Math.PI), rotate: side * 12 * Math.sin(t * Math.PI) }
    case 6: return { x: side * wave * 8, y: -Math.abs(wave) * 5, rotate: side * Math.sin(t * Math.PI * 6) * 20 }
    default: return { x: side * Math.sin(t * Math.PI * (id - 3)) * (id === 9 ? 18 : 12), y: jump * (id === 8 ? 1.8 : 1.4), rotate: side * Math.sin(t * Math.PI * 4) * (id === 9 ? 180 : 35) }
  }
}
