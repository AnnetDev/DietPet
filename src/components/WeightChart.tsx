import { WeightEntry } from '../types'
import { Language } from '../types'

interface WeightChartProps {
    data: WeightEntry[]
    language: Language
}

export default function WeightChart({ data, language }: WeightChartProps) {
    if (data.length === 0) return null

    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue || 1

    const padding = range * 0.15
    const chartMin = minValue - padding
    const chartMax = maxValue + padding
    const chartRange = chartMax - chartMin

    const leftPadding = 0
    const rightPadding = 0
    const chartWidth = 100 - leftPadding - rightPadding

    const points = data.map((entry, i) => {
        const x = leftPadding + (i / (data.length - 1 || 1)) * chartWidth
        const y = 100 - ((entry.value - chartMin) / chartRange) * 80
        return { x, y, entry }
    })

    const pathD = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ')

    return (
        <div className="w-full">
            <svg 
                viewBox="0 0 100 100" 
                className="w-full h-56" 
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Grid lines */}
                {[10, 30, 50, 70, 90].map(y => (
                    <line
                        key={y}
                        x1={leftPadding}
                        y1={y}
                        x2={100 - rightPadding}
                        y2={y}
                        stroke="var(--border)"
                        strokeWidth="0.2"
                    />
                ))}

                {/* Area under line */}
                <path
                    d={`${pathD} L ${100 - rightPadding} 100 L ${leftPadding} 100 Z`}
                    fill="var(--accent)"
                    opacity="0.1"
                />

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points with labels */}
                {points.map((p, i) => (
                    <g key={i}>
                        {/* Vertical tick */}
                        <line
                            x1={p.x}
                            y1={p.y - 2}
                            x2={p.x}
                            y2={p.y + 2}
                            stroke="var(--accent)"
                            strokeWidth="1"
                            strokeLinecap="round"
                        />
                        
                        {/* Date label */}
                        <text
                            x={p.x}
                            y={p.y - 4}
                            textAnchor="middle"
                            fill="var(--text-muted)"
                            fontSize="3.5"
                            fontWeight="600"
                        >
                            {new Date(p.entry.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                day: 'numeric',
                                month: 'short'
                            })}
                        </text>

                        {/* Weight value */}
                        <text
                            x={p.x}
                            y={p.y + 7}
                            textAnchor="middle"
                            fill="var(--text-primary)"
                            fontSize="4"
                            fontWeight="700"
                        >
                            {p.entry.value} {language === 'ru' ? 'кг' : 'kg'}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    )
}