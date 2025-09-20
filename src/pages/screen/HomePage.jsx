import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../../services/gameApi';

const HomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const startGame = async () => {
        try {
            setLoading(true);
            console.log('loding current game...');

            // 调用后端API获取当前游戏
            const gameData = await gameApi.getCurrentGame(); //从api获取当前游戏
            const currentGame = gameData.game; //当前游戏

            console.log('already get current game:', currentGame);
            console.log('current game id:', currentGame.id); //当前游戏id

            // 可以将游戏ID存储到localStorage或传递给intro页面
            localStorage.setItem('currentGameId', currentGame.id);

            // 跳转到intro页面
            navigate('/screen/lobby'); //跳转到lobby页面

        } catch (error) {
            console.error('get game info failed:', error);
            // 即使API调用失败，也跳转到intro页面
            alert('get game info failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const HomePageTitle = "Memory Trading & Editing";
    const HomePageSubtitle = "An Interactive Art Installation";

    return (
        <div className="flex items-center justify-center ">
            <div
                className={`flex flex-col gap-40 items-center justify-center min-h-screen ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
                onClick={loading ? undefined : startGame}
            >
                <div className="flex flex-col items-center justify-center text-center gap-6">
                    <h1 className="font-pixel leading-normal text-8xl font-bold text-cyan-300">
                        {HomePageTitle}
                    </h1>
                    
                    <p className="font-pixel text-6xl text-cyan-300 font-light">
                        {HomePageSubtitle}
                    </p>
                    
                </div>
                <div className="font-pixel animate-pulse">
                    <p className="text-4xl text-gray-400">
                        {loading ? 'Loading game...' : 'Press any key or click to start'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;