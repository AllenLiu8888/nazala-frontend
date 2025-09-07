import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from '../../components/shared/QRCode';

const HomePage = () => {
    const navigate = useNavigate();

    // 键盘事件监听
    useEffect(() => {
        const goToIntro = () => {
            navigate('/screen/intro');
        };
        
        window.addEventListener('keydown', goToIntro);
        return () => window.removeEventListener('keydown', goToIntro);
    }, [navigate]);

    // 导航到游戏大厅的函数
    const goToIntro = () => {
        navigate('/screen/intro');
    };

    const HomePageTitle = "Memory Trading & Editing";
    const HomePageSubtitle = "An Interactive Art Installation";

    return (
        <div className="flex items-center justify-center ">
            <div 
                className="flex flex-col gap-20 items-center justify-center min-h-screen cursor-pointer"
                onClick={goToIntro}
            >
                <div className="flex flex-col items-center justify-center text-center gap-6">
                    <h1 className="font-pixel leading-normal text-8xl font-bold text-cyan-300">
                        {HomePageTitle}
                    </h1>
                    
                    <p className="font-pixel text-6xl text-cyan-300 font-light">
                        {HomePageSubtitle}
                    </p>
                </div>
                <QRCode/>
                <div className="font-pixel animate-pulse">
                    <p className="text-4xl text-gray-400">
                        Press any key or click to start
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;