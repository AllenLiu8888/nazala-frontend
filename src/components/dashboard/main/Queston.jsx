// 投票标题组件
const Question = ({ question = "Memories is:" }) => {
    // 使用传入的question prop，如果没有传入则使用默认值
    // 将来可以从后端获取: const question = props.question || "Memories is:";
    
    return (
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          {question}
        </h1>
      </div>
    );
  };

  export default Question;