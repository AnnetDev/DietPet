import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../locales'
import { ChevronLeft, Plus, Edit2, Trash2, Copy, X } from 'lucide-react'
import { DietItem, DietItemType, DietItemUnit, DietWeek } from '../types'

function getDayAndWeek(startDate: string | null) {
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

export default function DietPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets, language, updatePet } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const t = translations[language]

    const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

    // Edit mode states
    const [editMode, setEditMode] = useState(false)
    const [editingWeek, setEditingWeek] = useState<number | null>(null)
    const [weekItems, setWeekItems] = useState<DietItem[]>([])

    // Add item modal
    const [showAddItemModal, setShowAddItemModal] = useState(false)
    const [itemName, setItemName] = useState('')
    const [itemAmount, setItemAmount] = useState('')
    const [itemUnit, setItemUnit] = useState<DietItemUnit>('г')
    const [itemType, setItemType] = useState<DietItemType>('dry')
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editItemName, setEditItemName] = useState('')
    const [editItemAmount, setEditItemAmount] = useState('')
    const [showEditDateModal, setShowEditDateModal] = useState(false)
    const [editStartDate, setEditStartDate] = useState('')
    const [showPastWeeks, setShowPastWeeks] = useState(false)


    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const startEditingItem = (item: DietItem) => {
        setEditingItemId(item.id)
        setEditItemName(item.name)
        setEditItemAmount(item.amount.toString())
    }

    const saveItemEdit = (itemId: string) => {
        setWeekItems(weekItems.map(item =>
            item.id === itemId
                ? { ...item, name: editItemName, amount: parseFloat(editItemAmount) }
                : item
        ))
        setEditingItemId(null)
    }

    const cancelItemEdit = () => {
        setEditingItemId(null)
    }

    // const openEditDateModal = () => {
    //     setEditStartDate(pet.dietStartDate || new Date().toISOString().split('T')[0])
    //     setShowEditDateModal(true)
    // }

    const handleSaveDate = () => {
        updatePet({ ...pet, dietStartDate: editStartDate })
        setShowEditDateModal(false)
    }


    const progress = getDayAndWeek(pet.dietStartDate)
    const currentWeek = progress?.week || null

    const dietSchedule = pet.dietSchedule || []

    const toggleWeek = (weekNum: number) => {
        setExpandedWeek(expandedWeek === weekNum ? null : weekNum)
    }

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'dry': return '🥣'
            case 'wet': return '🍱'
            case 'medicine': return '💊'
            case 'natural': return '🥩'
            default: return '📦'
        }
    }

    const pastWeeks = dietSchedule.filter(w => currentWeek && w.week < currentWeek)
    const activeWeeks = dietSchedule.filter(w => !currentWeek || w.week >= currentWeek)


    // Enter edit mode
    const handleEditClick = () => {
        setEditMode(true)
    }

    // Save all changes
    const handleSaveAll = () => {
        setEditMode(false)
        setEditingWeek(null)
    }

    // Cancel edit mode
    const handleCancelEdit = () => {
        setEditMode(false)
        setEditingWeek(null)
    }

    // Open week editor
    const openWeekEditor = (weekNum: number) => {
        const week = dietSchedule.find(w => w.week === weekNum)
        setEditingWeek(weekNum)
        setWeekItems(week ? [...week.items] : [])
    }

    // Save week changes
    const handleSaveWeek = () => {
        const updatedSchedule = dietSchedule.map(w =>
            w.week === editingWeek
                ? { ...w, items: weekItems }
                : w
        )
        updatePet({ ...pet, dietSchedule: updatedSchedule })
        setEditingWeek(null)
    }

    // Cancel week editing
    const handleCancelWeek = () => {
        setEditingWeek(null)
    }

    // Delete item from week
    const handleDeleteItem = (itemId: string) => {
        setWeekItems(weekItems.filter(item => item.id !== itemId))
    }

    // Open add item modal
    const openAddItemModal = () => {
        setItemName('')
        setItemAmount('')
        setItemUnit('г')
        setItemType('dry')
        setShowAddItemModal(true)
    }

    // Add item to week
    const handleAddItem = () => {
        if (!itemName || !itemAmount) return

        const newItem: DietItem = {
            id: `item_${crypto.randomUUID()}`,
            name: itemName.trim(),
            amount: parseFloat(itemAmount),
            unit: itemUnit,
            type: itemType,
        }

        setWeekItems([...weekItems, newItem])
        setShowAddItemModal(false)
    }

    // Copy week
    const handleCopyWeek = (weekNum: number) => {
        const week = dietSchedule.find(w => w.week === weekNum)
        if (week) {
            setWeekItems([...week.items])
        }
    }

    const handleAddWeek = () => {
        const newWeekNumber = dietSchedule.length + 1
        const newWeek: DietWeek = {
            week: newWeekNumber,
            items: []
        }

        updatePet({
            ...pet,
            dietSchedule: [...dietSchedule, newWeek]
        })

        openWeekEditor(newWeekNumber)
    }

    return (
        <div className="min-h-screen bg-app pb-20">

            {/* Header */}
            <div className="bg-hero px-5 pt-14 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(`/pet/${id}`)}
                        className="flex items-center gap-1 text-on-hero text-sm font-bold"
                    >
                        <ChevronLeft size={16} />
                        {t.goBack}
                    </button>

                    {!editMode ? (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center gap-1 bg-on-hero/20 text-on-hero px-3 py-1.5 rounded-full text-sm font-bold"
                        >
                            <Edit2 size={14} />
                            {t.edit}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-full text-sm font-bold text-on-hero "
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSaveAll}
                                className="bg-on-hero text-hero px-3 py-1.5 rounded-full text-sm font-bold"
                            >
                                {t.done}
                            </button>
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-black text-on-hero mb-2">
                    🍽️ {t.diet}
                </h1>

                {pet.dietStartDate && (
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-on-hero">
                            {t.startedOn} {new Date(pet.dietStartDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4">

                {/* Current day highlight */}
                {!editMode && currentWeek && dietSchedule[currentWeek - 1] && (
                    <div className="bg-accent rounded-2xl p-4 shadow-lg">
                        <div className="text-xs font-bold text-on-hero uppercase tracking-wide mb-2">
                            {t.today} · {t.day} {progress?.day} · {t.week} {currentWeek}
                        </div>
                        <div className="space-y-2">
                            {dietSchedule[currentWeek - 1].items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-on-hero/10 rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2 text-on-hero">
                                        <span className="text-lg">{getItemIcon(item.type)}</span>
                                        <span className="font-semibold text-sm">{item.name}</span>
                                    </div>
                                    <div className="font-black text-on-hero text-sm">
                                        {item.amount} {item.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Week list */}
                <div>
                <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                    {t.fullSchedule}
                </h2>

                {dietSchedule.length === 0 ? (
                    <button
                        onClick={handleAddWeek}
                        className="w-full bg-card rounded-2xl p-5 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-accent active:scale-95 transition-transform"
                    >
                        <Plus size={28} strokeWidth={2} />
                        <span className="text-sm font-bold">{t.createDiet}</span>
                    </button>
                ) : (
                    <>
                        <div className="space-y-2">
                            {/* Active weeks */}
                            {activeWeeks.map((weekData) => {
                                const isExpanded = expandedWeek === weekData.week
                                const isCurrent = currentWeek === weekData.week

                                return (
                                    <div
                                        key={weekData.week}
                                        className={`bg-card rounded-2xl shadow-sm overflow-hidden transition-all ${isCurrent ? 'ring-2 ring-accent' : ''
                                            }`}
                                    >
                                        <button
                                            onClick={() => !editMode && toggleWeek(weekData.week)}
                                            className="w-full px-4 py-3 flex items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${isCurrent
                                                        ? 'bg-accent text-on-hero'
                                                        : 'bg-app text-muted'
                                                    }`}>
                                                    {weekData.week}
                                                </div>
                                                <div>
                                                    <div className="font-black text-primary text-sm">
                                                        {t.week} {weekData.week}
                                                    </div>
                                                    <div className="text-xs text-muted">
                                                        {weekData.items.length} {t.items}
                                                    </div>
                                                </div>
                                            </div>

                                            {editMode ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openWeekEditor(weekData.week)
                                                    }}
                                                    className="px-3 py-1.5 bg-accent text-on-hero rounded-full text-xs font-bold"
                                                >
                                                    {t.edit}
                                                </button>
                                            ) : (
                                                <div className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </div>
                                            )}
                                        </button>

                                        {isExpanded && !editMode && (
                                            <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                                                {weekData.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between bg-app rounded-xl px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base">{getItemIcon(item.type)}</span>
                                                            <span className="font-semibold text-sm text-primary">{item.name}</span>
                                                        </div>
                                                        <div className="font-black text-primary text-sm">
                                                            {item.amount} {item.unit}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Add Week button*/}
                            {editMode && (
                                <button
                                    onClick={handleAddWeek}
                                    className="w-full bg-card rounded-2xl p-4 border-2 border-dashed border-border flex items-center justify-center gap-2 text-accent active:scale-95 transition-transform"
                                >
                                    <Plus size={20} />
                                    <span className="text-sm font-bold">{t.addWeek}</span>
                                </button>
                            )}
                        </div>

                        {/* Past weeks toggle */}
                        {pastWeeks.length > 0 && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowPastWeeks(!showPastWeeks)}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-muted py-2"
                                >
                                    <span>{showPastWeeks ? t.hidePastWeeks : t.showPastWeeks} ({pastWeeks.length})</span>
                                    <span className={`transition-transform ${showPastWeeks ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {showPastWeeks && (
                                    <div className="space-y-2 mt-3 opacity-60">
                                        {pastWeeks.map((weekData) => {
                                            const isExpanded = expandedWeek === weekData.week

                                            return (
                                                <div
                                                    key={weekData.week}
                                                    className="bg-card rounded-2xl shadow-sm overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => !editMode && toggleWeek(weekData.week)}
                                                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm bg-app text-muted">
                                                                {weekData.week}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-primary text-sm">
                                                                    {t.week} {weekData.week}
                                                                </div>
                                                                <div className="text-xs text-muted">
                                                                    {weekData.items.length} {t.items}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {editMode ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    openWeekEditor(weekData.week)
                                                                }}
                                                                className="px-3 py-1.5 bg-app text-muted rounded-full text-xs font-bold"
                                                            >
                                                                {t.edit}
                                                            </button>
                                                        ) : (
                                                            <div className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                                ▼
                                                            </div>
                                                        )}
                                                    </button>

                                                    {isExpanded && !editMode && (
                                                        <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                                                            {weekData.items.map((item, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center justify-between bg-app rounded-xl px-3 py-2"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-base">{getItemIcon(item.type)}</span>
                                                                        <span className="font-semibold text-sm text-primary">{item.name}</span>
                                                                    </div>
                                                                    <div className="font-black text-primary text-sm">
                                                                        {item.amount} {item.unit}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>

            {/* Week Editor Modal */ }
    {
        editingWeek !== null && (
            <>
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={handleCancelWeek}
                />
                <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl max-h-[85vh] overflow-y-auto modal-container">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-primary">
                            {t.week} {editingWeek}
                        </h2>
                        <button
                            onClick={handleCancelWeek}
                            className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-muted"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Copy from week */}
                    {editingWeek > 1 && (
                        <div className="mb-4">
                            <button
                                onClick={() => handleCopyWeek(editingWeek - 1)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-app rounded-xl text-sm font-bold text-muted"
                            >
                                <Copy size={14} />
                                {t.copyFromWeek} {editingWeek - 1}
                            </button>
                        </div>
                    )}

                    {/* Items list */}
                    <div className="space-y-2 mb-4">
                        {weekItems.map(item => (
                            <div key={item.id} className="flex items-center gap-2 bg-app rounded-xl p-3">
                                <span className="text-lg">{getItemIcon(item.type)}</span>

                                {editingItemId === item.id ? (
                                    // Edit mode
                                    <div className="flex-1 flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={editItemName}
                                            onChange={(e) => setEditItemName(e.target.value)}
                                            className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={editItemAmount}
                                                onChange={(e) => setEditItemAmount(e.target.value)}
                                                className="w-20 bg-card border border-border rounded-lg px-2 py-1 text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                            />
                                            <span className="text-xs text-muted self-center">{item.unit}</span>
                                            <div className="flex gap-1 ml-auto">
                                                <button
                                                    onClick={cancelItemEdit}
                                                    className="px-2 py-1 rounded-lg bg-card text-muted text-xs font-bold"
                                                >
                                                    {t.cancel}
                                                </button>
                                                <button
                                                    onClick={() => saveItemEdit(item.id)}
                                                    className="px-2 py-1 rounded-lg bg-accent text-on-hero text-xs font-bold"
                                                >
                                                    {t.save}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <>
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => startEditingItem(item)}
                                        >
                                            <div className="font-semibold text-sm text-primary">{item.name}</div>
                                            <div className="text-xs text-muted">{item.amount} {item.unit}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-red-500"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add item button */}
                    <button
                        onClick={openAddItemModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-accent font-bold text-sm mb-4"
                    >
                        <Plus size={18} />
                        {t.addItem}
                    </button>

                    {/* Save/Cancel */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancelWeek}
                            className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleSaveWeek}
                            className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold"
                        >
                            {t.save}
                        </button>
                    </div>
                </div>
            </>
        )
    }

    {/* Add Item Modal */ }
    {
        showAddItemModal && (
            <>
                <div
                    className="fixed inset-0 bg-black/60 z-50"
                    onClick={() => setShowAddItemModal(false)}
                />
                <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl modal-container">
                    <h2 className="text-xl font-black text-primary mb-6">{t.addItem}</h2>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                {t.itemName}
                            </label>
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder={t.itemNamePlaceholder}
                                autoFocus
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                {t.type}
                            </label>
                            <select
                                value={itemType}
                                onChange={(e) => setItemType(e.target.value as DietItemType)}
                                className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="dry">{getItemIcon('dry')} {language === 'ru' ? 'Сухой корм' : 'Dry food'}</option>
                                <option value="wet">{getItemIcon('wet')} {language === 'ru' ? 'Влажный корм' : 'Wet food'}</option>
                                <option value="natural">{getItemIcon('natural')} {language === 'ru' ? 'Натуральная еда' : 'Natural food'}</option>
                                <option value="medicine">{getItemIcon('medicine')} {language === 'ru' ? 'Лекарство' : 'Medicine'}</option>
                                <option value="other">{getItemIcon('other')} {language === 'ru' ? 'Другое' : 'Other'}</option>
                            </select>
                        </div>

                        {/* Amount + Unit */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                    {t.amount}
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={itemAmount}
                                    onChange={(e) => setItemAmount(e.target.value)}
                                    className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                                    {t.unit}
                                </label>
                                <select
                                    value={itemUnit}
                                    onChange={(e) => setItemUnit(e.target.value as DietItemUnit)}
                                    className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="г">{language === 'ru' ? 'г' : 'g'}</option>
                                    <option value="шт">{language === 'ru' ? 'шт' : 'pcs'}</option>
                                    <option value="мл">{language === 'ru' ? 'мл' : 'ml'}</option>
                                    <option value="таб">{language === 'ru' ? 'таб' : 'tab'}</option>
                                    <option value="кап">{language === 'ru' ? 'кап' : 'drops'}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowAddItemModal(false)}
                            className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleAddItem}
                            disabled={!itemName || !itemAmount}
                            className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50"
                        >
                            {t.add}
                        </button>
                    </div>
                </div>
            </>
        )
    }

    {
        showEditDateModal && (
            <>
                <div
                    className="fixed inset-0 bg-black/60 z-50"
                    onClick={() => setShowEditDateModal(false)}
                />
                <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl modal-container">
                    <h2 className="text-xl font-black text-primary mb-6">{t.editStartDate}</h2>

                    <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                            {t.dietStart}
                        </label>
                        <input
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className="w-full max-w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowEditDateModal(false)}
                            className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleSaveDate}
                            className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold"
                        >
                            {t.save}
                        </button>
                    </div>
                </div>
            </>
        )
    }
        </div >
    )
}