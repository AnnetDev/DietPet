import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { Pet } from '../types'
import { ChevronLeft, DotIcon, SquarePen } from 'lucide-react'

export default function PetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets, language } = useAppStore()
    const pet = pets.find(p => p.id === id)

    const t = translations[language]


    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    return (
        <div className="min-h-screen bg-app">
            <div className="bg-hero px-5 pt-14 pb-6">
                            {/* TODO: все поля в шапке карточки должны быть позволять редактировать при клике на сам элемент: фото, порода, возраст, вес, имя */}

                <div className='flex items-center justify-between mb-6'>
                    <button
                    onClick={() => navigate('/home')}
                    className="flex items-center gap-1 text-on-hero opacity-75
            text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    {t.goBack}
                </button>
                
                <button>
                    <SquarePen size={18} className='stroke-[var(--text-on-hero)]'/>
                {/* TODO: добавить открытие модального и инпутами для добавления/обновления фото, вводе/изменения имени, веса, возраста, породы */}
                </button>
                </div>
                
                <div className='flex flex-col gap-3'>
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-hero flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {pet.photo
                            ? <img src={pet.photo} className="w-full h-full object-cover" alt={pet.name} />
                            : '🐾'}
                    </div>

                    <div className="text-3xl font-black text-on-hero">
                        {pet.name || t.newPet}
                    </div>
                    <div className='flex text-on-hero' >
                        {pet.breed}
                        <DotIcon />
                        {pet.age && `${pet.age} ${typeof t.years === 'function' ? t.years(Number(pet.age)) : t.years}`}
                        <DotIcon />
                        {pet.weightHistory[pet.weightHistory.length - 1] && `${pet.weightHistory[pet.weightHistory.length - 1]!.value} ${t.kg}`}
                    </div>
                </div>

            </div>

            <div className="p-5 text-muted font-semibold">
                Страница питомца — в разработке 🐾
            </div>
        </div>
    )
}