import { ReactNode } from 'react'
import Footer from './Footer'

interface LayoutProps {
    children: ReactNode
    showFooter?: boolean
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
    return (
        <div className="min-h-screen bg-app">
            <div className="mx-auto w-full sm:max-w-xl lg:max-w-2xl min-h-screen pb-20">
                {children}
            </div>
            {showFooter && (
                <div className="fixed bottom-0 left-0 right-0">
                    <div className="mx-auto w-full sm:max-w-xl lg:max-w-2xl">
                        <Footer />
                    </div>
                </div>
            )}
        </div>
    )
}