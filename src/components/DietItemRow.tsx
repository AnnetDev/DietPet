import { DietItem } from '../types'
import { getItemIcon } from '../utils/dietUtils'

interface DietItemRowProps {
    item: DietItem
    /** Pre-resolved unit label string, e.g. t.unitLabels[item.unit] */
    unitLabel: string
    /** on-hero = accent card style (orange bg), default = neutral card */
    variant?: 'default' | 'on-hero'
    /** compact = py-2, default = py-2.5 */
    compact?: boolean
}

export default function DietItemRow({ item, unitLabel, variant = 'default', compact = false }: DietItemRowProps) {
    const isHero = variant === 'on-hero'
    return (
        <div className={`flex items-center justify-between rounded-xl px-3 ${compact ? 'py-2' : 'py-2.5'} ${isHero ? 'bg-on-hero/10' : 'bg-app'}`}>
            <div className={`flex items-center gap-2 ${isHero ? 'text-on-hero' : ''}`}>
                <span className="text-base">{getItemIcon(item.type)}</span>
                <span className={`font-semibold text-sm ${isHero ? '' : 'text-primary'}`}>{item.name}</span>
            </div>
            <div className={`font-black text-sm ${isHero ? 'text-on-hero' : 'text-primary'}`}>
                {item.amount} {unitLabel}
            </div>
        </div>
    )
}
