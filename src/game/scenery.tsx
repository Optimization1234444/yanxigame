export function Meadow({
  flower = false,
  variant = 0,
}: {
  flower?: boolean
  variant?: number
}) {
  return (
    <g>
      <path
        d="M2 17 0 7l5 5 2-12 3 11 5-6-3 12z"
        fill={variant % 2 ? '#729b59' : '#8aaa60'}
      />
      {flower && (
        <>
          <path d="M7 13V4" stroke="#587e49" strokeWidth="2" />
          <path
            d="M4 1h6v3h3v4h-3v3H4V8H1V4h3z"
            fill={['#f3d49d', '#dba6a4', '#e8e7c3'][variant % 3]}
          />
          <rect x="5" y="4" width="4" height="3" fill="#c69f4a" />
        </>
      )}
    </g>
  )
}
export function Lotus() {
  return (
    <g className="lotus">
      <ellipse cx="10" cy="16" rx="14" ry="5" fill="#639279" />
      <path d="m10 16 11-4-6 7" fill="#8db095" />
      <path d="M9 13V3" stroke="#63866b" strokeWidth="2" />
      <path d="m9 9-8-5 2 7 6 3 7-3 3-7z" fill="#dca6a5" />
      <path d="m9 0-4 7 4 7 5-7z" fill="#f1c7bc" />
    </g>
  )
}
export function JiangnanBuilding({ tower = false }: { tower?: boolean }) {
  if (tower)
    return (
      <g aria-label="雷峰塔">
        <path d="M8 105h66v7H8z" fill="#a49a7c" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 4} ${82 - i * 18})`}>
            <path d={`M16 0h${50 - i * 8}v22H16z`} fill="#d4bc8c" />
            <path d={`M9 1 1 5h${80 - i * 8}l-9-4-5-7H15z`} fill="#566f65" />
            <path d={`M18 8h${46 - i * 8}v2H18z`} fill="#a97450" />
            <path d="M30 9h5v10h-5z" fill="#6f5b46" />
          </g>
        ))}
        <path d="M40 1v-9h3v9" fill="#bb9b5d" />
      </g>
    )
  return (
    <g>
      <path d="M4 18h55v31H4z" fill="#e1d9bb" />
      <path d="M-3 17 5 15 12 5h39l9 10 8 2v4H-3z" fill="#526c65" />
      <path d="M9 12h47v2H9zM14 7h35v2H14z" fill="#87968a" />
      <path
        d="M5 22h53v3H5zM7 24v24m48-24v24"
        stroke="#847453"
        strokeWidth="2"
        fill="none"
      />
      <path d="M26 28h12v21H26z" fill="#705b48" />
      <path d="M9 26h10v11H9zm35 0h10v11H44z" fill="#b1b99c" />
      <path d="M13 26v11m36-11v11" stroke="#70664f" strokeWidth="2" />
      <path
        d="M10 29h8m-8 4h8m27-4h8m-8 4h8M29 31v14m6-14v14"
        stroke="#74684f"
        strokeWidth="1"
      />
      <path d="M1 49h61v4H1z" fill="#a49c80" />
      <path d="M58 22h7v9h-7z" fill="#c99273" />
    </g>
  )
}
export function Weapon({ variant = 0 }: { variant?: number }) {
  return (
    <g transform={`rotate(${variant % 2 ? -25 : 28} 12 16)`}>
      <path d="M11 2h4v21h-4zM9 5h2v13H9z" fill="#c3c9bc" />
      <path d="m11 2 2-4 2 4" fill="#e1e2ce" />
      <path d="M5 22h16v3H5zM11 25h4v10h-4z" fill="#9e815b" />
      {variant % 3 === 1 && <path d="M15 2h8v10h-8z" fill="#8fa198" />}
      <path d="M12 28h2v4h-2z" fill="#bb7360" />
    </g>
  )
}
export function ShadowCreature() {
  return (
    <g aria-label="红衣女鬼">
      <ellipse cx="14" cy="30" rx="15" ry="4" fill="#4b4b46" opacity=".2" />
      <path d="M5 3h18v22H3V9h2z" fill="#353a39" />
      <path d="M8 7h12v10H8z" fill="#e0d4bd" />
      <path d="M7 2h15v9H11v8H7zm13 6h5v19h-5z" fill="#353a39" />
      <path
        d="M8 16h12l5 16-7-2-4 3-5-3-7 2zM7 17 0 22v7h5l6-9zm14 0 9 6v7h-6l-6-10z"
        fill="#a54848"
      />
      <path
        d="m10 17 4 7 4-7M14 24v6"
        fill="none"
        stroke="#d18773"
        strokeWidth="2"
      />
      <path d="M13 11h2v2h-2zm5 0h2v2h-2z" fill="#916058" />
    </g>
  )
}
export function SpeechBubble({
  fox = false,
  text,
}: {
  fox?: boolean
  text?: string
}) {
  return (
    <g className="actor-bubble" pointerEvents="none">
      <rect
        x={text ? -52 : 1}
        y="-27"
        width={text ? 138 : 32}
        height="22"
        rx="5"
        fill="#fff4d8"
        stroke="#adad88"
      />
      <path d="m14-5 4 5 4-5" fill="#fff4d8" />
      {text ? (
        <text x="17" y="-12" textAnchor="middle" fontSize="8" fill="#586449">
          {text.length > 17 ? text.slice(0, 17) + '…' : text}
        </text>
      ) : fox ? (
        <path d="M10-19h5l2 3 2-3h5v6l-7 5-7-5z" fill="#c77e80" />
      ) : (
        <text x="17" y="-12" textAnchor="middle" fontSize="12" fill="#586449">
          ……
        </text>
      )}
    </g>
  )
}
