# Project architecture

This is 狐与狼的小日子, a Chinese-language, slow-paced pixel farming game built with TanStack Start, React, TypeScript and Vite, deployed on Netlify.

## Key directories

- `src/routes/index.tsx`: game screen, player interactions, inventory, shop, house and settings dialogs; persistence effects only run in the browser.
- `src/game/state.ts`: shared strict Zod save schema, initial state, crop/map catalogs, level progression and portable save codes.
- `src/game/art.tsx`: code-native SVG pixel sprites for the user-inspired wolf and fox, plants, trees, animals and cabins.
- `src/game/World.tsx`: 32×32 SVG world, deterministic scenery, actionable cells, actors and map objects.
- `src/styles.css`: warm paper/forest palette, full responsive game interface and reduced-motion styles.
- `public/sw.js`: offline navigation and asset caching. Frontend sends initially loaded resource URLs to the active worker.
- `db/schema.ts`, `db/index.ts`, `drizzle.config.ts`: Netlify Database with Drizzle beta native adapter. Migrations in `netlify/database/migrations` are applied by the platform, never manually.
- `netlify/functions/backup.mts`: same-origin, size-limited, validated progress backup, keyed by a secure HttpOnly device cookie.
- `src/routes/__root.tsx`: document shell, Chinese language and finished social metadata.

## Conventions and decisions

Keep player copy in Chinese. Preserve the relaxed pacing: no forced quests, crop death, animal death, timers that punish absence, or paid progression. Each world owns crops, animals, decorations and cabin appearance; resources are shared. Each level requires 60 XP. Crops use wall-clock timestamps, so offline growth works. Rest advances the day, restores stamina and matures watered crops; animals may be fed once per game day. Pause blocks interaction, not wall-clock growth.

Use SVG primitives with crisp edges, not external image dependencies. Keep scene coordinates in 512 units, with 16 units per tile; pointer conversion must use the actual SVG bounding rectangle. Exclude blocked cells from player actions. Keep offline localStorage as a resilient browser mirror with storage failures surfaced, and use Netlify Database for online persistence. Backup failures must not interrupt offline play. Do not put device identifiers or secrets in rendered output.

Read browser storage in effects to preserve SSR hydration. All imported saves and server writes must pass `saveSchema`. Changes to the save schema need versioning and migration consideration. Never silently overwrite a valid local save from a cloud response. Storage codes are plain encoded save data, not encrypted. Dialogs use the existing accessible Radix primitives. Preserve keyboard focus and reduced-motion support.

Install with pnpm. The platform runs build validation; do not run build, dev-server, typecheck or test commands in automated editing sessions when run instructions prohibit them. Inspect source changes instead. Do not edit generated route trees or applied database migrations.
