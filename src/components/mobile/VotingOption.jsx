// 投票选项组件
// 接收完整的 option 对象：{ id, text, display_number, attrs: [{ name, value|vaLue }] }
const VotingOption = ({ option, isSelected, onClick }) => {
  const attrs = Array.isArray(option?.attrs) ? option.attrs : [];

  // 将后端名称映射为缩写，并确保固定顺序显示
  const nameToAbbr = {
    MemoryEquity: 'ME',
    TechnologicalControl: 'TC',
    SocialCohesion: 'SC',
    PersonalAgency: 'PA',
  };

  const desiredOrder = ['MemoryEquity', 'TechnologicalControl', 'SocialCohesion', 'PersonalAgency'];

  const attrMap = attrs.reduce((acc, a) => {
    const val = Number(a?.value ?? a?.vaLue ?? 0) || 0;
    if (a?.name) acc[a.name] = val;
    return acc;
  }, {});

  // 检查是否所有 attrs 的 value 都是 0
  const allValuesZero = desiredOrder.every(key => {
    const val = Number(attrMap[key] ?? 0);
    return val === 0;
  });

  const letter = (() => {
    const dn = Number(option?.display_number);
    if (!Number.isFinite(dn)) return '';
    return String.fromCharCode(64 + dn); // 1->A, 2->B ...
  })();

  return (
    <button
      onClick={() => onClick(option)}
      className="w-full option-padding-responsive mb-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 bg-transparent border-cyan-400 text-left"
      style={{
        color: '#03FFFF',
        backgroundColor: isSelected ? '#1F9EB6' : 'transparent'
      }}
    >
      <div className="text-responsive-option font-semibold mb-2 break-words whitespace-pre-wrap">
        {letter ? `${letter}. ` : ''}{option?.text ?? ''}
      </div>
      {!allValuesZero && (
        <div className="flex flex-wrap gap-2 text-responsive-badge">
          {desiredOrder.map((key) => {
            const abbr = nameToAbbr[key];
            const val = Number(attrMap[key] ?? 0);
            const sign = val > 0 ? `+${val}` : `${val}`; // 保留负号
            const positive = val >= 0;
            return (
              <span
                key={key}
                className="badge-padding-responsive rounded border"
                style={{
                  borderColor: positive ? '#22c55e' : '#ef4444',
                  color: positive ? '#22c55e' : '#ef4444',
                }}
              >
                {abbr} {sign}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
};

export default VotingOption;
