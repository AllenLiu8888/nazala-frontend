// import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const WaitingPage = () => {
  // const [playerCount, setPlayerCount] = useState(0);
  // const [totalPlayers, setTotalPlayers] = useState(3);
  const { gameId } = useParams();

  const goVotingPage = () => {
    navigate(`/game/${gameId}/voting`); //点击标题跳转到手机投票页面（之后可删）
  };
  const navigate = useNavigate();


  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
          {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* 双层旋转 */}
        <div className="relative w-16 h-16 mb-12"> 
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-cyan-300" ></div> 

          <div className="animate-spin rounded-full h-12 w-12 border-2 border-b-transparent absolute top-2 left-2 border-cyan-300" ></div> 

        </div>

           {/* 等待文字 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-cyan-300" 
              onClick={goVotingPage}//点击标题跳转到手机投票页面（之后可删）
            >
              Waiting for players to join... {/* ({playerCount}/{totalPlayers}) */}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitingPage;