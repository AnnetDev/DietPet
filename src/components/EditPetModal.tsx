import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { Pet } from '../types'
import { translations } from '../locales'
import { Language } from '../types'

interface EditPetModalProps {
    pet: Pet
    language: Language
    onSave: (updated: Partial<Pet>) => void
    onClose: () => void
}

export default function EditPetModal({ pet, language, onSave, onClose }: EditPetModalProps) {
    const t = translations[language]
    const [name, setName] = useState(pet.name)
    const [breed, setBreed] = useState(pet.breed)
    const [age, setAge] = useState(pet.age)
    const [photo, setPhoto] = useState(pet.photo)
    const [photoPreview, setPhotoPreview] = useState(pet.photo)

    const lastWeight = pet.weightHistory[pet.weightHistory.length - 1]
    const [weight, setWeight] = useState(lastWeight?.value.toString() || '')

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            setPhoto(base64)
            setPhotoPreview(base64)
        }
        reader.readAsDataURL(file)
    }

    const handleSave = () => {
        const updates: Partial<Pet> = {
            name,
            breed,
            age,
            photo,
        }

        if (weight && parseFloat(weight) !== lastWeight?.value) {
            updates.weightHistory = [
                ...pet.weightHistory,
                {
                    date: new Date().toISOString().split('T')[0],
                    value: parseFloat(weight)
                }
            ]
        }

        onSave(updates)
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl max-h-[85vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-primary">{t.editPet}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Photo */}
                <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="w-28 h-28 rounded-full bg-app flex items-center justify-center overflow-hidden border-2 border-border">
                        {photoPreview
                            ? <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                            : <span className="text-4xl">🐾</span>
                        }
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-accent text-on-hero rounded-xl text-sm font-bold cursor-pointer active:scale-95 transition-transform">
                        <Upload size={16} />
                        {t.uploadPhoto}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                        />
                    </label>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                            {t.petName}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent modal-container"
                            placeholder={t.petNamePlaceholder}
                        />
                    </div>

                    {/* Breed */}
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                            {t.breed}
                        </label>
                        <input
                            type="text"
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent modal-container"
                            placeholder={t.breedPlaceholder}
                        />
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                            {t.age}
                        </label>
                        <input
                            type="text"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent modal-container"
                            placeholder="10"
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                            {t.weight} ({t.kg})
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent modal-container"
                            placeholder="12.5"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-app text-primary font-bold active:scale-95 transition-transform"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold active:scale-95 transition-transform"
                    >
                        {t.save}
                    </button>
                </div>

            </div>
        </>
    )
}