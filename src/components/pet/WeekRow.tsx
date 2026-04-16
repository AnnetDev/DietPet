import { DietWeek } from '../../types'
import DietItemRow from './DietItemRow'
import { translations } from '../../i18n'

interface WeekRowProps {
    weekData: DietWeek
    isCurrent?: boolean
    isExpanded: boolean
    editMode?: boolean
    /** Style of the edit button when editMode is active */
    editVariant?: 'primary' | 'muted'
    t: typeof translations.ru | typeof translations.en
    onToggle: () => void
    onEdit?: () => void
}

export default function WeekRow({
    weekData,
    isCurrent = false,
    isExpanded,
    editMode = false,
    editVariant = 'primary',
    t,
    onToggle,
    onEdit,
}: WeekRowProps) {
    return (
        <div className={`bg-card rounded-2xl shadow-sm overflow-hidden transition-all ${isCurrent ? 'ring-2 ring-accent' : ''}`}>
            <button
                onClick={() => !editMode && onToggle()}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${isCurrent ? 'bg-accent text-on-hero' : 'bg-app text-muted'}`}>
                        {weekData.week}
                    </div>
                    <div>
                        <div className="font-black text-primary text-sm">{t.week} {weekData.week}</div>
                        <div className="text-xs text-muted">{weekData.items.length} {t.items}</div>
                    </div>
                </div>

                {editMode && onEdit ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit() }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${editVariant === 'primary' ? 'bg-accent text-on-hero' : 'bg-app text-muted'}`}
                    >
                        {t.edit}
                    </button>
                ) : (
                    <div className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
                )}
            </button>

            {isExpanded && !editMode && (
                <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                    {weekData.items.map((item, idx) => (
                        <DietItemRow key={idx} item={item} unitLabel={t.unitLabels[item.unit]} compact />
                    ))}
                </div>
            )}
        </div>
    )
}
