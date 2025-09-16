import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
import Question from '../../components/dashboard/main/Queston';
import VotingOption from '../../components/dashboard/main/VotingOption';

const VotingPage = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [countdown, setCountdown] = useState(30);
  // const { gameId } = useParams();

  // const goHistoryPage = () => {
  //   navigate(`/game/${gameId}/history`);
  // };
  // const navigate = useNavigate();
  // 写死的数据，将来从后端获取
  const question = 'Memories is:';
  const votingOptions = ['a right', 'a resource', 'a responsibility', 'a trade'];

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);
  };

  return (
    <>
      <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-8">
        {/* 投票标题 */}
        <Question question={question} />
        {/* 倒计时显示 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-cyan-400 mb-4">
            <span className="text-3xl text-2xl font-bold text-cyan-200">
              {countdown}
            </span>
          </div>
        </div>


        {/* 投票选项 */}
        <div className="max-w-sm mx-auto w-full space-y-4">
          {votingOptions.map((option, index) => (
            <VotingOption
              key={index}
              option={option}
              isSelected={selectedOption === option}
              onClick={handleOptionSelect}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default VotingPage;