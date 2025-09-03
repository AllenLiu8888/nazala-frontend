import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    // 导航到游戏大厅的函数
    const goToLobby = () => {
        navigate('/screen/lobby');
    };

    // 键盘事件监听
    useEffect(() => {
        window.addEventListener('keydown', goToLobby);
        return () => window.removeEventListener('keydown', goToLobby);
    }, [navigate]);

    return (
        <>
            <div 
                className="flex flex-col gap-80 items-center justify-center min-h-screen cursor-pointer"
                onClick={goToLobby}
            >
                <div className="flex flex-col items-center justify-center text-center gap-6">
                    <h1 className="leading-normal text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Memory Trading & Editing
                    </h1>
                    
                    <p className="text-6xl text-gray-300 font-light">
                        An Interactive Art Installation
                    </p>
                </div>
                <div className="animate-pulse">
                    <p className="text-4xl text-gray-400">
                        Press any key or click to start
                    </p>
                </div>
                </div>
        </>
    );
};

export default HomePage;