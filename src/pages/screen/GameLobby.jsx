import GameSection from '../../components/GameSection';
import TitleSection from '../../components/TitleSection';

const GameLobby = () => {
    
    return (
        <>
            <div className="h-full overflow-hidden flex flex-col items-center justify-center gap-6 py-6">
                {/* Title 部分 */} 
                {/*<header className="flex flex-col items-center justify-center text-center">
                    <h1 className="leading-normal text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">NAVIGATING THE FUTURE OF MEMORY</h1>
                    <p className="text-2xl text-cyan-300">2075 | The boundary between memory and privacy</p>
                </header>*/}
                <TitleSection />

                {/* 游戏框部分 */}
                <main className="flex-1 flex px-4 py-2 w-8/10">
                    <GameSection />
                </main>

            </div>
        </>
    );
};

export default GameLobby;
