export type DietItemUnit = 'г' | 'шт' | 'мл' | 'таб' | 'кап'
export type DietItemType = 'dry' | 'wet' | 'medicine' | 'natural' | 'other'

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
    timesPerDay: number
    startDate: string
    endDate: string
    notes: string
}

export interface WeightEntry {
    date: string
    value: number
}

export interface Diagnosis {
    id: string
    name: string
    dateAdded: string
}

export interface Pet {
    id: string
    name: string
    breed: string
    age: string
    diagnosis: string
    diagnoses: Diagnosis[]
    photo: string | null
    dietStartDate: string | null
    dietSchedule: DietWeek[]
    medCourses: MedCourse[]
    weightHistory: WeightEntry[]
    notes: string
}

export type Language = 'ru' | 'en'

export interface DeletedDiet {
    petId: string
    petName: string
    dietStartDate: string | null
    dietSchedule: DietWeek[]
    deletedAt: string
}

export interface AppState {
    pets: Pet[]
    language: Language
    deletedPets: DeletedPet[]
    deletedDiets: DeletedDiet[]
}

export interface DeletedPet extends Pet {
    deletedAt: string
}