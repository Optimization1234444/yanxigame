import { Character, Decoration } from './art'

// Indoor furnishings belong to each map, independently of outdoor decorations.
export function Cabin({
  room,
  furniture,
}: {
  room: number
  furniture: (number | null)[]
}) {
  const wall = ['#dfcea8', '#c1d2b5', '#d3bdb4'][room]
  return (
    <svg
      className="cabin-scene"
      viewBox="0 0 400 240"
      role="img"
      aria-label="小木屋内，中央篝火、中式帐幔炕床和宋式陈设"
      shapeRendering="crispEdges"
    >
      <rect width="400" height="240" fill={wall} />
      <path
        d="M0 0h400v10H0zM0 85h400v6H0zM12 0v110m376-110v110"
        stroke="#8d7150"
        strokeWidth="7"
      />
      <path d="M0 110h400v130H0z" fill="#bea17b" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0 ${122 + i * 26}h400`}
          stroke="#aa8d68"
          strokeWidth="2"
        />
      ))}
      <g aria-label="格栅窗">
        <path d="M155 22h90v62h-90z" fill="#8d7150" />
        <path d="M160 27h80v52h-80z" fill="#b9c7ad" />
        <path
          d="M180 27v52m20-52v52m20-52v52M160 44h80m-80 18h80"
          stroke="#8d7150"
          strokeWidth="3"
        />
      </g>
      <g aria-label="中式帐幔炕床">
        <path d="M20 102h116v55H20z" fill="#9d7b5b" />
        <path d="M24 110h108v38H24z" fill="#b49573" />
        <path d="M28 121h100v18H28z" fill="#a45f53" />
        <path d="M30 122h26v14H30z" fill="#e2c88e" />
        <path d="M59 121h66v4H59zM59 135h66v4H59z" fill="#c78e6a" />
        <path
          d="M21 37h114v7H21zM23 40v105m109-105v105M23 106h109"
          stroke="#795a40"
          strokeWidth="5"
        />
        <path d="M28 44h24l-9 46-15 19zM107 44h21v65l-13-19z" fill="#d4b78b" />
        <path d="M29 87h16m67 0h15" stroke="#a46b51" strokeWidth="4" />
        <path
          d="M27 45h98v7H27zM32 110v10m16-10v10m65-10v10m14-10v10"
          stroke="#b48b58"
          strokeWidth="3"
        />
        <path
          d="M35 150v7m20-7v7m20-7v7m20-7v7m20-7v7"
          stroke="#987352"
          strokeWidth="2"
        />
      </g>
      <g transform="translate(200 165)" aria-label="中央篝火">
        <ellipse rx="37" ry="18" fill="#e0b472" opacity=".35" />
        <path d="M-26 9h52v9h-52zM-20 2h40v5h-40z" fill="#8c8271" />
        <path
          d="m-20 13 37-9 3 7-38 9zM-17 4l37 12-3 6-37-12z"
          fill="#78583e"
        />
        <g className="campfire-flame">
          <path d="M-16 7v-15h6v-9h5v-13l9 15 5-5v12h8V7z" fill="#c77747" />
          <path d="M-8 8V-5h5v-11L5-5h5V8z" fill="#e8b75e" />
          <path d="M-2 8V-2h5V8z" fill="#f6dda0" />
        </g>
      </g>
      {furniture.map((kind, i) =>
        kind === null ? null : (
          <g
            key={i}
            transform={`translate(${[282, 38, 338, 280][i]} ${[107, 207, 178, 218][i]}) scale(1.8)`}
          >
            <Decoration kind={kind} />
          </g>
        ),
      )}
      <g transform="translate(111 174) scale(1.1)">
        <Character />
      </g>
      <g transform="translate(262 158) scale(-1.1 1.1)">
        <Character fox />
      </g>
      <path d="M0 0h400v240H0z" fill="none" stroke="#8d7150" strokeWidth="8" />
    </svg>
  )
}
