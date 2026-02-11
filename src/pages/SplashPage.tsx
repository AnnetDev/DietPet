import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DropLogo from '../assets/dietpetlogo.svg?react'
type Stage = 'logo' | 'diet' | 'pet' | 'line'

export default function SplashPage() {
    const navigate = useNavigate()
    const [stage, setStage] = useState<Stage>('logo')

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage('diet'), 800),
            setTimeout(() => setStage('pet'), 1400),
            setTimeout(() => setStage('line'), 1900),
            setTimeout(() => navigate('/home', { replace: true }), 400000),
        ]
        return () => timers.forEach(clearTimeout)
    }, [navigate])

    return (
        <div className="min-h-screen bg-app flex  items-center justify-center gap-6">

            {/* Логотип-капля */}
            <div
                style={{
                    animation: 'fadeIn 1s ease forwards',
                }}
            >
                <DropLogo className="w-28 h-28" />
            </div>

            <div><div className="flex flex-col items-start">

                {/* Diet */}
                <div
                    className="text-4xl font-black text-primary tracking-tight overflow-hidden"
                    style={{
                        opacity: stage === 'logo' ? 0 : 1,
                        transform: stage === 'logo' ? 'translateX(-20px)' : 'translateX(0)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                >
                    Diet
                </div>

                <div
                    className="h-0.5 bg-accent my-1 rounded-full"
                    style={{
                        width: stage === 'line' ? '100%' : '0%',
                        transition: 'width 0.5s ease',
                    }}
                />

                {/* Pet */}
                <div
                    className="text-4xl font-black text-accent tracking-tight overflow-hidden"
                    style={{
                        opacity: stage === 'logo' || stage === 'diet' ? 0 : 1,
                        transform: stage === 'logo' || stage === 'diet'
                            ? 'translateX(-20px)'
                            : 'translateX(0)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                >
                    Pet
                </div>
                {/* Подзаголовок */}
            <div
                className="text-sm text-muted font-semibold tracking-wide"
                style={{
                    opacity: stage === 'line' ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                }}
            >
                pet nutrition tracker
            </div>

            </div></div>
            

            

        </div>
        
    )
}
