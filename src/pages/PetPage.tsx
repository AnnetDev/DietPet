import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ChevronLeft } from 'lucide-react'

export default function PetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets } = useAppStore()
    const pet = pets.find(p => p.id === id)

    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    return (
        <div className="min-h-screen bg-app">
            <div className="bg-hero px-5 pt-14 pb-6">
                <button
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-1 text-on-hero opacity-75
            text-sm font-bold mb-4"
                >
                    <ChevronLeft size={16} />
                    Назад
                </button>
                <div className="text-3xl font-black text-on-hero">
                    {pet.name || 'Новый питомец'}
                </div>
            </div>
            <div className="p-5 text-muted font-semibold">
                Страница питомца — в разработке 🐾
            </div>
        </div>
    )
}