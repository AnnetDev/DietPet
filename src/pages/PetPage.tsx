import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { Pet } from '../types'
import { ChevronLeft, Dot, SquarePen, Pill, Dumbbell, Plus, Trash2, RotateCcw, Edit2 } from 'lucide-react'
import EditPetModal from '../components/EditPetModal'
import Layout from '../components/Layout'

function getDayAndWeek(startDate: string | null) {
    if (!startDate) return null
    const start = new Date(startDate)
    const today = new Date()
    const diffMs = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return null
    const day = diffDays + 1
    const week = Math.ceil(day / 7)
    return { day, week }
}

function getAgeFromBirthDate(birthDate: string): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

export default function PetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [editModalOpen, setEditModalOpen] = useState(false)
    const { pets, deletedDiets, language, updatePet, deleteDiet, restoreDiet, permanentlyDeleteDietByDate } = useAppStore()
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

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'dry': return '🥣'
            case 'wet': return '🍱'
            case 'medicine': return '💊'
            case 'natural': return '🥩'
            default: return '📦'
        }
    }

    const petDeletedDiets = deletedDiets.filter(d => d.petId === id)

    const getDaysUntilPermanentDelete = (deletedAt: string) => {
        const deleted = new Date(deletedAt).getTime()
        const now = new Date().getTime()
        const fourteenDays = 14 * 24 * 60 * 60 * 1000
        const timeLeft = fourteenDays - (now - deleted)
        return Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
    }

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
                <div className="bg-hero px-5 pt-14 pb-6">

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

                {/* Today's feeding plan */}
                {progress && pet.dietSchedule[progress.week - 1] && (
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
                                    <div key={idx} className="flex items-center justify-between bg-on-hero/10 rounded-xl px-3 py-2.5">
                                        <div className="flex items-center gap-2 text-on-hero">
                                            <span className="text-lg">{getItemIcon(item.type)}</span>
                                            <span className="font-semibold text-sm">{item.name}</span>
                                        </div>
                                        <div className="font-black text-on-hero text-sm">
                                            {item.amount} {t.unitLabels[item.unit]}
                                        </div>
                                    </div>
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
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-bold text-muted uppercase tracking-wide">
                                    🍽️ {t.diet}
                                </div>
                                {progress && (
                                    <div className="text-xs font-black bg-accent text-on-hero px-2 py-0.5 rounded-full">
                                        {t.day} {progress.day}
                                    </div>
                                )}
                            </div>
                            <div className="text-sm font-bold text-primary mb-3">
                                {pet.dietSchedule.length} {t.weeks} · {progress ? (dietDone ? t.dietCompleted : `${t.week} ${displayWeek}`) : t.notStarted}
                            </div>

                            {/* Progress bar */}
                            {progress && (
                                <div>
                                    <div className="flex justify-between text-xs text-muted mb-1">
                                        <span>{dietDone ? t.dietCompleted : `${t.week} ${displayWeek} ${t.of} ${totalWeeks}`}</span>
                                        <span>{Math.min(Math.round((displayWeek / totalWeeks) * 100), 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-app rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent rounded-full transition-all"
                                            style={{ width: `${Math.min((displayWeek / totalWeeks) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </button>
                        {dietDone && (
                            <button
                                onClick={() => { deleteDiet(pet.id); navigate(`/pet/${id}/diet`) }}
                                className="w-full mt-2 bg-accent rounded-2xl p-4 flex items-center gap-4 text-on-hero active:scale-95 transition-transform shadow-sm"
                            >
                                <div className="w-9 h-9 rounded-full bg-on-hero/20 flex items-center justify-center flex-shrink-0">
                                    <Plus size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black">{t.createDiet}</div>
                                    <div className="text-xs opacity-75 mt-0.5">{t.dietExplanation}</div>
                                </div>
                            </button>
                        )}
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
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-muted py-2 opacity-60"
                        >
                            <Trash2 size={14} />
                            <span>{t.deletedDiets} ({petDeletedDiets.length})</span>
                            <span className={`transition-transform ${showDeletedDiets ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {showDeletedDiets && (
                            <div className="mt-3 space-y-2 opacity-60">
                                {petDeletedDiets.map(diet => {
                                    const daysLeft = getDaysUntilPermanentDelete(diet.deletedAt)
                                    return (
                                        <div key={diet.deletedAt} className="bg-card rounded-xl p-3 border border-border">
                                            <div className="flex items-start gap-3">
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
                                                        className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-accent"
                                                        title={t.restore}
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(language === 'ru'
                                                                ? 'Удалить диету навсегда?'
                                                                : 'Permanently delete diet?')) {
                                                                permanentlyDeleteDietByDate(diet.deletedAt)
                                                            }
                                                        }}
                                                        className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-red-500"
                                                        title={t.deletePermanently}
                                                    >
                                                        <Trash2 size={14} />
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
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowEditNotesModal(false)}
                        />
                        <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl modal-container">
                            <h2 className="text-xl font-black text-primary mb-6">{t.editNotes}</h2>

                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                    {t.notes}
                                </label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                    rows={5}
                                    placeholder={t.notesPlaceholder}
                                    autoFocus
                                />
                            </div>

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
                        </div>
                    </>
                )}
            </div>
        </Layout>

    )
}