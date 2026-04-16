import ModalWrapper from './ModalWrapper'

interface ConfirmModalProps {
    title: string
    description?: string
    confirmLabel: string
    cancelLabel: string
    onConfirm: () => void
    onClose: () => void
    /** Red confirm button (delete). Default: accent colour */
    danger?: boolean
}

export default function ConfirmModal({
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onClose,
    danger = false,
}: ConfirmModalProps) {
    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-xl font-black text-primary mb-4">{title}</h2>
            {description && (
                <p className="text-sm text-muted mb-6">{description}</p>
            )}
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-app text-primary font-bold"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    className={`flex-1 py-3 rounded-xl font-bold text-white ${danger ? 'bg-red-500' : 'bg-accent'}`}
                >
                    {confirmLabel}
                </button>
            </div>
        </ModalWrapper>
    )
}
