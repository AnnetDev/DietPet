export function getDayAndWeek(startDate: string | null): { day: number; week: number } | null {
    if (!startDate) return null
    const start = new Date(startDate)
    const today = new Date()
    const diffMs = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return null
    const day = diffDays + 1
    const week = Math.ceil(day / 7)
    return { day, week }
}

export function getAgeFromBirthDate(birthDate: string): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

export function getItemIcon(type: string): string {
    switch (type) {
        case 'dry': return '🥣'
        case 'wet': return '🍱'
        case 'medicine': return '💊'
        case 'natural': return '🥩'
        default: return '📦'
    }
}

/** daysThreshold: 30 for pets, 14 for diets */
export function getDaysUntilDelete(deletedAt: string, daysThreshold: number): number {
    const deleted = new Date(deletedAt).getTime()
    const now = new Date().getTime()
    const timeLeft = daysThreshold * 24 * 60 * 60 * 1000 - (now - deleted)
    return Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
}

export function getDaysRemaining(endDate: string): number {
    const end = new Date(endDate)
    const today = new Date()
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function getDaysPassed(startDate: string): number {
    const start = new Date(startDate)
    const today = new Date()
    return Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}
