import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { Pet } from '../types'
import { ChevronLeft, Dot, SquarePen, Pill, Dumbbell, Plus, Trash2, RotateCcw } from 'lucide-react'
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

export default function PetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [editModalOpen, setEditModalOpen] = useState(false)
    const { pets, deletedDiets, language, updatePet, restoreDiet, permanentlyDeleteDietByDate } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const [showDeletedDiets, setShowDeletedDiets] = useState(false)
    const t = translations[language]


    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const progress = getDayAndWeek(pet.dietStartDate)

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
                            {pet.breed && pet.age && <Dot size={20} />}
                            {pet.age && (
                                <span>
                                    {pet.age} {typeof t.years === 'function' ? t.years(Number(pet.age)) : t.years}
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
                                            {item.amount} {item.unit}
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
                                {pet.dietSchedule.length} {t.weeks} · {progress ? `${t.week} ${progress.week}` : t.notStarted}
                            </div>

                            {/* Progress bar */}
                            {progress && (
                                <div>
                                    <div className="flex justify-between text-xs text-muted mb-1">
                                        <span>{t.week} {progress.week} {t.of} {pet.dietSchedule.length}</span>
                                        <span>{Math.round((progress.week / pet.dietSchedule.length) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-app rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent rounded-full transition-all"
                                            style={{ width: `${Math.min((progress.week / pet.dietSchedule.length) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="px-5 pb-4">
                        <button
                            onClick={() => navigate(`/pet/${id}/diet`)}
                            className="w-full bg-card rounded-2xl p-5 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-accent active:scale-95 transition-transform"
                        >
                            <Plus size={28} strokeWidth={2} />
                            <span className="text-sm font-bold">{t.createDiet}</span>
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
            </div>
        </Layout>

    )
}