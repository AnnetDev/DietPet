import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../i18n'
import { Pet } from '../types'
import { ChevronLeft, Dot, SquarePen, Pill, Dumbbell, Plus, Trash2, RotateCcw, Edit2 } from 'lucide-react'
import EditPetModal from '../components/pet/EditPetModal'
import Layout from '../components/layout/Layout'
import ProgressBar from '../components/ui/ProgressBar'
import DietItemRow from '../components/pet/DietItemRow'
import ModalWrapper from '../components/ui/ModalWrapper'
import FormField, { inputCls } from '../components/ui/FormField'
import { getDayAndWeek, getAgeFromBirthDate, getDaysUntilDelete } from '../utils/dietUtils'

export default function PetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [editModalOpen, setEditModalOpen] = useState(false)
    const { pets, deletedDiets, language, updatePet, restoreDiet, permanentlyDeleteDietByDate } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const [showDeletedDiets, setShowDeletedDiets] = useState(false)
    const t = translations[language]
    const [showEditNotesModal, setShowEditNotesModal] = useState(false)
    const [editNotes, setEditNotes] = useState('')


    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const progress = getDayAndWeek(pet.dietStartDate)
    const totalWeeks = pet.dietSchedule.length
    const dietDone = !!(progress && totalWeeks > 0 && progress.week > totalWeeks)
    const displayWeek = progress ? Math.min(progress.week, totalWeeks) : 0
    const petAge = pet.birthDate
        ? getAgeFromBirthDate(pet.birthDate)
        : (pet.age ? Number(pet.age) : null)

    const handleSave = (updates: Partial<Pet>) => {
        updatePet({ ...pet, ...updates })
    }

    const petDeletedDiets = deletedDiets.filter(d => d.petId === id)

    const openEditNotesModal = () => {
        setEditNotes(pet.notes || '')
        setShowEditNotesModal(true)
    }

    const handleSaveNotes = () => {
        updatePet({ ...pet, notes: editNotes })
        setShowEditNotesModal(false)
    }

    return (
        <Layout>
            <div className="min-h-screen bg-app">
                <div className="sticky top-0 z-30 bg-hero px-5 pb-6 hero-header">

                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/home')}
                            className="flex items-center gap-1 text-on-hero text-sm font-bold"
                        >
                            <ChevronLeft size={16} />
                            {t.goBack}
                        </button>

                        <button onClick={() => setEditModalOpen(true)}>
                            <SquarePen size={18} style={{ stroke: 'var(--text-on-hero)' }} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full bg-hero flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-on-hero/20">
                            {pet.photo
                                ? <img src={pet.photo} className="w-full h-full object-cover" alt={pet.name} />
                                : <span className="text-5xl">🐾</span>
                            }
                        </div>

                        <div className="text-3xl font-black text-on-hero">
                            {pet.name || t.newPet}
                        </div>

                        <div className="flex items-center text-on-hero text-sm opacity-90">
                            {pet.breed && <span>{pet.breed}</span>}
                            {pet.breed && petAge !== null && <Dot size={20} />}
                            {petAge !== null && (
                                <span>
                                    {petAge} {typeof t.years === 'function' ? t.years(petAge) : t.years}
                                </span>
                            )}
                            {pet.weightHistory.length > 0 && <Dot size={20} />}
                            {pet.weightHistory.length > 0 && (
                                <span>
                                    {pet.weightHistory[pet.weightHistory.length - 1]!.value} {t.kg}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info cards */}
                <div className="px-5 py-4 flex gap-3">
                    <button
                        onClick={() => navigate(`/pet/${id}/weight`)}
                        className="flex-1 bg-card rounded-2xl p-4 shadow-sm text-left active:scale-95 transition-transform"
                    >
                        <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1 flex gap-2">
                            <Dumbbell size={14} /> {t.weight}
                        </div>
                        <div className="text-2xl font-black text-primary">
                            {pet.weightHistory[pet.weightHistory.length - 1]?.value || '—'} {t.kg}
                        </div>
                    </button>

                    <button
                        onClick={() => navigate(`/pet/${id}/diagnosis`)}
                        className="flex-1 bg-card rounded-2xl p-4 shadow-sm text-left active:scale-95 transition-transform"
                    >
                        <div className="text-xs font-bold text-muted uppercase tracking-wide mb-1 flex gap-2">
                            <Pill size={14} /> {t.medicalCard}
                        </div>
                        {pet.diagnoses && pet.diagnoses.length > 0 ? (
                            <div className="text-sm font-black text-primary line-clamp-2">
                                {pet.diagnoses.map(d => d.name).join(', ')}
                            </div>
                        ) : (
                            <div className="text-sm font-bold text-muted italic">
                                {t.notSpecified}
                            </div>
                        )}
                    </button>
                </div>

                {/* Today's feeding plan — only when diet is active */}
                {!dietDone && progress && pet.dietSchedule[progress.week - 1] && (
                    <div className="px-5 pb-4">
                        <button
                            onClick={() => navigate(`/pet/${id}/diet`)}
                            className="w-full bg-accent rounded-2xl p-4 shadow-sm active:scale-95 transition-transform text-left"
                        >
                            <div className="text-xs font-bold text-on-hero uppercase tracking-wide mb-3">
                                {t.today} · {t.day} {progress.day} · {t.week} {progress.week}
                            </div>
                            <div className="space-y-2">
                                {pet.dietSchedule[progress.week - 1].items.map((item, idx) => (
                                    <DietItemRow key={idx} item={item} unitLabel={t.unitLabels[item.unit]} variant="on-hero" />
                                ))}
                            </div>
                        </button>
                    </div>
                )}

                {/* Diet card */}
                {pet.dietSchedule && pet.dietSchedule.length > 0 ? (
                    <div className="px-5 pb-4">
                        <button
                            onClick={() => navigate(`/pet/${id}/diet`)}
                            className="w-full bg-card rounded-2xl p-4 shadow-sm text-left active:scale-95 transition-transform"
                        >
                            <div className="mb-2">
                                <div className="text-xs font-bold text-muted uppercase tracking-wide">
                                    🍽️ {t.diet}
                                </div>
                            </div>
                            <div className="text-sm font-bold text-primary mb-3">
                                {pet.dietSchedule.length} {t.weeks} · {progress ? (dietDone ? t.dietCompleted : `${t.week} ${displayWeek}`) : t.notStarted}
                            </div>

                            {/* Progress bar — only when active */}
                            {progress && !dietDone && (
                                <ProgressBar
                                    percent={progress.day / (totalWeeks * 7) * 100}
                                    leftLabel={`${t.week} ${displayWeek} ${t.of} ${totalWeeks} · ${t.day} ${progress.day}`}
                                    rightLabel={`${Math.min(Math.round(progress.day / (totalWeeks * 7) * 100), 100)}%`}
                                />
                            )}

                            {/* Start new diet link — when diet is done */}
                            {dietDone && (
                                <div className="mt-1 pt-3 border-t border-border flex items-center justify-between">
                                    <span className="text-sm text-muted">{t.noDietActive}</span>
                                    <span className="text-sm font-bold text-accent">{t.startNewDiet} →</span>
                                </div>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="px-5 pb-4">
                        <button
                            onClick={() => navigate(`/pet/${id}/diet`)}
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
                    </div>
                )}

                {petDeletedDiets.length > 0 && (
                    <div className="px-5 pb-4">
                        <button
                            onClick={() => setShowDeletedDiets(!showDeletedDiets)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-muted py-2"
                        >
                            <span>{t.previousDiets} ({petDeletedDiets.length})</span>
                            <span className={`transition-transform ${showDeletedDiets ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {showDeletedDiets && (
                            <div className="mt-2 space-y-2">
                                {petDeletedDiets.map(diet => {
                                    const daysLeft = getDaysUntilDelete(diet.deletedAt, 14)
                                    return (
                                        <div key={diet.deletedAt} className="bg-card rounded-xl p-3 border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-primary">
                                                        🍽️ {t.diet} · {diet.dietSchedule.length} {t.weeks}
                                                    </div>
                                                    <div className="text-xs text-muted mt-0.5">
                                                        {t.deletesIn} {daysLeft} {t.days}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => restoreDiet(diet.deletedAt)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 text-accent text-xs font-bold active:scale-95 transition-transform hover:bg-accent/20"
                                                    >
                                                        <RotateCcw size={12} />
                                                        {t.restore}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(language === 'ru'
                                                                ? 'Удалить диету навсегда?'
                                                                : 'Permanently delete diet?')) {
                                                                permanentlyDeleteDietByDate(diet.deletedAt)
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold active:scale-95 transition-transform hover:bg-red-500/20"
                                                    >
                                                        <Trash2 size={12} />
                                                        {t.delete}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {editModalOpen && (
                    <EditPetModal
                        pet={pet}
                        language={language}
                        onSave={handleSave}
                        onClose={() => setEditModalOpen(false)}
                    />
                )}

                {/* Notes block */}
                <div className="px-5 pb-4">
                    <div className="bg-card rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-muted uppercase tracking-wide">
                                📝 {t.notes}
                            </div>
                            <button
                                onClick={openEditNotesModal}
                                className="w-7 h-7 rounded-full bg-app flex items-center justify-center text-muted"
                            >
                                <Edit2 size={12} />
                            </button>
                        </div>
                        <div className="text-sm text-primary leading-relaxed">
                            {pet.notes || (
                                <span className="text-muted italic">{t.noNotes}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Notes Modal */}
                {showEditNotesModal && (
                    <ModalWrapper onClose={() => setShowEditNotesModal(false)}>
                        <h2 className="text-xl font-black text-primary mb-6">{t.editNotes}</h2>

                        <FormField label={t.notes}>
                            <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className={`${inputCls} resize-none`}
                                rows={5}
                                placeholder={t.notesPlaceholder}
                                autoFocus
                            />
                        </FormField>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditNotesModal(false)}
                                className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold"
                            >
                                {t.save}
                            </button>
                        </div>
                    </ModalWrapper>
                )}
            </div>
        </Layout>

    )
}