import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStoreScreen from '../../store/index_screen';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const GameReflection = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameState = useGameStoreScreen(s => s.gameMeta.state);
    const maxRounds = useGameStoreScreen(s => s.gameMeta.maxRounds);
    const playersTotal = useGameStoreScreen(s => s.players.total);
    const playersVoted = useGameStoreScreen(s => s.players.voted);
    const turnIndex = useGameStoreScreen(s => s.turn.index);

    // 启动轮询
    useEffect(() => {
        if (gameId) {
            useGameStoreScreen.getState().startPollingForDashboard(gameId);
        }
        return () => {
            useGameStoreScreen.getState().stopDashboardPolling();
        };
    }, [gameId]);

    // 监听投票完成：当所有玩家在当前回合完成投票
    // - 若非最后一轮：仅提交当前回合
    // - 若为最后一轮：先提交当前回合，再结束游戏（最后一轮 = maxRounds - 1）
    useEffect(() => {
        if (playersVoted == playersTotal && playersTotal > 0) {
            useGameStoreScreen.getState().submitCurrentTurn();
            const lastIndex = (typeof maxRounds === 'number' && maxRounds > 0) ? (maxRounds - 1) : null;
            if (lastIndex !== null && turnIndex == lastIndex) {
                useGameStoreScreen.getState().finishGame();
            }
        }
    }, [playersVoted, playersTotal, turnIndex, maxRounds]);

    // 监听游戏状态，finished/archived 时自动跳转到 gameover
    useEffect(() => {
        if (gameState === 'finished' || gameState === 'archived') {
            navigate(`/game/${gameId}/gameover`);
        }
    }, [gameState, gameId, navigate]);

    const reflectionContent1 = "After going through the entire journey, "
    const reflectionContent2 = "do you still hold the same views as you did at the beginning?"

    const [firstLineDone, setFirstLineDone] = useState(false);
    const [secondLineDone, setSecondLineDone] = useState(false);

    const TypewriterLine = ({ content, typeSpeed = 10, onDone }) => {
        const words = useMemo(() => [content || ''], [content]);
        const [text, helper] = useTypewriter({
            words,
            typeSpeed,
            deleteSpeed: 0,
            delaySpeed: 0,
            loop: 1
        });
        const { isDone } = helper;
        const doneCalledRef = useRef(false);

        useEffect(() => {
            if (isDone && !doneCalledRef.current) {
                doneCalledRef.current = true;
                onDone && onDone();
            }
        }, [isDone, onDone]);
        return (
            <>
                <span>{text}</span>
                {!isDone && (
                    <Cursor cursorStyle="▍" cursorColor="rgba(255, 255, 255, 1)" />
                )}
            </>
        );
    };
    return (
        <div className="h-full w-full flex items-center justify-center flex-col px-40 py-10">
            <h1 className="text-9xl font-pixel text-cyan-300">Reflection</h1>
            <div className="flex flex-col items-center justify-center py-20 pb-30">
                <p className="font-pixel text-cyan-300 text-6xl mt-10">
                    {!firstLineDone ? (
                        <TypewriterLine
                            key={`r1-${reflectionContent1.length}`}
                            content={reflectionContent1}
                            typeSpeed={60}
                            onDone={() => setFirstLineDone(true)}
                        />
                    ) : (
                        <span>{reflectionContent1}</span>
                    )}
                </p>
                {firstLineDone && (
                    <p className="font-pixel text-cyan-300 text-6xl mt-10">
                        {!secondLineDone ? (
                            <TypewriterLine
                                key={`r2-${reflectionContent2.length}`}
                                content={reflectionContent2}
                                typeSpeed={70}
                                onDone={() => setSecondLineDone(true)}
                            />
                        ) : (
                            <span>{reflectionContent2}</span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

export default GameReflection;

