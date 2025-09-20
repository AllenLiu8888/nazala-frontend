// QRCode.jsx
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { gameApi } from '../../services/gameApi';

const QRCode = () => {
    // 1. 在组件内部定义状态
    const [players, setPlayers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gameId, setGameId] = useState(null); // 新增：游戏ID状态

    // 2. 在组件内部定义获取玩家数据的函数
    const getPlayers = async () => {
        try {
            setLoading(true);
            
            // 从 localStorage 获取当前游戏ID
            const currentGameId = localStorage.getItem('currentGameId');
            console.log('gameId:', currentGameId);
            
            if (currentGameId) {
                // 设置游戏ID状态
                setGameId(currentGameId);
                
                // 调用API获取游戏详情
                const gameDetail = await gameApi.getGameDetail(currentGameId);
                console.log('gameDetail:', gameDetail); //打印游戏详情
                setPlayers(gameDetail?.players_count ?? 0); //知识点：短路求值
            } else {
                console.error('gameId not found');
            }
            
        } catch (error) {
            console.error('get players data failed:', error);
            setPlayers(0);
        } finally {
            setLoading(false);
        }
    };

    // 3. 使用 useEffect 在组件加载时获取数据
    useEffect(() => {
        getPlayers();
    }, []);

    return (
        <section className="overflow-hidden">
            <div className="h-full w-full flex flex-col items-center justify-center gap-10">
                <div className="w-100 h-100 bg-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center">
                    {gameId ? (
                        <QRCodeCanvas 
                            value={`${import.meta.env.VITE_ROOT_URL || 'http://localhost:5173'}/game/${gameId}/waiting`} 
                            size={300}
                            level="H"
                            bgColor="transparent"  // 背景透明
                            fgColor="#ffffff" // 前景色
                        />
                    ) : (
                        <div className="text-cyan-300 text-6xl text-center">
                            Loading QR...
                        </div>
                    )}
                </div>
                <p className="text-4xl text-cyan-300 text-center">
                    {loading ? 'Loading...' : `Existing Player ${players}`}
                </p>
            </div>
        </section>
    );
}

export default QRCode;