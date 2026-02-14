import { ReactNode } from 'react'
import Footer from './Footer'

interface LayoutProps {
    children: ReactNode
    showFooter?: boolean
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
    return (
        <div className="min-h-screen bg-app pb-20">
            {children}
            {showFooter && (
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto">
                    <Footer />
                </div>
            )}
        </div>
    )
}