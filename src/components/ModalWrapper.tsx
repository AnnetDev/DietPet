import { ReactNode } from 'react'

interface ModalWrapperProps {
    onClose: () => void
    children: ReactNode
    /** Adds max-h-[85vh] overflow-y-auto for tall content */
    scrollable?: boolean
    /** Elevated z-index for modals stacked on top of other modals */
    elevated?: boolean
}

export default function ModalWrapper({ onClose, children, scrollable = false, elevated = false }: ModalWrapperProps) {
    const backdropZ = elevated ? 'z-50' : 'z-40'
    const modalZ = elevated ? 'z-[60]' : 'z-50'

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 ${backdropZ}`}
                onClick={onClose}
            />
            <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 ${modalZ} bg-card rounded-3xl p-6 max-w-sm mx-auto shadow-2xl modal-container${scrollable ? ' max-h-[85vh] overflow-y-auto' : ''}`}>
                {children}
            </div>
        </>
    )
}
