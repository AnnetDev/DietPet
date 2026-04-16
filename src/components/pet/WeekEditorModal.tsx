import { useState } from 'react'
import { Plus, Trash2, Copy, X } from 'lucide-react'
import { DietItem, DietItemType, DietItemUnit } from '../../types'
import ModalWrapper from '../ui/ModalWrapper'
import ConfirmModal from '../ui/ConfirmModal'
import FormField, { inputCls } from '../ui/FormField'
import { getItemIcon } from '../../utils/dietUtils'
import { translations } from '../../i18n'

interface WeekEditorModalProps {
    weekNum: number
    initialItems: DietItem[]
    prevWeekItems?: DietItem[]
    language: 'ru' | 'en'
    t: typeof translations.ru | typeof translations.en
    onSave: (items: DietItem[]) => void
    onCancel: () => void
    onDelete: () => void
}

export default function WeekEditorModal({
    weekNum, initialItems, prevWeekItems, language, t, onSave, onCancel, onDelete,
}: WeekEditorModalProps) {
    const [items, setItems] = useState<DietItem[]>([...initialItems])
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editItemName, setEditItemName] = useState('')
    const [editItemAmount, setEditItemAmount] = useState('')
    const [showAddItemModal, setShowAddItemModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [itemName, setItemName] = useState('')
    const [itemAmount, setItemAmount] = useState('')
    const [itemUnit, setItemUnit] = useState<DietItemUnit>('г')
    const [itemType, setItemType] = useState<DietItemType>('dry')

    const startEditingItem = (item: DietItem) => {
        setEditingItemId(item.id)
        setEditItemName(item.name)
        setEditItemAmount(item.amount.toString())
    }

    const saveItemEdit = (itemId: string) => {
        setItems(items.map(i =>
            i.id === itemId ? { ...i, name: editItemName, amount: parseFloat(editItemAmount) } : i
        ))
        setEditingItemId(null)
    }

    const handleAddItem = () => {
        if (!itemName || !itemAmount) return
        setItems([...items, {
            id: `item_${crypto.randomUUID()}`,
            name: itemName.trim(),
            amount: parseFloat(itemAmount),
            unit: itemUnit,
            type: itemType,
        }])
        setShowAddItemModal(false)
    }

    const openAddItemModal = () => {
        setItemName(''); setItemAmount(''); setItemUnit('г'); setItemType('dry')
        setShowAddItemModal(true)
    }

    return (
        <>
            <ModalWrapper onClose={onCancel} scrollable>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-primary">{t.week} {weekNum}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button onClick={onCancel} className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-muted">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {weekNum > 1 && prevWeekItems && prevWeekItems.length > 0 && (
                    <button
                        onClick={() => setItems([...prevWeekItems])}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-app rounded-xl text-sm font-bold text-muted mb-4"
                    >
                        <Copy size={14} />
                        {t.copyFromWeek} {weekNum - 1}
                    </button>
                )}

                <div className="space-y-2 mb-4">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 bg-app rounded-xl p-3">
                            <span className="text-lg">{getItemIcon(item.type)}</span>
                            {editingItemId === item.id ? (
                                <div className="flex-1 flex flex-col gap-2">
                                    <input type="text" value={editItemName} onChange={(e) => setEditItemName(e.target.value)}
                                        className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                        autoFocus />
                                    <div className="flex gap-2">
                                        <input type="number" step="0.5" value={editItemAmount} onChange={(e) => setEditItemAmount(e.target.value)}
                                            className="w-20 bg-card border border-border rounded-lg px-2 py-1 text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
                                        <span className="text-xs text-muted self-center">{t.unitLabels[item.unit]}</span>
                                        <div className="flex gap-1 ml-auto">
                                            <button onClick={() => setEditingItemId(null)} className="px-2 py-1 rounded-lg bg-card text-muted text-xs font-bold">{t.cancel}</button>
                                            <button onClick={() => saveItemEdit(item.id)} className="px-2 py-1 rounded-lg bg-accent text-on-hero text-xs font-bold">{t.save}</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEditingItem(item)}>
                                        <div className="font-semibold text-sm text-primary">{item.name}</div>
                                        <div className="text-xs text-muted">{item.amount} {t.unitLabels[item.unit]}</div>
                                    </div>
                                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                        className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-red-500">
                                        <Trash2 size={12} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={openAddItemModal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-accent font-bold text-sm mb-4">
                    <Plus size={18} />
                    {t.addItem}
                </button>

                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">{t.cancel}</button>
                    <button onClick={() => onSave(items)} className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold">{t.save}</button>
                </div>
            </ModalWrapper>

            {showDeleteConfirm && (
                <ConfirmModal
                    title={language === 'ru' ? `Удалить неделю ${weekNum}?` : `Delete week ${weekNum}?`}
                    confirmLabel={t.delete}
                    cancelLabel={t.cancel}
                    onConfirm={onDelete}
                    onClose={() => setShowDeleteConfirm(false)}
                    danger
                />
            )}

            {showAddItemModal && (
                <ModalWrapper onClose={() => setShowAddItemModal(false)} elevated>
                    <h2 className="text-xl font-black text-primary mb-6">{t.addItem}</h2>
                    <div className="space-y-4">
                        <FormField label={t.itemName}>
                            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)}
                                className={inputCls} placeholder={t.itemNamePlaceholder} autoFocus />
                        </FormField>

                        <FormField label={t.type}>
                            <select value={itemType} onChange={(e) => setItemType(e.target.value as DietItemType)} className={inputCls}>
                                <option value="dry">{getItemIcon('dry')} {language === 'ru' ? 'Сухой корм' : 'Dry food'}</option>
                                <option value="wet">{getItemIcon('wet')} {language === 'ru' ? 'Влажный корм' : 'Wet food'}</option>
                                <option value="natural">{getItemIcon('natural')} {language === 'ru' ? 'Натуральная еда' : 'Natural food'}</option>
                                <option value="medicine">{getItemIcon('medicine')} {language === 'ru' ? 'Лекарство' : 'Medicine'}</option>
                                <option value="other">{getItemIcon('other')} {language === 'ru' ? 'Другое' : 'Other'}</option>
                            </select>
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label={t.amount}>
                                <input type="number" step="0.5" value={itemAmount} onChange={(e) => setItemAmount(e.target.value)}
                                    className={inputCls} placeholder="40" />
                            </FormField>
                            <FormField label={t.unit}>
                                <select value={itemUnit} onChange={(e) => setItemUnit(e.target.value as DietItemUnit)} className={inputCls}>
                                    <option value="г">{language === 'ru' ? 'г' : 'g'}</option>
                                    <option value="шт">{language === 'ru' ? 'шт' : 'pcs'}</option>
                                    <option value="мл">{language === 'ru' ? 'мл' : 'ml'}</option>
                                    <option value="таб">{language === 'ru' ? 'таб' : 'tab'}</option>
                                    <option value="кап">{language === 'ru' ? 'кап' : 'drops'}</option>
                                </select>
                            </FormField>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddItemModal(false)} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">{t.cancel}</button>
                        <button onClick={handleAddItem} disabled={!itemName || !itemAmount}
                            className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50">{t.add}</button>
                    </div>
                </ModalWrapper>
            )}
        </>
    )
}
