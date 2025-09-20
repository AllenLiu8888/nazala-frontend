// 投票标题组件
const Question = ({ question = "Memories is:", onClick }) => {
    return (
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">
                {question}
            </h1>
        </div>
    );
};

  export default Question;