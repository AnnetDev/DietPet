import { useState, useEffect } from 'react'
import { AppState, Pet, Language } from '../types'

const STORAGE_KEY = 'dietpet_data'

import { getDefaultPets } from '../data/defaultPets'



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
        if (raw) return JSON.parse(raw)
    } catch {
        // localStorage unavailable or corrupted
    }
    const language = detectLanguage()
    return { pets: getDefaultPets(language), language }
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

    const deletePet = (id: string) =>
        setState(s => ({ ...s, pets: s.pets.filter(p => p.id !== id) }))

    const duplicatePet = (id: string) => {
        const pet = state.pets.find(p => p.id === id)
        if (!pet) return
        const copy: Pet = {
            ...pet,
            id: Date.now().toString(),
            name: pet.name + ' (копия)', // TODO: add translation
        }
        setState(s => ({ ...s, pets: [...s.pets, copy] }))
    }

    const setLanguage = (language: Language) => {
        localStorage.setItem('dietpet_lang', language)
        setState(s => ({ ...s, language }))
    }

    return {
        pets: state.pets,
        language: state.language,
        addPet,
        updatePet,
        deletePet,
        duplicatePet,
        setLanguage,
    }
}