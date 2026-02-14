import { useState, useEffect } from 'react'
import { AppState, Pet, Language, DeletedPet, DeletedDiet } from '../types'
import { getDefaultPets } from '../data/defaultPets'

const STORAGE_KEY = 'dietpet_data'

function detectLanguage(): Language {
    const saved = localStorage.getItem('dietpet_lang')
    if (saved === 'ru' || saved === 'en') return saved
    const RU_LANGS = ['ru', 'uk', 'be', 'kk']
    const detected = navigator.language.split('-')[0]
    const lang: Language = RU_LANGS.includes(detected) ? 'ru' : 'en'
    localStorage.setItem('dietpet_lang', lang)
    return lang
}

function loadState(): AppState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            const now = new Date().getTime()
            const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
            const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000)
            
            const validDeleted = (parsed.deletedPets || []).filter((pet: DeletedPet) => {
                const deletedTime = new Date(pet.deletedAt).getTime()
                return deletedTime > thirtyDaysAgo
            })

            const validDeletedDiets = (parsed.deletedDiets || []).filter((diet: DeletedDiet) => {
                const deletedTime = new Date(diet.deletedAt).getTime()
                return deletedTime > fourteenDaysAgo
            })
            
            return { 
                ...parsed, 
                deletedPets: validDeleted,
                deletedDiets: validDeletedDiets 
            }
        }
    } catch {
        // localStorage unavailable or corrupted
    }
    const language = detectLanguage()
    return { 
        pets: getDefaultPets(language), 
        deletedPets: [], 
        deletedDiets: [],
        language 
    }
}

function saveState(state: AppState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useAppStore() {
    const [state, setState] = useState<AppState>(loadState)

    useEffect(() => {
        saveState(state)
    }, [state])

    const addPet = (pet: Pet) =>
        setState(s => ({ ...s, pets: [...s.pets, pet] }))

    const updatePet = (pet: Pet) =>
        setState(s => ({ ...s, pets: s.pets.map(p => p.id === pet.id ? pet : p) }))

    const deletePet = (id: string) => {
        const petToDelete = state.pets.find(p => p.id === id)
        if (!petToDelete) return

        const deletedPet: DeletedPet = {
            ...petToDelete,
            deletedAt: new Date().toISOString()
        }

        setState(s => ({
            ...s,
            pets: s.pets.filter(p => p.id !== id),
            deletedPets: [...s.deletedPets, deletedPet]
        }))
    }

    const restorePet = (id: string) => {
        const petToRestore = state.deletedPets.find(p => p.id === id)
        if (!petToRestore) return

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { deletedAt, ...pet } = petToRestore

        setState(s => ({
            ...s,
            pets: [...s.pets, pet],
            deletedPets: s.deletedPets.filter(p => p.id !== id)
        }))
    }

    const permanentlyDeletePet = (id: string) => {
        setState(s => ({
            ...s,
            deletedPets: s.deletedPets.filter(p => p.id !== id)
        }))
    }

    const deleteDiet = (petId: string) => {
        const pet = state.pets.find(p => p.id === petId)
        if (!pet || !pet.dietSchedule.length) return

        const deletedDiet: DeletedDiet = {
            petId: pet.id,
            petName: pet.name,
            dietStartDate: pet.dietStartDate,
            dietSchedule: pet.dietSchedule,
            deletedAt: new Date().toISOString()
        }

        const updatedPet = {
            ...pet,
            dietStartDate: null,
            dietSchedule: []
        }

        setState(s => ({
            ...s,
            pets: s.pets.map(p => p.id === petId ? updatedPet : p),
            deletedDiets: [...s.deletedDiets, deletedDiet]
        }))
    }

    const restoreDiet = (deletedAt: string) => {
        const dietToRestore = state.deletedDiets.find(d => d.deletedAt === deletedAt)
        if (!dietToRestore) return

        const pet = state.pets.find(p => p.id === dietToRestore.petId)
        if (!pet) return

        const updatedPet = {
            ...pet,
            dietStartDate: dietToRestore.dietStartDate,
            dietSchedule: dietToRestore.dietSchedule
        }

        setState(s => ({
            ...s,
            pets: s.pets.map(p => p.id === dietToRestore.petId ? updatedPet : p),
            deletedDiets: s.deletedDiets.filter(d => d.deletedAt !== deletedAt)
        }))
    }

    const permanentlyDeleteDiet = (deletedAt: string) => {
        setState(s => ({
            ...s,
            deletedDiets: s.deletedDiets.filter(d => d.deletedAt !== deletedAt)
        }))
    }

    const duplicatePet = (id: string) => {
        const pet = state.pets.find(p => p.id === id)
        if (!pet) return
        const copy: Pet = {
            ...pet,
            id: `pet_${crypto.randomUUID()}`,
            name: pet.name + ' (копия)'
        }
        setState(s => ({ ...s, pets: [...s.pets, copy] }))
    }

    const setLanguage = (language: Language) => {
        localStorage.setItem('dietpet_lang', language)
        setState(s => ({ ...s, language }))
    }

    return {
        pets: state.pets,
        deletedPets: state.deletedPets,
        deletedDiets: state.deletedDiets,
        language: state.language,
        addPet,
        updatePet,
        deletePet,
        restorePet,
        permanentlyDeletePet,
        deleteDiet,
        restoreDiet,
        permanentlyDeleteDietByDate: permanentlyDeleteDiet,
        duplicatePet,
        setLanguage,
    }
}