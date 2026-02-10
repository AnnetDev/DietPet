export interface WeightEntry {
    date: string; 
    value: number; 
}

export interface DietWeek {
    week: number;
    dryTotal: number;
    dryOld: number;
    dryNew: number; 
    wetPouches: number; 
}

export interface Pet {
    id: string;
    name: string;
    breed: string;
    age: string;
    diagnosis: string;
    photo: string | null;
    dietStartDate: string | null; 
    dietSchedule: DietWeek[];
    weightHistory: WeightEntry[];
    notes: string;
}

export type Language = "ru" | "en";

export interface AppState {
    pets: Pet[];
    language: Language;
}
