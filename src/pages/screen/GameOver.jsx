import RadarChart from '../../components/dashboard/main/RadarChart';

const GameOver = () => {
  const title = "GAME OVER";
  const subtitle = "After 10 years of decisions, here's the world you created...";
  return (
    <>
        <div className="h-full overflow-hidden flex flex-col items-center justify-center gap-6 py-12">
            {/* Title 部分 */} 
            {/*<header className="flex flex-col items-center justify-center text-center">
                <h1 className="leading-normal text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">NAVIGATING THE FUTURE OF MEMORY</h1>
                <p className="text-2xl text-cyan-300">2075 | The boundary between memory and privacy</p>
            </header>*/}
            <header className="flex flex-col items-center justify-center text-center gap-4">
                <h1 className="font-pixel leading-tight text-5xl font-bold text-cyan-300 tracking-wide">
                    {title}
                </h1>
                <p className="font-pixel text-xl font-medium text-cyan-300 tracking-wider opacity-90">
                    {subtitle}
                </p>
            </header>

            {/* 游戏框部分 */}
            <main className="flex-1 flex px-4 py-2 w-8/10">
                <div className="h-full w-full flex flex-col justify-center  px-20 py-15 items-center ">
                    <section className="flex-1 overflow-hidden">
                        <p className="pb-4 text-2xl leading-relaxed text-cyan-200">
                        The chamber releases a final surge of light. Your chosen memory vanishes, leaving a hollow echo in your mind. On the giant screen, the crowd reacts—some cheer your sacrifice, others whisper doubts. Outside, society tilts: new rules form, trust shifts, and the balance of power bends to your decision. You step back into the world changed, carrying both the loss and the weight of its consequence. Game Over—your choice has written history.
                        </p>
                    </section>  
                    <RadarChart />
                </div>
            </main>
        </div>
    </>
);
};

export default GameOver;