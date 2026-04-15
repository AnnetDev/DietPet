import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'

export default function Header() {
    const { language } = useAppStore()
    const t = translations[language]

    return (
        <div className="sticky top-0 z-30 bg-app px-5 pt-10 pb-4">
            <div className="text-2xl font-black text-primary">
                Diet<span className="text-accent">Pet</span>
            </div>
            <div className="text-xs font-bold text-muted tracking-widest uppercase mt-0.5">
                {t.myPets}
            </div>
        </div>
    )
}