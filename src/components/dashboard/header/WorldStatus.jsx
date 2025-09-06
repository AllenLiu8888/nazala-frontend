import { useNavigate } from 'react-router-dom';
const WorldStatus = () => {
    const worldStatus = "World Status";
    
    const GoToGameOver = () => {
        navigate('/screen/gameover');
    }
    const navigate = useNavigate();
    return (
        <div className="flex-1 flex gap-4 p-8 text-right">
            <h1 className="pixel-text" onClick={GoToGameOver}>World Status: {worldStatus}</h1>
        </div>
    );
};

export default WorldStatus;