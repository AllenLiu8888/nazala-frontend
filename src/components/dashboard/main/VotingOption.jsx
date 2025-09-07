// 投票选项组件
const VotingOption = ({ option, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(option)}
      className="w-full p-4 mb-4 rounded-xl border-2 text-xl font-medium transition-all duration-200 transform hover:scale-105 bg-transparent border-cyan-400"
      style={{
        color: '#03FFFF',
        backgroundColor: isSelected ? '#1F9EB6' : 'transparent'
      }}
    >
      {option}
    </button>
  );
};

export default VotingOption;
