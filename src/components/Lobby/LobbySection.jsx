import { Link } from 'react-router-dom';

export default function Game() {

    // const left = "In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.";
    // const right = "QR CODE";
    return (
        <div className="h-full w-full flex border-5 border-cyan-400 rounded-4xl">
            <section className="flex-1 p-20 overflow-hidden">
                {/* 左侧内容 */}
                <h2 className="text-4xl text-cyan-400 font-semibold mb-4">Background</h2>
                <p className="text-2xl leading-relaxed text-cyan-200">
                In the future, memory is no longer private—it is stored, traded, and controlled like currency. Governments and corporations manipulate recollections to shape loyalty, erase dissent, or invent false lives. Markets thrive on selling curated pasts, while citizens guard their memories as tightly as bank accounts. Society itself is rebuilt on the flow of memory, fragile and unstable. Every decision—whether to keep, trade, or resist—reshapes both personal identity and the collective order. In this world, truth blurs, freedom bends, and the politics of memory decides the fate of all.
                </p>
            </section>
            <div className="w-px h-full border-3 border-cyan-400 mx-4" aria-hidden />
            <section className="flex-1 p-20 overflow-hidden">
                {/* 右侧内容 */}
                <div className="h-full w-full flex flex-col items-center justify-center gap-10">
                    <div className="w-100 h-100 bg-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center">
                        <span className="text-cyan-300 text-6xl text-center" >
                            <Link to="/screen/game">QR CODE</Link>
                        </span>
                    </div>
                    <p className="text-4xl text-cyan-300 text-center">
                            Waiting for players to join... (2/5)
                    </p>
                </div>
            </section>
        </div>
        );
    }
