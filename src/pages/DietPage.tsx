import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../i18n'
import { ChevronLeft, Plus, Edit2, Trash2 } from 'lucide-react'
import { DietWeek } from '../types'
import Layout from '../components/layout/Layout'
import DietItemRow from '../components/pet/DietItemRow'
import ModalWrapper from '../components/ui/ModalWrapper'
import ConfirmModal from '../components/ui/ConfirmModal'
import FormField, { inputCls } from '../components/ui/FormField'
import WeekEditorModal from '../components/pet/WeekEditorModal'
import WeekRow from '../components/pet/WeekRow'
import { getDayAndWeek } from '../utils/dietUtils'

export default function DietPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets, language, updatePet, deleteDiet } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const t = translations[language]

    const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [editingWeek, setEditingWeek] = useState<number | null>(null)
    const [showPastWeeks, setShowPastWeeks] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showEditDateModal, setShowEditDateModal] = useState(false)
    const [editStartDate, setEditStartDate] = useState('')
    const [showStartNewDietModal, setShowStartNewDietModal] = useState(false)
    const [newDietStartDate, setNewDietStartDate] = useState('')
    const [isNewDietMode, setIsNewDietMode] = useState(false)
    const [pendingNewStartDate, setPendingNewStartDate] = useState('')

    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const progress = getDayAndWeek(pet.dietStartDate)
    const currentWeek = progress?.week || null
    const dietSchedule = pet.dietSchedule || []
    const pastWeeks = dietSchedule.filter(w => currentWeek && w.week < currentWeek)
    const activeWeeks = dietSchedule.filter(w => !currentWeek || w.week >= currentWeek)

    const openEditDateModal = () => {
        setEditStartDate(pet.dietStartDate || new Date().toISOString().split('T')[0])
        setShowEditDateModal(true)
    }

    const handleSaveDate = () => {
        updatePet({ ...pet, dietStartDate: editStartDate })
        setShowEditDateModal(false)
    }

    const handleDeleteDiet = () => {
        deleteDiet(pet.id)
        navigate(`/pet/${id}`)
    }

    const openWeekEditor = (weekNum: number) => {
        setEditingWeek(weekNum)
    }

    const handleSaveWeek = (weekNum: number, items: typeof dietSchedule[0]['items']) => {
        if (isNewDietMode) {
            const newSchedule: DietWeek[] = [{ week: weekNum, items }]
            deleteDiet(pet.id)
            updatePet({ ...pet, dietSchedule: newSchedule, dietStartDate: pendingNewStartDate || null })
            setIsNewDietMode(false)
            setPendingNewStartDate('')
        } else {
            const existing = dietSchedule.find(w => w.week === weekNum)
            const updatedSchedule: DietWeek[] = existing
                ? dietSchedule.map(w => w.week === weekNum ? { ...w, items } : w)
                : [...dietSchedule, { week: weekNum, items }]
            updatePet({ ...pet, dietSchedule: updatedSchedule })
        }
        setEditingWeek(null)
    }

    const handleCancelWeek = () => {
        setEditingWeek(null)
        setIsNewDietMode(false)
        setPendingNewStartDate('')
    }

    const handleDeleteWeek = (weekNum: number) => {
        const updatedSchedule = dietSchedule
            .filter(w => w.week !== weekNum)
            .map((w, index) => ({ ...w, week: index + 1 }))
        updatePet({ ...pet, dietSchedule: updatedSchedule })
    }

    const handleAddWeek = () => {
        const newWeekNumber = dietSchedule.length + 1
        updatePet({ ...pet, dietSchedule: [...dietSchedule, { week: newWeekNumber, items: [] }] })
        openWeekEditor(newWeekNumber)
    }

    const editingWeekData = editingWeek !== null ? dietSchedule.find(w => w.week === editingWeek) : null
    const prevWeekItems = editingWeek && editingWeek > 1
        ? dietSchedule.find(w => w.week === editingWeek - 1)?.items
        : undefined

    return (
        <Layout>
            <div className="min-h-screen bg-app pb-20">

                {/* Header */}
                <div className="sticky top-0 z-30 bg-hero px-5 pb-6 hero-header">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate(`/pet/${id}`)}
                            className="flex items-center gap-1 text-on-hero text-sm font-bold"
                        >
                            <ChevronLeft size={16} />
                            {t.goBack}
                        </button>

                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center gap-1 bg-on-hero/20 text-on-hero px-3 py-1.5 rounded-full text-sm font-bold"
                            >
                                <Edit2 size={14} />
                                {t.edit}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-1 py-1.5 rounded-full text-sm font-bold text-on-hero"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button
                                    onClick={() => { setEditMode(false); setEditingWeek(null) }}
                                    className="px-3 py-1.5 rounded-full text-sm font-bold text-on-hero"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={() => { setEditMode(false); setEditingWeek(null) }}
                                    className="bg-on-hero text-hero px-3 py-1.5 rounded-full text-sm font-bold"
                                >
                                    {t.done}
                                </button>
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-on-hero mb-2">🍽️ {t.diet}</h1>

                    {pet.dietStartDate ? (
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-on-hero">
                                {t.startedOn} {new Date(pet.dietStartDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </div>
                            <button
                                onClick={openEditDateModal}
                                className="w-6 h-6 rounded-full bg-on-hero/20 flex items-center justify-center text-on-hero"
                            >
                                <Edit2 size={12} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={openEditDateModal} className="text-sm text-on-hero underline opacity-75">
                            {t.setStartDate}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="px-5 py-4 space-y-4">

                    {/* Today's highlight */}
                    {!editMode && currentWeek && dietSchedule[currentWeek - 1] && (
                        <div className="bg-accent rounded-2xl p-4 shadow-lg">
                            <div className="text-xs font-bold text-on-hero uppercase tracking-wide mb-2">
                                {t.today} · {t.day} {progress?.day} · {t.week} {currentWeek}
                            </div>
                            <div className="space-y-2">
                                {dietSchedule[currentWeek - 1].items.map((item, idx) => (
                                    <DietItemRow key={idx} item={item} unitLabel={t.unitLabels[item.unit]} variant="on-hero" compact />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Diet completed CTA */}
                    {!editMode && dietSchedule.length > 0 && progress && progress.week > dietSchedule.length && (
                        <button
                            onClick={() => {
                                setNewDietStartDate(new Date().toISOString().split('T')[0])
                                setShowStartNewDietModal(true)
                            }}
                            className="w-full bg-accent rounded-2xl p-4 flex items-center gap-4 text-on-hero active:scale-95 transition-transform shadow-sm"
                        >
                            <div className="w-9 h-9 rounded-full bg-on-hero/20 flex items-center justify-center flex-shrink-0">
                                <Plus size={20} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black">{t.startNewDiet}</div>
                                <div className="text-xs opacity-75 mt-0.5">{t.dietExplanation}</div>
                            </div>
                        </button>
                    )}

                    {/* Week list */}
                    <div>
                        {dietSchedule.length === 0 ? (
                            <button
                                onClick={handleAddWeek}
                                className="w-full bg-accent rounded-2xl p-5 flex items-center gap-4 text-on-hero active:scale-95 transition-transform shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-on-hero/20 flex items-center justify-center flex-shrink-0">
                                    <Plus size={22} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black">🍽️ {t.createDiet}</div>
                                    <div className="text-xs opacity-75 mt-0.5">{t.dietExplanation}</div>
                                </div>
                            </button>
                        ) : (
                            <>
                                {/* Full schedule (when diet is done — all past) */}
                                {pastWeeks.length > 0 && activeWeeks.length === 0 && (
                                    <div>
                                        <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                                            {t.fullSchedule} · {dietSchedule.length} {t.weeks}
                                        </h2>
                                        <div className="space-y-2 opacity-60">
                                            {pastWeeks.map(weekData => (
                                                <WeekRow
                                                    key={weekData.week}
                                                    weekData={weekData}
                                                    isExpanded={expandedWeek === weekData.week}
                                                    t={t}
                                                    onToggle={() => setExpandedWeek(expandedWeek === weekData.week ? null : weekData.week)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Active weeks */}
                                {activeWeeks.length > 0 && (
                                    <div>
                                        <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                                            {t.fullSchedule}
                                        </h2>
                                        <div className="space-y-2">
                                            {activeWeeks.map(weekData => (
                                                <WeekRow
                                                    key={weekData.week}
                                                    weekData={weekData}
                                                    isCurrent={currentWeek === weekData.week}
                                                    isExpanded={expandedWeek === weekData.week}
                                                    editMode={editMode}
                                                    editVariant="primary"
                                                    t={t}
                                                    onToggle={() => setExpandedWeek(expandedWeek === weekData.week ? null : weekData.week)}
                                                    onEdit={() => openWeekEditor(weekData.week)}
                                                />
                                            ))}

                                            {editMode && (
                                                <button
                                                    onClick={handleAddWeek}
                                                    className="w-full bg-card rounded-2xl p-4 border-2 border-dashed border-border flex items-center justify-center gap-2 text-accent active:scale-95 transition-transform"
                                                >
                                                    <Plus size={20} />
                                                    <span className="text-sm font-bold">{t.addWeek}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Past weeks toggle */}
                                        {pastWeeks.length > 0 && (
                                            <div className="mt-6">
                                                <button
                                                    onClick={() => setShowPastWeeks(!showPastWeeks)}
                                                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-muted py-2"
                                                >
                                                    <span>{showPastWeeks ? t.hidePastWeeks : t.showPastWeeks} ({pastWeeks.length})</span>
                                                    <span className={`transition-transform ${showPastWeeks ? 'rotate-180' : ''}`}>▼</span>
                                                </button>

                                                {showPastWeeks && (
                                                    <div className="space-y-2 mt-3 opacity-60">
                                                        {pastWeeks.map(weekData => (
                                                            <WeekRow
                                                                key={weekData.week}
                                                                weekData={weekData}
                                                                isExpanded={expandedWeek === weekData.week}
                                                                editMode={editMode}
                                                                editVariant="muted"
                                                                t={t}
                                                                onToggle={() => setExpandedWeek(expandedWeek === weekData.week ? null : weekData.week)}
                                                                onEdit={() => openWeekEditor(weekData.week)}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Week Editor Modal */}
                {editingWeek !== null && (
                    <WeekEditorModal
                        weekNum={editingWeek}
                        initialItems={editingWeekData?.items ?? []}
                        prevWeekItems={prevWeekItems}
                        language={language}
                        t={t}
                        onSave={(items) => handleSaveWeek(editingWeek, items)}
                        onCancel={handleCancelWeek}
                        onDelete={() => { handleDeleteWeek(editingWeek); handleCancelWeek() }}
                    />
                )}

                {/* Edit Date Modal */}
                {showEditDateModal && (
                    <ModalWrapper onClose={() => setShowEditDateModal(false)} elevated>
                        <h2 className="text-xl font-black text-primary mb-6">{t.editStartDate}</h2>
                        <FormField label={t.dietStart}>
                            <input
                                type="date"
                                value={editStartDate}
                                onChange={(e) => setEditStartDate(e.target.value)}
                                className={inputCls}
                            />
                        </FormField>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowEditDateModal(false)} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">
                                {t.cancel}
                            </button>
                            <button onClick={handleSaveDate} className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold">
                                {t.save}
                            </button>
                        </div>
                    </ModalWrapper>
                )}

                {/* Start New Diet Modal */}
                {showStartNewDietModal && (
                    <ModalWrapper onClose={() => setShowStartNewDietModal(false)} elevated>
                        <h2 className="text-xl font-black text-primary mb-3">{t.startNewDiet}?</h2>
                        <p className="text-sm text-muted mb-5">{t.archiveNotice}</p>
                        <div className="mb-6">
                            <FormField label={t.dietStart}>
                                <input
                                    type="date"
                                    value={newDietStartDate}
                                    onChange={(e) => setNewDietStartDate(e.target.value)}
                                    className={inputCls}
                                />
                            </FormField>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowStartNewDietModal(false)} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">
                                {t.cancel}
                            </button>
                            <button
                                onClick={() => {
                                    setIsNewDietMode(true)
                                    setPendingNewStartDate(newDietStartDate)
                                    setEditingWeek(1)
                                    setShowStartNewDietModal(false)
                                }}
                                className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold"
                            >
                                {t.startNewDiet}
                            </button>
                        </div>
                    </ModalWrapper>
                )}

                {/* Delete Diet Confirmation */}
                {showDeleteConfirm && (
                    <ConfirmModal
                        title={t.deleteDietConfirm}
                        description={t.deleteDietExplanation}
                        confirmLabel={t.delete}
                        cancelLabel={t.cancel}
                        onConfirm={handleDeleteDiet}
                        onClose={() => setShowDeleteConfirm(false)}
                        danger
                    />
                )}
            </div>
        </Layout>
    )
}
