import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { Pet } from '../types'
import { ChevronLeft, Upload, Check } from 'lucide-react'
import Layout from '../components/Layout'


type Step = 'basic' | 'photo' | 'weight' | 'diagnosis' | 'diet'

export default function NewPetPage() {
    const navigate = useNavigate()
    const { language, addPet } = useAppStore()
    const t = translations[language]

    const [step, setStep] = useState<Step>('basic')

    // Basic info
    const [name, setName] = useState('')
    const [breed, setBreed] = useState('')
    const [age, setAge] = useState('')

    // Photo
    const [photo, setPhoto] = useState<string | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    // Weight
    const [weight, setWeight] = useState('')

    // Diagnosis
    const [diagnoses, setDiagnoses] = useState<string[]>([])
    const [newDiagnosis, setNewDiagnosis] = useState('')

    // Diet
    const [hasDiet, setHasDiet] = useState<boolean | null>(null)

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

    const addDiagnosis = () => {
        if (newDiagnosis.trim()) {
            setDiagnoses([...diagnoses, newDiagnosis.trim()])
            setNewDiagnosis('')
        }
    }

    const removeDiagnosis = (index: number) => {
        setDiagnoses(diagnoses.filter((_, i) => i !== index))
    }

    const handleNext = () => {
        if (step === 'basic') setStep('photo')
        else if (step === 'photo') setStep('weight')
        else if (step === 'weight') setStep('diagnosis')
        else if (step === 'diagnosis') setStep('diet')
    }

    const handleBack = () => {
        if (step === 'photo') setStep('basic')
        else if (step === 'weight') setStep('photo')
        else if (step === 'diagnosis') setStep('weight')
        else if (step === 'diet') setStep('diagnosis')
    }

    const handleSkip = () => {
        handleNext()
    }

    const handleFinish = () => {
        const newPet: Pet = {
            id: `pet_${crypto.randomUUID()}`,
            name: name || t.newPet,
            breed,
            age,
            diagnosis: '', // старое поле
            diagnoses: diagnoses.map((d, i) => ({
                id: `diag_${i}`,
                name: d,
                dateAdded: new Date().toISOString().split('T')[0]
            })),
            photo,
            dietStartDate: hasDiet ? new Date().toISOString().split('T')[0] : null,
            dietSchedule: [],
            medCourses: [],
            weightHistory: weight ? [{
                date: new Date().toISOString().split('T')[0],
                value: parseFloat(weight)
            }] : [],
            notes: '',
        }

        addPet(newPet)

        if (hasDiet) {
            navigate(`/pet/${newPet.id}/diet`)
        } else {
            navigate(`/pet/${newPet.id}`)
        }
    }

    const canProceed = () => {
        if (step === 'basic') return name.trim().length > 0
        return true
    }

    const renderStep = () => {
        switch (step) {
            case 'basic':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                {t.petName} *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder={t.petNamePlaceholder}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                {t.breed}
                            </label>
                            <input
                                type="text"
                                value={breed}
                                onChange={(e) => setBreed(e.target.value)}
                                className="w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder={t.breedPlaceholder}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                {t.age}
                            </label>
                            <input
                                type="text"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="5"
                            />
                        </div>
                    </div>
                )

            case 'photo':
                return (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-40 h-40 rounded-full bg-app flex items-center justify-center overflow-hidden border-2 border-border">
                            {photoPreview
                                ? <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                                : <span className="text-6xl">🐾</span>
                            }
                        </div>
                        <label className="flex items-center gap-2 px-6 py-3 bg-accent text-on-hero rounded-xl text-sm font-bold cursor-pointer active:scale-95 transition-transform">
                            <Upload size={16} />
                            {photoPreview ? t.changePhoto : t.uploadPhoto}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                        </label>
                    </div>
                )

            case 'weight':
                return (
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                            {t.currentWeight}
                        </label>
                        <div className="flex gap-3 items-end">
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="flex-1 bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="12.5"
                            />
                            <div className="pb-3 text-muted font-bold">{t.kg}</div>
                        </div>
                    </div>
                )

            case 'diagnosis':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                {t.diagnosis}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newDiagnosis}
                                    onChange={(e) => setNewDiagnosis(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addDiagnosis()}
                                    className="flex-1 bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder={t.diagnosisPlaceholder}
                                />
                                <button
                                    onClick={addDiagnosis}
                                    disabled={!newDiagnosis.trim()}
                                    className="px-4 bg-accent text-on-hero rounded-xl font-bold disabled:opacity-50"
                                >
                                    {t.add}
                                </button>
                            </div>
                        </div>

                        {diagnoses.length > 0 && (
                            <div className="space-y-2">
                                {diagnoses.map((diag, index) => (
                                    <div key={index} className="flex items-center justify-between bg-app rounded-xl px-4 py-3">
                                        <span className="font-semibold text-primary">🍂 {diag}</span>
                                        <button
                                            onClick={() => removeDiagnosis(index)}
                                            className="text-red-500 text-sm font-bold"
                                        >
                                            {t.delete}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )

            case 'diet':
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="text-lg font-bold text-primary mb-2">
                                {t.doesPetHaveDiet}
                            </div>
                            <div className="text-sm text-muted">
                                {t.dietExplanation}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setHasDiet(true)}
                                className={`w-full p-4 rounded-xl border-2 font-bold transition-all ${hasDiet === true
                                    ? 'border-accent bg-accent text-on-hero'
                                    : 'border-border bg-card text-primary'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>✅ {t.yesDiet}</span>
                                    {hasDiet === true && <Check size={20} />}
                                </div>
                            </button>

                            <button
                                onClick={() => setHasDiet(false)}
                                className={`w-full p-4 rounded-xl border-2 font-bold transition-all ${hasDiet === false
                                    ? 'border-accent bg-accent text-on-hero'
                                    : 'border-border bg-card text-primary'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>❌ {t.noDiet}</span>
                                    {hasDiet === false && <Check size={20} />}
                                </div>
                            </button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const stepTitles: Record<Step, string> = {
        basic: t.basicInfo,
        photo: t.photo,
        weight: t.weight,
        diagnosis: t.diagnosis,
        diet: t.diet,
    }

    const steps: Step[] = ['basic', 'photo', 'weight', 'diagnosis', 'diet']
    const currentStepIndex = steps.indexOf(step)
    const progressPercent = ((currentStepIndex + 1) / steps.length) * 100

    return (
        <Layout>
            <div className="min-h-screen bg-app flex flex-col">

                {/* Header */}
                <div className="bg-hero px-5 pt-14 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={currentStepIndex === 0 ? () => navigate('/home') : handleBack}
                            className="flex items-center gap-1 text-on-hero opacity-75 text-sm font-bold"
                        >
                            <ChevronLeft size={16} />
                            {currentStepIndex === 0 ? t.cancel : t.goBack}
                        </button>

                        <div className="text-on-hero text-sm font-bold opacity-75">
                            {currentStepIndex + 1} / {steps.length}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-on-hero mb-4">
                        {stepTitles[step]}
                    </h1>

                    {/* Progress bar */}
                    <div className="h-2 bg-on-hero/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-on-hero rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-6">
                    {renderStep()}
                </div>

                {/* Footer buttons */}
                <div className="px-5 pb-8 pt-4 border-t border-border bg-card">
                    <div className="flex gap-3">
                        {step !== 'basic' && step !== 'diet' && (
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 rounded-xl bg-app text-muted font-bold"
                            >
                                {t.skip}
                            </button>
                        )}

                        {step === 'diet' ? (
                            <button
                                onClick={handleFinish}
                                disabled={hasDiet === null}
                                className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50"
                            >
                                {t.finish}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50"
                            >
                                {t.next}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>

    )
}