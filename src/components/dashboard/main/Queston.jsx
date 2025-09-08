import { useNavigate } from 'react-router-dom';

// 投票标题组件
const Question = ({ question = "Memories is:", onClick }) => {
    const navigate = useNavigate();
    
    const goHistoryPage = () => {
        const gameId = 'demo-game';
        navigate(`/game/${gameId}/history`);
    };
    
    return (
        <div className="text-center mb-12">
            <h1 
                className="text-3xl font-bold text-cyan-400 mb-2 cursor-pointer hover:text-cyan-300 transition-colors duration-200"
                onClick={goHistoryPage}
            >
                {question}
            </h1>
        </div>
    );
};

  export default Question;