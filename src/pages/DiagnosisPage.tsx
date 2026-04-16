import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { translations } from '../i18n'
import { ChevronLeft, Plus, Trash2, Edit2 } from 'lucide-react'
import { MedCourse, Diagnosis } from '../types'
import { Pill, HeartPlus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import ProgressBar from '../components/ui/ProgressBar'
import ModalWrapper from '../components/ui/ModalWrapper'
import FormField, { inputCls } from '../components/ui/FormField'
import { getDaysRemaining, getTotalDays, getDaysPassed } from '../utils/dietUtils'


export default function DiagnosisPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { pets, language, updatePet } = useAppStore()
    const pet = pets.find(p => p.id === id)
    const t = translations[language]

    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCourse, setEditingCourse] = useState<MedCourse | null>(null)

    const [showAddDiagnosisModal, setShowAddDiagnosisModal] = useState(false)
    const [newDiagnosisName, setNewDiagnosisName] = useState('')

    const [showEditNotesModal, setShowEditNotesModal] = useState(false)
    const [editNotes, setEditNotes] = useState('')

    const [courseName, setCourseName] = useState('')
    const [amount, setAmount] = useState('')
    const [unit, setUnit] = useState<'г' | 'шт' | 'мл' | 'таб' | 'кап'>('таб')
    const [timesPerDay, setTimesPerDay] = useState('2')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState('')
    const [notes, setNotes] = useState('')
    const [viewingCourse, setViewingCourse] = useState<MedCourse | null>(null)


    if (!pet) {
        navigate('/home', { replace: true })
        return null
    }

    const medCourses = pet.medCourses || []
    const diagnoses = pet.diagnoses || []

    const activeCourses = medCourses.filter(course =>
        new Date(course.endDate) >= new Date()
    )

    const pastCourses = medCourses.filter(course =>
        new Date(course.endDate) < new Date()
    )

    const handleAddDiagnosis = () => {
        if (!newDiagnosisName.trim()) return

        const newDiagnosis: Diagnosis = {
            id: `diagnosis_${crypto.randomUUID()}`,
            name: newDiagnosisName.trim(),
            dateAdded: new Date().toISOString().split('T')[0]
        }

        updatePet({ ...pet, diagnoses: [...diagnoses, newDiagnosis] })
        setNewDiagnosisName('')
        setShowAddDiagnosisModal(false)
    }

    const handleDeleteDiagnosis = (diagnosisId: string) => {
        updatePet({
            ...pet,
            diagnoses: diagnoses.filter(d => d.id !== diagnosisId)
        })
    }

    const openEditNotesModal = () => {
        setEditNotes(pet.notes || '')
        setShowEditNotesModal(true)
    }

    const handleSaveNotes = () => {
        updatePet({ ...pet, notes: editNotes })
        setShowEditNotesModal(false)
    }

    const openAddModal = () => {
        setCourseName('')
        setAmount('')
        setUnit('таб')
        setTimesPerDay('2')
        setStartDate(new Date().toISOString().split('T')[0])
        setEndDate('')
        setNotes('')
        setEditingCourse(null)
        setShowAddModal(true)
    }

    const openEditModal = (course: MedCourse) => {
        setCourseName(course.name)
        setAmount(course.amount.toString())
        setUnit(course.unit)
        setTimesPerDay(course.timesPerDay.toString())
        setStartDate(course.startDate)
        setEndDate(course.endDate)
        setNotes(course.notes)
        setEditingCourse(course)
        setShowAddModal(true)
    }

    const handleSave = () => {
        if (!courseName || !amount || !endDate) return

        const courseId = editingCourse?.id || `course_${crypto.randomUUID()}`

        const newCourse: MedCourse = {
            id: courseId,
            name: courseName,
            amount: parseFloat(amount),
            unit,
            timesPerDay: parseInt(timesPerDay),
            startDate,
            endDate,
            notes,
        }

        const updatedCourses = editingCourse
            ? medCourses.map(c => c.id === editingCourse.id ? newCourse : c)
            : [...medCourses, newCourse]

        updatePet({ ...pet, medCourses: updatedCourses })
        setShowAddModal(false)
    }

    const handleDelete = (courseId: string) => {
        updatePet({
            ...pet,
            medCourses: medCourses.filter(c => c.id !== courseId)
        })
    }

    return (
<Layout>
<div className="min-h-screen bg-app pb-20">

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

                <h1 className="text-2xl font-black text-on-hero mb-2 flex gap-2 items-center">
                    <HeartPlus size={28} /> {t.medicalCard}
                </h1>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-6">

                {/* Diagnoses */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
                            {t.diagnoses}
                        </h2>
                        <button
                            onClick={() => setShowAddDiagnosisModal(true)}
                            className="text-xs font-bold text-accent flex items-center gap-1"
                        >
                            <Plus size={14} />
                            {t.add}
                        </button>
                    </div>

                    {diagnoses.length > 0 ? (
                        <div className="space-y-2">
                            {diagnoses.map(diagnosis => (
                                <div key={diagnosis.id} className="bg-card rounded-xl p-4 shadow-sm flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-black text-primary text-base flex gap-2 items-center">
                                            <Pill size={16} /> {diagnosis.name}
                                        </div>
                                        <div className="text-xs text-muted mt-1">
                                            {new Date(diagnosis.dateAdded).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDiagnosis(diagnosis.id)}
                                        className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddDiagnosisModal(true)}
                            className="w-full bg-card rounded-xl p-4 border-2 border-dashed border-border flex items-center justify-center gap-2 text-accent text-sm font-bold"
                        >
                            <Plus size={20} />
                            {t.addDiagnosis}
                        </button>
                    )}
                </div>

                {/* Active courses */}
                {activeCourses.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
                                💊 {t.activeCourses}
                            </h2>
                            <button
                                onClick={openAddModal}
                                className="text-xs font-bold text-accent flex items-center gap-1"
                            >
                                <Plus size={14} />
                                {t.addCourse}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {activeCourses.map(course => {
                                const totalDays = getTotalDays(course.startDate, course.endDate)
                                const daysPassed = getDaysPassed(course.startDate)
                                const daysRemaining = getDaysRemaining(course.endDate)
                                const progress = Math.min((daysPassed / totalDays) * 100, 100)

                                return (
                                    <div key={course.id} className="bg-card rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="font-black text-primary text-base mb-1">
                                                    {course.name}
                                                </div>
                                                <div className="text-sm text-muted">
                                                    {course.amount} {t.unitLabels[course.unit]} · {course.timesPerDay} {t.timesPerDay}
                                                </div>
                                                <div className="text-xs text-muted mt-1">
                                                    {new Date(course.startDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })} — {new Date(course.endDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })} ({totalDays} {t.days})
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(course)}
                                                    className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-muted"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <ProgressBar
                                            percent={progress}
                                            height="md"
                                            leftLabel={t.progress}
                                            rightLabel={`${daysPassed}/${totalDays} ${t.days} · ${daysRemaining > 0 ? `${daysRemaining} ${t.daysLeft}` : t.completed}`}
                                        />

                                        {course.notes && (
                                            <div className="mt-3 pt-3 border-t border-border text-sm text-muted">
                                                📝 {course.notes}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {activeCourses.length === 0 && (
                    <button
                        onClick={openAddModal}
                        className="w-full bg-card rounded-2xl p-5 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-accent active:scale-95 transition-transform"
                    >
                        <Plus size={28} strokeWidth={2} />
                        <span className="text-sm font-bold">{t.addCourse}</span>
                    </button>
                )}

                {pastCourses.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                            {t.pastCourses}
                        </h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {pastCourses.map(course => (
                                <div
                                    key={course.id}
                                    className="bg-card rounded-xl p-3 shadow-sm opacity-60"
                                >
                                    <div className="flex items-start justify-between">
                                        <button
                                            onClick={() => setViewingCourse(course)}
                                            className="flex-1 text-left"
                                        >
                                            <div className="font-bold text-primary text-sm">
                                                {course.name}
                                            </div>
                                            <div className="text-xs text-muted mt-0.5">
                                                {new Date(course.startDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })} — {new Date(course.endDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="w-7 h-7 rounded-full bg-app flex items-center justify-center text-red-500"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                <div className="bg-card rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-muted uppercase tracking-wide">
                            📝 {t.notes}
                        </div>
                        <button
                            onClick={openEditNotesModal}
                            className="w-7 h-7 rounded-full bg-app flex items-center justify-center text-muted"
                        >
                            <Edit2 size={12} />
                        </button>
                    </div>
                    <div className="text-sm text-primary leading-relaxed">
                        {pet.notes || t.noNotes}
                    </div>
                </div>

            </div>

            {/* Add/Edit Course Modal */}
            {showAddModal && (
                <ModalWrapper onClose={() => setShowAddModal(false)} scrollable>
                        <h2 className="text-xl font-black text-primary mb-6">
                            {editingCourse ? t.editCourse : t.addCourse}
                        </h2>

                        <div className="space-y-4">
                            <FormField label={t.medicineName}>
                                <input
                                    type="text"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className={inputCls}
                                    placeholder={t.medicineNamePlaceholder}
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField label={t.dosage}>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={inputCls}
                                        placeholder="1"
                                    />
                                </FormField>
                                <FormField label={t.unit}>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value as typeof unit)}
                                        className={inputCls}
                                    >
                                        <option value="таб">{language === 'ru' ? 'таб' : 'tab'}</option>
                                        <option value="мл">{language === 'ru' ? 'мл' : 'ml'}</option>
                                        <option value="кап">{language === 'ru' ? 'кап' : 'drops'}</option>
                                    </select>
                                </FormField>
                            </div>

                            <FormField label={t.timesPerDay}>
                                <input
                                    type="number"
                                    value={timesPerDay}
                                    onChange={(e) => setTimesPerDay(e.target.value)}
                                    className={inputCls}
                                    placeholder="2"
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField label={t.startDate}>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={inputCls}
                                    />
                                </FormField>
                                <FormField label={t.endDate}>
                                    <input
                                        type="date"
                                        value={endDate}
                                        placeholder='DD-MM-YYYY'
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={inputCls}
                                    />
                                </FormField>
                            </div>

                            <FormField label={t.notes}>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className={`${inputCls} resize-none`}
                                    rows={3}
                                    placeholder={t.notesPlaceholder}
                                />
                            </FormField>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!courseName || !amount || !endDate}
                                className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50"
                            >
                                {t.save}
                            </button>
                        </div>
                </ModalWrapper>
            )}

            {/* Add Diagnosis Modal */}
            {showAddDiagnosisModal && (
                <ModalWrapper onClose={() => setShowAddDiagnosisModal(false)}>
                    <h2 className="text-xl font-black text-primary mb-6">{t.addDiagnosis}</h2>
                    <FormField label={t.diagnosis}>
                        <input
                            type="text"
                            value={newDiagnosisName}
                            onChange={(e) => setNewDiagnosisName(e.target.value)}
                            className={inputCls}
                            placeholder={t.diagnosisPlaceholder}
                            autoFocus
                        />
                    </FormField>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddDiagnosisModal(false)} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleAddDiagnosis}
                            disabled={!newDiagnosisName.trim()}
                            className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold disabled:opacity-50"
                        >
                            {t.add}
                        </button>
                    </div>
                </ModalWrapper>
            )}

            {/* Edit Notes Modal */}
            {showEditNotesModal && (
                <ModalWrapper onClose={() => setShowEditNotesModal(false)}>
                    <h2 className="text-xl font-black text-primary mb-6">{t.editNotes}</h2>
                    <FormField label={t.notes}>
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className={`${inputCls} resize-none`}
                            rows={5}
                            placeholder={t.notesPlaceholder}
                            autoFocus
                        />
                    </FormField>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowEditNotesModal(false)} className="flex-1 py-3 rounded-xl bg-app text-primary font-bold">
                            {t.cancel}
                        </button>
                        <button onClick={handleSaveNotes} className="flex-1 py-3 rounded-xl bg-accent text-on-hero font-bold">
                            {t.save}
                        </button>
                    </div>
                </ModalWrapper>
            )}

            {viewingCourse && (
                <ModalWrapper onClose={() => setViewingCourse(null)} scrollable>
                    <h2 className="text-xl font-black text-primary mb-6">{viewingCourse.name}</h2>
                    <div className="space-y-4">
                        <div className="bg-app rounded-xl p-4">
                            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{t.dosage}</div>
                            <div className="text-lg font-black text-primary">
                                {viewingCourse.amount} {t.unitLabels[viewingCourse.unit]} · {viewingCourse.timesPerDay} {t.timesPerDay}
                            </div>
                        </div>
                        <div className="bg-app rounded-xl p-4">
                            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{t.duration}</div>
                            <div className="text-sm font-bold text-primary">
                                {new Date(viewingCourse.startDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(viewingCourse.endDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-muted mt-1">
                                {getTotalDays(viewingCourse.startDate, viewingCourse.endDate)} {t.days}
                            </div>
                        </div>
                        {viewingCourse.notes && (
                            <div className="bg-app rounded-xl p-4">
                                <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">📝 {t.notes}</div>
                                <div className="text-sm text-primary leading-relaxed">{viewingCourse.notes}</div>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setViewingCourse(null)} className="w-full py-3 rounded-xl bg-accent text-on-hero font-bold mt-6">
                        {t.close}
                    </button>
                </ModalWrapper>
            )}
        </div>
</Layout>
        
    )
}