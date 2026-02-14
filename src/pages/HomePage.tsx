import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { Pet } from '../types'
import { MoreHorizontal, Plus, Copy, Trash2, Pill, RotateCcw } from 'lucide-react'
import Header from '../components/Header'
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

function PetCard({
    pet,
    t,
    onOpen,
    onDelete,
    onDuplicate,
}: {
    pet: Pet
    t: typeof translations.ru | typeof translations.en
    onOpen: () => void
    onDelete: () => void
    onDuplicate: () => void
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const progress = getDayAndWeek(pet.dietStartDate)
    const totalWeeks = pet.dietSchedule.length || 0
    const progressPct = progress && totalWeeks
        ? Math.min((progress.week - 1) / totalWeeks * 100, 100)
        : 0

    return (
        <div className="bg-card rounded-2xl p-4 shadow-sm relative">
            <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-app flex items-center justify-center text-muted"
                onClick={() => setMenuOpen(v => !v)}
            >
                <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute top-10 right-3 z-20 bg-card rounded-xl shadow-lg border border-border overflow-hidden w-44">
                        <button
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-primary hover:bg-app"
                            onClick={() => { onDuplicate(); setMenuOpen(false) }}
                        >
                            <Copy size={14} className="text-muted" />
                            {t.duplicate}
                        </button>
                        <button
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-app"
                            onClick={() => { onDelete(); setMenuOpen(false) }}
                        >
                            <Trash2 size={14} />
                            {t.delete}
                        </button>
                    </div>
                </>
            )}

            <button className="w-full text-left" onClick={onOpen}>
                <div className="flex items-start gap-3 pr-8">
                    <div className="w-14 h-14 rounded-full bg-hero flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {pet.photo
                            ? <img src={pet.photo} className="w-full h-full object-cover" alt={pet.name} />
                            : '🐾'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="font-black text-base text-primary">{pet.name}</div>
                        <div className="text-xs text-muted mt-0.5">
                            {[
                                pet.breed,
                                pet.age && `${pet.age} ${typeof t.years === 'function' ? t.years(Number(pet.age)) : t.years}`,
                                pet.weightHistory[pet.weightHistory.length - 1] &&
                                `${pet.weightHistory[pet.weightHistory.length - 1]!.value} ${t.kg}`
                            ].filter(Boolean).join(' · ')}
                        </div>
                        {pet.diagnoses && pet.diagnoses.length > 0 && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold bg-tag text-accent px-2 py-0.5 rounded-full">
                                <Pill size={14}/> {pet.diagnoses.map(d => d.name).join(', ')}
                            </span>
                        )}
                    </div>
                </div>

                {progress && totalWeeks > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-semibold text-muted">
                                {t.week} {progress.week} {t.of} {totalWeeks}
                            </span>
                            <span className="text-xs font-black bg-accent text-on-hero px-2 py-0.5 rounded-full">
                                {t.day} {progress.day}
                            </span>
                        </div>
                        <div className="h-1.5 bg-app rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                )}
            </button>
        </div>
    )
}

export default function HomePage() {
    const navigate = useNavigate()
    const { pets, deletedPets, language, deletePet, duplicatePet, restorePet, permanentlyDeletePet } = useAppStore()
    const t = translations[language]

    const [showDeletedSection, setShowDeletedSection] = useState(false)
    const [petToDelete, setPetToDelete] = useState<string | null>(null)

    const handleAddPet = () => {
        navigate('/new-pet')
    }

    const handleDeleteClick = (id: string) => {
        setPetToDelete(id)
    }

    const confirmDelete = () => {
        if (petToDelete) {
            deletePet(petToDelete)
            setPetToDelete(null)
        }
    }

    const getDaysUntilPermanentDelete = (deletedAt: string) => {
        const deleted = new Date(deletedAt).getTime()
        const now = new Date().getTime()
        const thirtyDays = 30 * 24 * 60 * 60 * 1000
        const timeLeft = thirtyDays - (now - deleted)
        return Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
    }

    return (
        <Layout>
            <Header />

            {/* Pet list */}
            <div className="flex-1 px-4 flex flex-col gap-3 pb-8">
                {pets.map(pet => (
                    <PetCard
                        key={pet.id}
                        pet={pet}
                        t={t}
                        onOpen={() => navigate(`/pet/${pet.id}`)}
                        onDelete={() => handleDeleteClick(pet.id)}
                        onDuplicate={() => duplicatePet(pet.id)}
                    />
                ))}

                {/* Add btn */}
                <button
                    onClick={handleAddPet}
                    className="bg-card rounded-2xl p-5 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-accent active:scale-95 transition-transform"
                >
                    <Plus size={28} strokeWidth={2} />
                    <span className="text-sm font-bold">{t.addPet}</span>
                </button>

                {/* Deleted pets section */}
                {deletedPets.length > 0 && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowDeletedSection(!showDeletedSection)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-muted py-2 opacity-60"
                        >
                            <Trash2 size={14} />
                            <span>{t.deletedPets} ({deletedPets.length})</span>
                            <span className={`transition-transform ${showDeletedSection ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {showDeletedSection && (
                            <div className="mt-3 space-y-2 opacity-60">
                                {deletedPets.map(pet => {
                                    const daysLeft = getDaysUntilPermanentDelete(pet.deletedAt)
                                    return (
                                        <div key={pet.id} className="bg-card rounded-xl p-3 border border-border">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-app flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                                                    {pet.photo
                                                        ? <img src={pet.photo} className="w-full h-full object-cover" alt={pet.name} />
                                                        : '🐾'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-primary">{pet.name}</div>
                                                    <div className="text-xs text-muted mt-0.5">
                                                        {t.deletesIn} {daysLeft} {t.days}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => restorePet(pet.id)}
                                                        className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-accent"
                                                        title={t.restore}
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(language === 'ru'
                                                                ? `Удалить ${pet.name} навсегда?`
                                                                : `Permanently delete ${pet.name}?`)) {
                                                                permanentlyDeletePet(pet.id)
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
            </div>

            {/* Delete confirmation modal */}
            {petToDelete && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setPetToDelete(null)}
                    />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl">
                        <h2 className="text-xl font-black text-primary mb-4">{t.deletePetConfirm}</h2>
                        <p className="text-sm text-muted mb-6">
                            {t.deletePetExplanation}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPetToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold"
                            >
                                {t.delete}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    )
}