import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { Pet } from '../types'
import { ChevronLeft, Dot, SquarePen, Pill, Dumbbell } from 'lucide-react'
import EditPetModal from '../components/EditPetModal'

export default function PetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets, language, updatePet } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const [editModalOpen, setEditModalOpen] = useState(false)

    const t = translations[language]

    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const handleSave = (updates: Partial<Pet>) => {
        updatePet({ ...pet, ...updates })
    }

    return (
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
                        <Dumbbell size={14}/> {t.weight}
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
                        <Pill size={14}/> {t.medicalCard}
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

            <div className="p-5 text-muted font-semibold">
                Страница питомца — в разработке 🐾
            </div>

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
    )
}