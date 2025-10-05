// 投票标题组件（自适应字体大小）
const Question = ({ question = "Memories is:", onClick }) => {
    return (
        <div className="text-center mb-8">
            <h1 className="text-responsive-title font-bold text-cyan-400 mb-2 px-2">
                {question}
            </h1>
        </div>
    );
};

  export default Question;