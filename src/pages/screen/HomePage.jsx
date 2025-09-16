// import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from '../../components/shared/QRCode';
// import { useGameContext } from '../../hooks/useGameContext';

const HomePage = () => {
    const navigate = useNavigate();
    // const { game, loading, error, getCurrentGame } = useGameContext();

    // // 页面加载时获取游戏数据
    // useEffect(() => {
    //     const loadGameData = async () => {
    //         try {
    //             console.log('🏠 HomePage: 加载游戏数据...');
    //             await getCurrentGame();
    //             console.log('✅ HomePage: 从 Context 获取游戏数据:', game);
    //         } catch (error) {
    //             console.error('❌ HomePage: 加载失败:', error.message);
    //         }
    //     };
        
    //     loadGameData();
    // }, [getCurrentGame]); // eslint-disable-line react-hooks/exhaustive-deps

    // // 键盘事件监听
    // useEffect(() => {
    //     const goToIntro = () => {
    //         navigate('/screen/intro');
    //     };
        
    //     window.addEventListener('keydown', goToIntro);
    //     return () => window.removeEventListener('keydown', goToIntro);
    // }, [navigate]);

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
                    
                    {/* 显示游戏状态
                    {loading && (
                        <p className="font-pixel text-2xl text-yellow-300">
                            加载中...
                        </p>
                    )}
                    {error && (
                        <p className="font-pixel text-2xl text-red-300">
                            错误: {error}
                        </p>
                    )}
                    {game && (
                        <div className="font-pixel text-2xl text-green-300">
                            <p>游戏 ID: {game.id}</p>
                            <p>状态: {game.status === 0 ? '等待中' : '进行中'}</p>
                            <p>玩家数: {game.players_count}</p>
                        </div>
                    )} */}
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