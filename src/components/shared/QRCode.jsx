// QRCode.jsx
import { QRCodeCanvas } from 'qrcode.react';
import useGameStoreScreen from '../../store/index_screen'; 

const QRCode = () => {
    // 直接从 store 读取数据（轮询会自动更新）
    const gameId = useGameStoreScreen(s => s.gameMeta.id);
    const playersCount = useGameStoreScreen(s => s.gameMeta.playersCount);

    const getQRCodeURL = () => {
        // 使用当前窗口的地址前缀（协议 + 域名 + 端口）
        // return `${import.meta.env.VITE_ROOT_URL || 'http://localhost:5173'}/game/${gameId}/waiting`
        const baseUrl = window.location.origin;
        return `${baseUrl}/game/${gameId}/waiting`;
    }

    const handleQRCodeClick = () => {
        const url = getQRCodeURL();
        window.open(url, '_blank');
    }

    return (
        <section className="overflow-hidden">
            <div className="h-full w-full flex flex-col items-center justify-center gap-10">
                <div className="w-100 h-100 bg-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center">
                    {gameId ? (
                        <div
                            onClick={handleQRCodeClick}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Click to open URL in new tab"
                        >
                            <QRCodeCanvas
                                value={getQRCodeURL()}
                                size={300}
                                level="H"
                                bgColor="transparent"  // 背景透明
                                fgColor="#ffffff" // 前景色
                            />
                        </div>
                    ) : (
                        <div className="text-cyan-300 text-6xl text-center">
                            Loading QR...
                        </div>
                    )}
                </div>
                <p className="text-4xl text-cyan-300 text-center">
                    Existing Players: {playersCount}
                </p>
            </div>
        </section>
    );
}

export default QRCode;