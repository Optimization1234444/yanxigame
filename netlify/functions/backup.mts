import { eq } from 'drizzle-orm'
import { database } from '../../db/index.js'
import { backups } from '../../db/schema.js'
import { saveSchema } from '../../src/game/state.js'
export default async (req: Request) => {
  if (req.method !== 'POST' && req.method !== 'GET')
    return new Response('Method not allowed', { status: 405 })
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin)
    return new Response('Forbidden', { status: 403 })
  if (Number(req.headers.get('content-length') || 0) > 300000)
    return new Response('Payload too large', { status: 413 })
  const cookie = req.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)farm_backup=([a-f0-9-]{36})(?:;|$)/)?.[1]
  try {
    if (req.method === 'GET') {
      if (!cookie) return Response.json({ error: 'No backup' }, { status: 404 })
      const [backup] = await database()
        .select()
        .from(backups)
        .where(eq(backups.id, cookie))
        .limit(1)
      if (!backup) return Response.json({ error: 'No backup' }, { status: 404 })
      return Response.json(
        { save: backup.progress },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const raw = await req.text()
    if (raw.length > 300000)
      return new Response('Payload too large', { status: 413 })
    const parsed = saveSchema.safeParse(JSON.parse(raw).save)
    if (!parsed.success) return new Response('Invalid save', { status: 400 })
    const id = cookie || crypto.randomUUID()
    await database()
      .insert(backups)
      .values({ id, progress: parsed.data })
      .onConflictDoUpdate({
        target: backups.id,
        set: { progress: parsed.data, updatedAt: new Date() },
      })
    return Response.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store',
          ...(!cookie
            ? {
                'Set-Cookie': `farm_backup=${id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`,
              }
            : {}),
        },
      },
    )
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
export const config = { path: '/api/backup' }
