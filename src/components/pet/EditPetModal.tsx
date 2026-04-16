import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { Pet } from '../../types'
import { translations } from '../../i18n'
import { Language } from '../../types'
import ModalWrapper from '../ui/ModalWrapper'
import FormField, { inputCls } from '../ui/FormField'

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
    const [birthDate, setBirthDate] = useState(pet.birthDate || '')
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
        const updates: Partial<Pet> = { name, breed, birthDate: birthDate || undefined, photo }
        if (weight && parseFloat(weight) !== lastWeight?.value) {
            updates.weightHistory = [
                ...pet.weightHistory,
                { date: new Date().toISOString().split('T')[0], value: parseFloat(weight) }
            ]
        }
        onSave(updates)
        onClose()
    }

    return (
        <ModalWrapper onClose={onClose} scrollable>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-primary">{t.editPet}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-muted">
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
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
            </div>

            <div className="space-y-4">
                <FormField label={t.petName}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className={inputCls} placeholder={t.petNamePlaceholder} />
                </FormField>

                <FormField label={t.breed}>
                    <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)}
                        className={inputCls} placeholder={t.breedPlaceholder} />
                </FormField>

                <FormField label={t.birthDate}>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                        className={inputCls} />
                </FormField>

                <FormField label={`${t.weight} (${t.kg})`}>
                    <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
                        className={inputCls} placeholder="12.5" />
                </FormField>
            </div>

            <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold active:scale-95 transition-transform">
                    {t.cancel}
                </button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold active:scale-95 transition-transform">
                    {t.save}
                </button>
            </div>
        </ModalWrapper>
    )
}
