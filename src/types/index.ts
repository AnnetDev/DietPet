export type DietItemUnit = 'г' | 'шт' | 'мл' | 'таб' | 'кап'
export type DietItemType = 'dry' | 'wet' | 'medicine' | 'other'

export interface DietItem {
    id: string
    name: string
    amount: number
    unit: DietItemUnit
    type: DietItemType
}

export interface DietWeek {
    week: number
    items: DietItem[]
}

export interface MedCourse {
    id: string
    name: string
    amount: number
    unit: DietItemUnit
    startDate: string
    endDate: string
    notes: string
}

export interface WeightEntry {
    date: string
    value: number
}

export interface Pet {
    id: string
    name: string
    breed: string
    age: string
    diagnosis: string
    photo: string | null
    dietStartDate: string | null
    dietSchedule: DietWeek[]
    medCourses: MedCourse[]
    weightHistory: WeightEntry[]
    notes: string
}

export type Language = 'ru' | 'en'

export interface AppState {
    pets: Pet[]
    language: Language
}