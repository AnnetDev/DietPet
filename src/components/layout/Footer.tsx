import { HouseHeart } from 'lucide-react';
import DropLogo from '../../assets/dietpetlogo.svg?react'
import { useNavigate } from 'react-router-dom';


export default function Footer() {
    const navigate = useNavigate()

    return (
        <div className="border-t border-border bg-card px-6 pb-4 pt-3 flex items-center justify-center rounded-tr-xl rounded-tl-xl ">
            <div className='flex justify-between items-center w-full'>
            <button
                onClick={() => navigate('/home')}>
                <HouseHeart size={26} className="font-black" />
            </button>
            <button
                onClick={() => navigate('/home')}>
                <div className="text-base font-black text-primary flex">
                    <DropLogo className="w-5 h-5 ml-3" />

                    Diet<span className="text-accent">Pet</span>
                </div>
            </button>
            </div>
        </div>
    )
}