import { useParams } from 'react-router-dom';
import RadarChart from '../../components/dashboard/main/RadarChart';
import HistoricalHorizontal from '../../components/dashboard/main/HistoricalHorizontal';

const HistoryPage = () => {
  const { gameId } = useParams();

  const decisions = [
    "The first choice",
    "The second choice",
    "The third choice",
    "The fourth choice",
    "The fifth choice",
    "The sixth choice",
    "The seventh choice",
    "The eighth choice",
    "The ninth choice",
    "The tenth choice"
  ];

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#03FFFF' }}>
              Your Memory Future
            </h1>
            <h2 className="text-3xl font-bold" style={{ color: '#03FFFF' }}>
              Your Decision
            </h2>
          </div>

          {/* 雷达图组件 */}
          <div className="w-full max-w-sm mb-8 p-4 border-2 rounded-2xl" style={{ borderColor: '#03FFFF' }}>
            <div className="w-full h-64 overflow-hidden">
              <div style={{ transform: 'scale(0.6)', transformOrigin: 'center', width: '166%', height: '166%', marginLeft: '-33%', marginTop: '-33%' }}>
                <RadarChart />
              </div>
            </div>
          </div>

          {/* 历史决策按钮 - 横向滑动 */}
          <div className="w-full overflow-x-scroll overflow-y-hidden" style={{ maxWidth: '100vw' }}>
            <HistoricalHorizontal decisions={decisions} />  
          </div>

        </div>
      </div>  
    </>
  );
};

export default HistoryPage;