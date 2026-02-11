import { Pet } from '../types'
import { Language } from '../types'

const defaultPetData: Record<Language, Omit<Pet, 'id'>> = {
    ru: {
        name: 'Дженкин',
        breed: 'Обычный кот',
        age: '10',
        diagnosis: 'МКБ',
        photo: null,
        dietStartDate: '2026-02-03',
        dietSchedule: [
            {
                week: 1,
                items: [
                    { id: '1', name: 'RC Sterilised 7+', amount: 70, unit: 'г', type: 'dry' },
                    { id: '2', name: 'RC Urinary S/O', amount: 20, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan пауч', amount: 3, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 2,
                items: [
                    { id: '1', name: 'RC Sterilised 7+', amount: 40, unit: 'г', type: 'dry' },
                    { id: '2', name: 'RC Urinary S/O', amount: 35, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan пауч', amount: 3, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 3,
                items: [
                    { id: '1', name: 'RC Sterilised 7+', amount: 15, unit: 'г', type: 'dry' },
                    { id: '2', name: 'RC Urinary S/O', amount: 50, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan пауч', amount: 2, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 4,
                items: [
                    { id: '2', name: 'RC Urinary S/O', amount: 60, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan пауч', amount: 2, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 5,
                items: [
                    { id: '2', name: 'RC Urinary S/O', amount: 55, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan пауч', amount: 1, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 6,
                items: [
                    { id: '2', name: 'RC Urinary S/O', amount: 50, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan пауч', amount: 1, unit: 'шт', type: 'wet' },
                ]
            },
        ],
        medCourses: [],
        weightHistory: [
            { date: '2026-02-03', value: 12 },
            { date: '2026-02-10', value: 11.7 },
        ],
        notes: 'Нельзя давать рыбу',
    },

    en: {
        name: 'Jenkin',
        breed: 'Domestic cat',
        age: '10',
        diagnosis: 'Urolithiasis',
        photo: null,
        dietStartDate: '2026-02-03',
        dietSchedule: [
            {
                week: 1,
                items: [
                    { id: '1', name: 'RC Sterilised 7+', amount: 70, unit: 'г', type: 'dry' },
                    { id: '2', name: 'RC Urinary S/O', amount: 20, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan pouch', amount: 3, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 2,
                items: [
                    { id: '1', name: 'RC Sterilised 7+', amount: 40, unit: 'г', type: 'dry' },
                    { id: '2', name: 'RC Urinary S/O', amount: 35, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan pouch', amount: 3, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 3,
                items: [
                    { id: '1', name: 'RC Sterilised 7+', amount: 15, unit: 'г', type: 'dry' },
                    { id: '2', name: 'RC Urinary S/O', amount: 50, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan pouch', amount: 2, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 4,
                items: [
                    { id: '2', name: 'RC Urinary S/O', amount: 60, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan pouch', amount: 2, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 5,
                items: [
                    { id: '2', name: 'RC Urinary S/O', amount: 55, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan pouch', amount: 1, unit: 'шт', type: 'wet' },
                ]
            },
            {
                week: 6,
                items: [
                    { id: '2', name: 'RC Urinary S/O', amount: 50, unit: 'г', type: 'dry' },
                    { id: '3', name: 'Pro Plan pouch', amount: 1, unit: 'шт', type: 'wet' },
                ]
            },
        ],
        medCourses: [],
        weightHistory: [
            { date: '2026-02-03', value: 12 },
            { date: '2026-02-10', value: 11.7 },
        ],
        notes: 'No fish allowed',
    }
}

export function getDefaultPets(language: Language): Pet[] {
    return [{ id: '1', ...defaultPetData[language] }]
}