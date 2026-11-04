export function Character({
  fox = false,
  walking = false,
  embracing = false,
}: {
  fox?: boolean
  walking?: boolean
  embracing?: boolean
}) {
  const fur = fox ? '#fff2d8' : '#303936'
  return (
    <g
      className={`character ${fox ? 'character-fox' : 'character-wolf'}${walking ? ' is-walking' : ''}`}
    >
      <ellipse cx="17" cy="30" rx="14" ry="3" fill="#3e513b" opacity=".18" />
      <g className="character-breath">
        <g className="character-stride">
          <g className="tail" visibility={embracing ? 'hidden' : undefined}>
            <path d="M23 20h7v-5h5v12h-12z" fill={fur} />
            <path d="M30 15h5v6h-5z" fill={fox ? '#c28b64' : '#48504b'} />
          </g>
          <path d="M7 14h18v14H7z" fill={fur} />
          <path d="M7 18h18v7H7z" fill={fox ? '#749166' : '#5b8193'} />
          <path
            className="character-leg character-leg-left"
            d="M7 27h4v4H7z"
            fill={fur}
          />
          <path
            className="character-leg character-leg-right"
            d="M21 27h4v4h-4z"
            fill={fur}
          />
          <path d="M4 8h17v13H4zM4 8V1l6 7zm11 0 6-7v7z" fill={fur} />
          <path d="M5 5v4h4zm12 4h3V5z" fill={fox ? '#dba49a' : '#727c72'} />
          <g className="character-eyes" fill={fox ? '#b15f4e' : '#e5c75d'}>
            <rect x="7" y="13" width="2" height="2" />
            <rect x="16" y="13" width="2" height="2" />
          </g>
          <path d="M11 17h3v2h-3z" fill={fox ? '#b07f73' : '#647468'} />
          {embracing && (
            <g className="tail-embrace" aria-label="晏咪用尾巴圈住奚咪">
              <path
                d="M23 20h9v5h5v10h-5v4H-10v-4h-6V23h7v9h39v-5h-7z"
                fill={fur}
              />
              <path d="M-16 23h7v9h-7z" fill="#59635b" />
            </g>
          )}
        </g>
      </g>
    </g>
  )
}
export function Coffin({ red = false }: { red?: boolean }) {
  return (
    <g>
      <path d="M1 27h31v3H1z" fill="#435448" opacity=".25" />
      <path d="m2 12 7-7h17l6 7-4 15H6z" fill={red ? '#7d282c' : '#633d32'} />
      <path d="m2 12 7-7h17l6 7-7 5H8z" fill={red ? '#b44142' : '#9a5c43'} />
      <path d="m8 9 3-2h13l3 4-4 3H10z" fill={red ? '#c35d50' : '#b67a50'} />
      <path d="M8 18h17v2H8zm1 5h15v2H9z" fill="#b88851" />
      <path d="M14 8h6v2h-6zm2 2h2v3h-2z" fill="#e1c17c" />
      <path d="M5 15h3v10H5zm20 2h3v8h-3z" fill="#452f2b" />
    </g>
  )
}
export function Plant({
  kind = 0,
  stage = 2,
}: {
  kind?: number
  stage?: number
}) {
  const colors = ['#e9994d', '#f1e3b4', '#ce6062', '#d8983d']
  return (
    <g>
      {stage > 0 && (
        <>
          <path d="M8 8V1H5v4H1v3h5v5h4V8h5V4h-4v4z" fill="#4d783c" />
          <path d="M8 7V1h3v5z" fill="#88a74d" />
        </>
      )}
      {stage === 2 ? (
        <path
          d={
            kind === 0
              ? 'M4 10h9v7h-3v5H7v-4H4z'
              : kind === 2
                ? 'M2 10h13v9H5v-3H2z'
                : 'M2 10h13v10H2z'
          }
          fill={colors[kind]}
        />
      ) : (
        <path d="M6 12h4v4H6z" fill="#67934e" />
      )}
      {kind === 2 && stage === 2 && (
        <path d="M5 12h2v2H5zm5 3h2v2h-2z" fill="#ffe1a0" />
      )}
    </g>
  )
}
export function Tree({
  bamboo = false,
  desert = false,
  grave = false,
  pale = false,
}: {
  bamboo?: boolean
  desert?: boolean
  pale?: boolean
  grave?: boolean
}) {
  if (grave) return <Coffin />
  if (desert)
    return (
      <g fill="#79966b">
        <path d="M12 2h7v31h-7zM3 12h6v8h7v5H3zm19-5h6v15H17v-5h5z" />
        <path d="M14 4h2v25h-2z" fill="#9bb276" />
      </g>
    )
  if (bamboo)
    return (
      <g>
        <path d="M12 0h4v40h-4zM23 5h3v35h-3z" fill="#608351" />
        <path d="M12 9h4v2h-4zm0 14h4v2h-4zM23 16h3v2h-3z" fill="#c2ce89" />
        <path
          d="M13 8 0 2l4 7 9 4zm2 7L29 5l-3 8-11 6zM24 23l10-9-1 7-9 7zM12 30 1 19l2 8 9 8z"
          fill="#537e49"
        />
      </g>
    )
  return (
    <g>
      <path d="M14 23h7v17h-7z" fill={pale ? '#c7c8c1' : '#8e7654'} />
      <path
        d="M6 8h6V2h14v6h6v9h5v10H1V17h5z"
        fill={pale ? '#b5b9b4' : '#597d50'}
      />
      <path d="M8 9h8V4h8v6h6v9H8z" fill={pale ? '#d7d8cf' : '#729552'} />
      <path d="M3 25h30v5H3z" fill={pale ? '#9fa8a2' : '#456e47'} />
    </g>
  )
}
export function House({ color = 0 }: { color?: number }) {
  return (
    <g>
      <path d="M2 58h106v9H2z" fill="#566640" opacity=".2" />
      <path
        d="M14 20h80v40H14z"
        fill={['#d6bd8a', '#d0c7b1', '#bca6a3'][color]}
      />
      <path d="M14 35h80v3H14zm0 14h80v2H14z" fill="#b79d6d" />
      <path
        d="M5 25V18h9v-8h12V2h54v8h12v8h10v10H5z"
        fill={['#916f50', '#6c897c', '#92756e'][color]}
      />
      <path d="M14 17h80v4H14zm12-9h54v4H26z" fill="#b28a5b" />
      <path d="M74 2v-14h10V9z" fill="#9e947b" />
      <path d="M48 34h20v26H48z" fill="#735f46" />
      <path d="M51 37h14v23H51z" fill="#584e3d" />
      <path d="M60 49h3v3h-3z" fill="#d8b66a" />
      <path d="M23 34h16v14H23zm52 0h13v14H75z" fill="#f3db96" />
      <path d="M30 34h3v14h-3zm-7 6h16v3H23zm57-6h3v14h-3z" fill="#8e7955" />
      <path d="M44 60h29v5H44zm-4 5h37v4H40z" fill="#c7bb99" />
      <path d="M17 54h18v6H17z" fill="#9e7953" />
      <path d="M20 50h5v6h-5zm8-3h4v9h-4z" fill="#75924b" />
    </g>
  )
}
export function Animal({ kind = 0 }: { kind?: number }) {
  return (
    <g>
      <ellipse cx="10" cy="17" rx="10" ry="3" fill="#48693e" opacity=".16" />
      <path
        d="M3 6h13v11H3zM13 2h7v10h-7z"
        fill={kind === 1 ? '#c6b293' : kind === 2 ? '#e5e1cf' : '#fff2cb'}
      />
      {kind === 0 ? (
        <>
          <path d="M14 0h4v3h-4z" fill="#bb6860" />
          <path d="M20 6h4v3h-4zM5 17h3v3H5zm8 0h3v3h-3z" fill="#c39b47" />
        </>
      ) : (
        <path d="M13 0h2v6h-2zm5 0h2v6h-2z" fill="#c6b293" />
      )}
      {kind === 2 && (
        <>
          <path
            d="M0 6h4v9H0zm5-3h9v3H5zm-3 13h3v4H2zm11 0h3v4h-3z"
            fill="#e5e1cf"
          />
          <path d="M13 3h4v10h-4z" fill="#a69c85" />
        </>
      )}
      <path d="M17 5h2v2h-2z" fill="#435144" />
    </g>
  )
}

export function Crow() {
  return (
    <g>
      <path d="M3 7h4V3h6v4h3v7H5v3H1v-4h2z" fill="#303936" />
      <path d="M13 6h5v3h-5z" fill="#a99b75" />
      <rect x="11" y="5" width="1" height="1" fill="#dbcca1" />
    </g>
  )
}
export function WinePot() {
  return (
    <g>
      <ellipse cx="8" cy="15" rx="12" ry="3" fill="#435448" opacity=".2" />
      <path d="M2 1h9v4h3v10H0V5h2zM13 5h4V1h3v7h-7z" fill="#997352" />
      <path d="M2 0h9v3H2zM3 7h7v6H3z" fill="#d7ba80" />
      <path d="M-9 11h6v5h-6zm30 0h6v5h-6z" fill="#e8ddbc" />
    </g>
  )
}
export function Decoration({ kind }: { kind: number }) {
  if (kind >= 12 && kind <= 14)
    return (
      <g>
        <path
          d="M1 6h10v3h3V4h3v11h-3v-3h-3v3H1l-4-4V9z"
          fill={['#9daea2', '#caa471', '#7a9b9d'][kind - 12]}
        />
        <rect x="1" y="8" width="2" height="2" fill="#384b45" />
      </g>
    )
  if (kind === 15)
    return (
      <g>
        <path
          d="M0 0h16v3H0zM2 3v18m12-18v18"
          stroke="#8e7550"
          strokeWidth="2"
        />
        <path d="M6 3v7m5-7v10" stroke="#bbb27c" />
        <path d="M4 9h4v5H4zm5 3h4v5H9z" fill="#80a69c" />
      </g>
    )
  if (kind === 16)
    return (
      <g>
        <path d="M6 9h4v10H6zM2 18h12v3H2zM2 3h12v8H2z" fill="#9a9c89" />
        <path d="M0 3 8-3l8 6z" fill="#7d8679" />
        <path d="M5 5h6v4H5z" fill="#edd49a" />
      </g>
    )
  if (kind === 17)
    return (
      <g>
        <path
          d="M2 8h12v8H2zM4 16v4m8-4v4"
          fill="#78998a"
          stroke="#78998a"
          strokeWidth="2"
        />
        <path d="M1 8 8 0l7 8z" fill="#98aa8b" />
        <path d="M8-2v-6" stroke="#c4c7b0" strokeWidth="2" />
      </g>
    )
  if (kind === 19)
    return (
      <g>
        <path
          d="M0-9h18M2-9-2 21m18-30 4 30M6-8v21m6-21v21"
          stroke="#937654"
          strokeWidth="2"
        />
        <path d="M3 12h12v4H3z" fill="#b39a71" />
      </g>
    )
  if (kind === 20)
    return (
      <g>
        <path d="M0 3h17v14H0z" fill="#a66c4d" />
        <path d="M-1 2h19v4H-1zM2 8h13v5H2z" fill="#d8b378" />
        <path d="M5 0v-3h7v3" stroke="#89684a" fill="none" />
      </g>
    )
  if (kind >= 9 && kind <= 11)
    return (
      <g>
        <ellipse cx="8" cy="13" rx="9" ry="4" fill="#d9d2b7" />
        <path
          d="M1 5h3V2h8v3h3v7H1z"
          fill={kind === 9 ? '#c08c4c' : '#f2e4be'}
        />
        <path
          d={
            kind === 9
              ? 'M4 5h8v4H4zM7 3v8'
              : kind === 10
                ? 'M5 4l3 3 3-3'
                : 'M3 10h10'
          }
          fill="none"
          stroke={kind === 9 ? '#98653c' : '#ccbb95'}
          strokeWidth="1"
        />
      </g>
    )
  if (kind === 0)
    return (
      <g fill="#8a7050">
        <path d="M1 8h14v4H1zm2 4h3v7H3zm8 0h3v7h-3z" />
        <path d="M2 2h12v5H2z" fill="#b69b6a" />
      </g>
    )
  if (kind === 1)
    return (
      <g>
        <path d="M7 0h3v20H7z" fill="#8e7856" />
        <path d="M3 0h11v9H3z" fill="#e7c578" />
      </g>
    )
  if (kind === 2 || kind === 3)
    return (
      <g>
        <path d="M3 7h10v11H3z" fill="#b8836e" />
        <Plant kind={2} stage={1} />
      </g>
    )
  if (kind === 4)
    return (
      <g>
        <path d="M5 0h6v5l4 5v7H1v-7l4-5z" fill="#7baba0" />
        <path d="M4 10h8v2H4z" fill="#c6d2ac" />
      </g>
    )
  if (kind === 6)
    return (
      <g fill="#806043">
        <path d="M1 0h3v18H1zm12 0h3v18h-3zM1 0h15v3H1zM1 10h15v3H1zM7 3h3v7H7z" />
        <path d="M3 8h10v3H3z" fill="#b49a6a" />
      </g>
    )
  if (kind === 7)
    return (
      <g>
        <path d="M-3-10h22v29H-3z" fill="#866346" />
        <path d="M-1-8h18v23H-1z" fill="#e3d6ad" />
        <path d="M5-8v23m6-23v23" stroke="#a58d65" />
        <path d="M0 12 5 2l5 6 3-5 4 9z" fill="#7e937a" />
      </g>
    )
  return (
    <g>
      <path d="M-4 6h24v4H-4zM-2 10h3v9h-3zm17 0h3v9h-3z" fill="#896747" />
      {kind === 18 ? (
        <>
          <path d="M0 0h17v7H0z" fill="#d5bc86" />
          <path
            d="M3 1v5m4-5v5m4-5v5m4-5v5M1 2h15m-15 3h15"
            stroke="#967c55"
            strokeWidth=".5"
          />
          <path d="M4 2h2v2H4zm6 2h2v2h-2z" fill="#485249" />
        </>
      ) : kind === 8 ? (
        <>
          <path d="M0 3h17v3H0z" fill="#55483c" />
          <path d="M2 3h12" stroke="#cdb68a" />
        </>
      ) : (
        <>
          <path d="M2 2h6v4H2z" fill="#7baba0" />
          <path d="M11 4h4v2h-4z" fill="#ddd1ab" />
        </>
      )}
    </g>
  )
}
