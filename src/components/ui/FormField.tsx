import { ReactNode } from 'react'

interface FormFieldProps {
    label: string
    children: ReactNode
    className?: string
}

/** Shared input/select/textarea base classes */
export const inputCls =
    'w-full bg-app border border-border rounded-xl px-4 py-3 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-accent'

export default function FormField({ label, children, className }: FormFieldProps) {
    return (
        <div className={className}>
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                {label}
            </label>
            {children}
        </div>
    )
}
