const HistoricalHorizontal = ({ decisions }) => {
  return (
    <div className="flex space-x-4 pb-4 px-4" style={{ width: `${decisions.length * 200}px` }}>
      {decisions.map((decision, index) => (
        <div
          key={index}
          className="flex-shrink-0 p-4 border-2 rounded-xl text-center"
          style={{ 
            borderColor: '#03FFFF',
            color: '#03FFFF',
            width: '180px',
            minWidth: '180px'
          }}
        >
          {decision}
        </div>
      ))}
    </div>
  );
};

export default HistoricalHorizontal;