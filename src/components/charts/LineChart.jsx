import { useState } from 'react';

export const DEFAULT_DATA = [
  { year: 1999, participation: 93.3,  invalidVotes: 9.0  },
  { year: 2004, participation: 84.1,  invalidVotes: 3.0  },
  { year: 2009, participation: 70.9,  invalidVotes: 2.9  },
  { year: 2014, participation: 75.1,  invalidVotes: 3.3  },
  { year: 2019, participation: 81.78, invalidVotes: 2.49 },
  { year: 2024, participation: 82.0,  invalidVotes: 3.5  },
];

export const DEFAULT_SERIES = [
  {
    key: 'participation',
    label: 'Tingkat Partisipasi',
    tooltipLabel: 'Partisipasi',
    color: '#F97316',
    strokeWidth: 2.5,
    dashed: false,
    dotRadius: 4,
    showValueLabels: true,
  },
  {
    key: 'invalidVotes',
    label: 'Suara Tidak Sah',
    tooltipLabel: 'Suara Tdk Sah',
    color: '#94a3b8',
    strokeWidth: 2,
    dashed: true,
    dotRadius: 3,
    showValueLabels: false,
  },
];

const CONFIG = {
  width:  700,
  height: 240,
  pad:    { left: 48, right: 20, top: 30, bottom: 36 },
  yMin:   0,
  yMax:   100,
  yTicks: [0, 20, 40, 60, 80, 100],
};

const innerW = CONFIG.width  - CONFIG.pad.left - CONFIG.pad.right;
const innerH = CONFIG.height - CONFIG.pad.top  - CONFIG.pad.bottom;

const xOf = (i, len) => CONFIG.pad.left + (i / (len - 1)) * innerW;
const yOf = (v) => CONFIG.pad.top + (1 - (v - CONFIG.yMin) / (CONFIG.yMax - CONFIG.yMin)) * innerH;

const LABEL_OFFSET = 7;
const RIGHT_EDGE   = CONFIG.width - CONFIG.pad.right;

const valueLabelAttrs = (i, v, len) => {
  const x = xOf(i, len);
  const nearRight = x + LABEL_OFFSET + 26 > RIGHT_EDGE;
  return {
    x: nearRight ? x - LABEL_OFFSET : x + LABEL_OFFSET,
    y: yOf(v) - 8,
    textAnchor: nearRight ? 'end' : 'start',
  };
};

const TOOLTIP_W = 158;
const tooltipX = (i, len) => {
  const right = xOf(i, len) + 14;
  return right + TOOLTIP_W > RIGHT_EDGE ? xOf(i, len) - TOOLTIP_W - 14 : right;
};

export default function LineChart({ data = DEFAULT_DATA, series = DEFAULT_SERIES }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const len = data.length;

  const handleMouseMove = (e) => {
    const svg = e.currentTarget.closest('svg');
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (CONFIG.width / rect.width) - CONFIG.pad.left;
    const idx = Math.round(mouseX / (innerW / (len - 1)));
    setHoveredIndex(Math.max(0, Math.min(len - 1, idx)));
  };

  const isHovered = hoveredIndex !== null;
  const TOOLTIP_H = series.length * 22 + 30;

  return (
    <svg
      viewBox={`0 0 ${CONFIG.width} ${CONFIG.height}`}
      className="w-full h-auto"
      aria-label="Grafik Tren Data Pemilu"
      role="img"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <defs>
        <filter id="tip-shadow" x="-10%" y="-20%" width="130%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Grid + Y-axis */}
      {CONFIG.yTicks.map((tick) => (
        <g key={tick}>
          <line x1={CONFIG.pad.left} y1={yOf(tick)} x2={CONFIG.width - CONFIG.pad.right} y2={yOf(tick)}
            stroke="#e2e8f0" strokeWidth="1" />
          <text x={CONFIG.pad.left - 8} y={yOf(tick) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {tick}
          </text>
        </g>
      ))}

      {/* X-axis */}
      {data.map((d, i) => (
        <text key={d.year} x={xOf(i, len)} y={CONFIG.height - 6} textAnchor="middle" fontSize="10"
          fill={hoveredIndex === i ? '#1e293b' : '#94a3b8'}
          fontWeight={hoveredIndex === i ? '700' : '400'}>
          {d.year}
        </text>
      ))}

      {/* Lines */}
      {series.map((s) => (
        <polyline key={s.key}
          points={data.map((d, i) => `${xOf(i, len)},${yOf(d[s.key])}`).join(' ')}
          fill="none" stroke={s.color} strokeWidth={s.strokeWidth}
          strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray={s.dashed ? '5 3' : undefined}
          opacity={isHovered ? 0.35 : 1}
          style={{ transition: 'opacity 150ms ease' }}
        />
      ))}

      {/* Data points + value labels */}
      {series.map((s) =>
        data.map((d, i) => {
          const active = hoveredIndex === i;
          const r = active ? s.dotRadius + 2 : s.dotRadius;
          return (
            <g key={`${s.key}-${i}`} opacity={isHovered && !active ? 0.25 : 1}
               style={{ transition: 'opacity 150ms ease' }}>
              {active && <circle cx={xOf(i, len)} cy={yOf(d[s.key])} r={r + 4} fill={s.color} opacity="0.2" />}
              <circle cx={xOf(i, len)} cy={yOf(d[s.key])} r={r}
                fill={active ? 'white' : s.color} stroke={s.color} strokeWidth={active ? 2 : 0} />
              {s.showValueLabels && !isHovered && (() => {
                const { x, y, textAnchor } = valueLabelAttrs(i, d[s.key], len);
                return <text x={x} y={y} textAnchor={textAnchor} fontSize="9" fill={s.color} fontWeight="600">{d[s.key]}</text>;
              })()}
            </g>
          );
        })
      )}

      {/* Hover guide + tooltip */}
      {isHovered && (
        <>
          <line x1={xOf(hoveredIndex, len)} y1={CONFIG.pad.top}
            x2={xOf(hoveredIndex, len)} y2={CONFIG.pad.top + innerH}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
          {(() => {
            const tx = tooltipX(hoveredIndex, len);
            const ty = CONFIG.pad.top + 4;
            const d  = data[hoveredIndex];
            return (
              <g>
                <rect x={tx} y={ty} width={TOOLTIP_W} height={TOOLTIP_H}
                  rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" filter="url(#tip-shadow)" />
                <text x={tx + 12} y={ty + 18} fontSize="11" fontWeight="700" fill="#1e293b">
                  Pemilu {d.year}
                </text>
                {series.map((s, si) => (
                  <g key={s.key} transform={`translate(${tx + 12}, ${ty + 30 + si * 22})`}>
                    <circle cx="5" cy="5" r="4" fill={s.color} />
                    <text x="14" y="9" fontSize="10" fill="#64748b">
                      {s.tooltipLabel}:{' '}
                      <tspan fontWeight="700" fill={s.color}>{d[s.key]}%</tspan>
                    </text>
                  </g>
                ))}
              </g>
            );
          })()}
        </>
      )}

      {/* Hit area */}
      <rect x={CONFIG.pad.left} y={CONFIG.pad.top} width={innerW} height={innerH}
        fill="transparent" onMouseMove={handleMouseMove} style={{ cursor: 'crosshair' }} />

      {/* Legend */}
      <g transform={`translate(${CONFIG.pad.left}, 8)`}>
        {series.map((s, i) => (
          <g key={s.key} transform={`translate(${i * 130}, 0)`}>
            {s.dashed ? (
              <>
                <line x1="0" y1="6" x2="12" y2="6" stroke={s.color} strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="18" cy="6" r={s.dotRadius} fill={s.color} />
              </>
            ) : (
              <circle cx="6" cy="6" r={s.dotRadius} fill={s.color} />
            )}
            <text x={s.dashed ? 24 : 14} y="10" fontSize="10" fill="#64748b">{s.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
