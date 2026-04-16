interface ProgressBarProps {
    percent: number
    leftLabel?: string
    rightLabel?: string
    /** sm = h-1.5 (default), md = h-2 */
    height?: 'sm' | 'md'
    /** default = accent bar on app bg, hero = on-hero bar on on-hero/20 bg, completed = green bar */
    variant?: 'default' | 'hero' | 'completed'
}

export default function ProgressBar({
    percent,
    leftLabel,
    rightLabel,
    height = 'sm',
    variant = 'default',
}: ProgressBarProps) {
    const bgClass = variant === 'hero' ? 'bg-on-hero/20' : 'bg-app'
    const barClass =
        variant === 'hero' ? 'bg-on-hero' :
        variant === 'completed' ? 'bg-green-700/60' :
        'bg-accent'
    const heightClass = height === 'md' ? 'h-2' : 'h-1.5'

    return (
        <div>
            {(leftLabel || rightLabel) && (
                <div className="flex justify-between text-xs text-muted mb-1">
                    {leftLabel && <span>{leftLabel}</span>}
                    {rightLabel && <span>{rightLabel}</span>}
                </div>
            )}
            <div className={`${heightClass} ${bgClass} rounded-full overflow-hidden`}>
                <div
                    className={`h-full ${barClass} rounded-full transition-all`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                />
            </div>
        </div>
    )
}
