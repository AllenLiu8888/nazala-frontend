// QRCode.jsx
import { QRCodeCanvas } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import useGameStoreScreen from '../../store/index_screen'; 

const QRCode = () => {
    const storeGameId = useGameStoreScreen(s => s.gameMeta.id);
    const { gameId: routeGameId } = useParams();
    const gameId = storeGameId || routeGameId;
    const playersCount = useGameStoreScreen(s => s.gameMeta.playersCount);

    const showValues = useGameStoreScreen(s => s.uiConfig?.showValues);
    const getQRCodeURL = () => {
        const baseUrl = (import.meta.env?.VITE_ROOT_URL) || window.location.origin;
        const sv = showValues ? 1 : 0;
        return `${baseUrl}/game/${gameId}/waiting?sv=${sv}`;
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
                                bgColor="transparent"  
                                fgColor="#ffffff" 
                            />
                        </div>
                    ) : (
                        <div className="text-cyan-300 text-6xl text-center">
                            Loading QR...
                        </div>
                    )}
                </div>
                <p className="font-pixel text-5xl text-cyan-300 text-center">
                    Existing Players: {playersCount}
                </p>
            </div>
        </section>
    );
}

export default QRCode;