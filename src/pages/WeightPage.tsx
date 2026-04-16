import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../i18n'
import { ChevronLeft, Plus, Trash2, Dumbbell } from 'lucide-react'
import WeightChart from '../components/pet/WeightChart'
import Layout from '../components/layout/Layout'
import ModalWrapper from '../components/ui/ModalWrapper'
import FormField, { inputCls } from '../components/ui/FormField'

type TimeRange = 'week' | 'month' | 'year' | 'all'

export default function WeightPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets, language, updatePet } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const t = translations[language]

    const [timeRange, setTimeRange] = useState<TimeRange>('month')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newWeight, setNewWeight] = useState('')
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const weightHistory = pet.weightHistory || []

    const getFilteredHistory = () => {
        if (timeRange === 'all') return weightHistory

        const now = new Date()
        const filtered = weightHistory.filter(entry => {
            const entryDate = new Date(entry.date)
            const diffDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

            if (timeRange === 'week') return diffDays <= 7
            if (timeRange === 'month') return diffDays <= 30
            if (timeRange === 'year') return diffDays <= 365
            return true
        })
        return filtered
    }

    const filteredHistory = getFilteredHistory()

    const getTrend = () => {
        if (filteredHistory.length < 2) return null
        const latest = filteredHistory[filteredHistory.length - 1].value
        const oldest = filteredHistory[0].value
        const diff = latest - oldest
        return { diff, direction: diff > 0 ? 'up' : 'down' }
    }

    const trend = getTrend()

    const handleAddWeight = () => {
        if (!newWeight) return

        const updated = {
            ...pet,
            weightHistory: [
                ...weightHistory,
                {
                    date: newDate,
                    value: parseFloat(newWeight)
                }
            ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }
        updatePet(updated)
        setShowAddModal(false)
        setNewWeight('')
        setNewDate(new Date().toISOString().split('T')[0])
    }

    const handleDeleteEntry = (date: string) => {
        const updated = {
            ...pet,
            weightHistory: weightHistory.filter(entry => entry.date !== date)
        }
        updatePet(updated)
    }

    return (
        <Layout><div className="min-h-screen bg-app pb-20">

            {/* Header */}
            <div className="sticky top-0 z-30 bg-hero px-5 pb-6 hero-header">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(`/pet/${id}`)}
                        className="flex items-center gap-1 text-on-hero text-sm font-bold"
                    >
                        <ChevronLeft size={16} />
                        {t.goBack}
                    </button>

                </div>

                <h1 className="text-2xl font-black text-on-hero mb-3 flex gap-2 items-center"> <Dumbbell size={28} /> {t.weight}</h1>

                {/* Current weight + trend */}
                <div className="flex items-center justify-between gap-3">
                    <div className='flex items-center gap-5'><div className="text-m text-on-hero">
                        {weightHistory.length > 0
                            ? `${weightHistory[weightHistory.length - 1].value} ${t.kg}`
                            : `— ${t.kg}`
                        }
                    </div>
                        {trend && (
                            <div className={`text-sm font-bold ${trend.direction === 'down' ? 'text-green-300' : 'text-yellow-300'}`}>
                                {trend.direction === 'down' ? '↘️' : '↗️'} {Math.abs(trend.diff).toFixed(1)} {t.kg}
                            </div>
                        )}</div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1 bg-on-hero/20 text-on-hero px-3 py-1.5 rounded-full text-sm font-bold"
                    >
                        <Plus size={16} />
                        {t.addWeight}
                    </button>

                </div>
            </div>

            {/* Time range selector */}


            <div className="px-5 py-4 flex gap-2 overflow-x-auto">
                {(['week', 'month', 'year', 'all'] as TimeRange[]).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${timeRange === range
                            ? 'bg-accent text-on-hero'
                            : 'bg-card text-muted border border-border'
                            }`}
                    >
                        {t[range]}
                    </button>
                ))}
            </div>

            {/* Chart */}
            {filteredHistory.length > 0 && (
                <div className="px-5 mb-6">
                    <div className="bg-card rounded-2xl p-4 shadow-sm">
                        <WeightChart data={filteredHistory} language={language} />
                    </div>
                </div>
            )}

            {/* History list */}
            <div className="px-5">
                <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                    {t.history}
                </h2>
                <div className="space-y-2 max-h-50 overflow-y-auto">
                    {[...weightHistory].reverse().map(entry => (
                        <div
                            key={entry.date}
                            className="bg-card rounded-xl p-4 flex items-center justify-between shadow-sm"
                        >
                            <div>
                                <div className="font-bold text-primary text-base">
                                    {entry.value} {t.kg}
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    {new Date(entry.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteEntry(entry.date)}
                                className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add weight modal */}
            {showAddModal && (
                <ModalWrapper onClose={() => setShowAddModal(false)}>
                    <h2 className="text-xl font-black text-primary mb-6">{t.addWeight}</h2>
                    <div className="space-y-4">
                        <FormField label={t.date}>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className={inputCls}
                            />
                        </FormField>
                        <FormField label={`${t.weight} (${t.kg})`}>
                            <input
                                type="number"
                                step="0.1"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className={inputCls}
                                placeholder="12.5"
                                autoFocus
                            />
                        </FormField>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleAddWeight}
                            disabled={!newWeight}
                            className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50"
                        >
                            {t.save}
                        </button>
                    </div>
                </ModalWrapper>
            )}
        </div>
        </Layout>

    )
}