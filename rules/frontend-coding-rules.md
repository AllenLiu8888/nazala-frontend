# Frontend Coding Rules for NaZaLa Project

**IMPORTANT**: These rules MUST be followed by ALL AI coding tools including Claude Code, Cursor, GitHub Copilot, and any other AI assistants working on this codebase.

## Core Principles

### SOLID Principles (Adapted for React)

1. **Single Responsibility Principle (SRP)**
   - Each component should have one reason to change
   - Separate UI logic from business logic
   - One component per file (except small utility components)
   - Custom hooks should handle single concerns

2. **Open/Closed Principle (OCP)**
   - Components should be open for extension, closed for modification
   - Use composition over inheritance
   - Prefer HOCs or render props for extending functionality
   - Create reusable, configurable components

3. **Liskov Substitution Principle (LSP)**
   - Component props should be interchangeable with their interfaces
   - Maintain consistent prop contracts across similar components
   - Ensure component variants can replace base components

4. **Interface Segregation Principle (ISP)**
   - Don't force components to depend on props they don't use
   - Create specific prop interfaces for different use cases
   - Avoid massive prop objects with optional properties

5. **Dependency Inversion Principle (DIP)**
   - Depend on abstractions (contexts, hooks) not concretions
   - Use dependency injection through props and context
   - Abstract external dependencies (APIs, localStorage)

### DRY (Don't Repeat Yourself)

- Extract common logic into custom hooks
- Create reusable components for repeated UI patterns
- Use constants for repeated values
- Share utility functions across components
- Avoid duplicating API calls or data transformations

### KISS (Keep It Simple, Stupid)

- Prefer simple, explicit solutions over clever ones
- Avoid complex component hierarchies
- Use clear, descriptive naming
- Minimize conditional rendering complexity
- Keep functions and components focused and small

### Readability First

- Code should be self-documenting
- Use descriptive variable and function names
- Prefer explicit over implicit
- Structure code logically and consistently
- Write code for humans, not just computers

## React-Specific Rules

### Component Structure

```javascript
// ✅ CORRECT: Clear component structure
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { Button } from '../components/shared/Button';

const VotingPage = ({ gameId }) => {
  // 1. Hooks first
  const { game, submitChoice } = useGameContext();
  const [selectedOption, setSelectedOption] = useState(null);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [gameId]);

  // 3. Event handlers
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  // 4. Early returns for loading/error states
  if (!game) return <div>Loading...</div>;

  // 5. Main render
  return (
    <div className="voting-page">
      {/* Component JSX */}
    </div>
  );
};

export default VotingPage;
```

### Component Organization Rules

1. **File Naming**
   - PascalCase for component files: `VotingPage.jsx`
   - camelCase for utility files: `gameUtils.js`
   - kebab-case for CSS files: `voting-page.css`

2. **Directory Structure**
   ```
   components/
   ├── shared/          # Reusable components
   ├── dashboard/       # Feature-specific components
   │   ├── header/
   │   ├── main/
   │   └── footer/
   └── forms/          # Form-specific components
   ```

3. **Import Order**
   ```javascript
   // 1. React and external libraries
   import React from 'react';
   import { motion } from 'framer-motion';

   // 2. Internal utilities and hooks
   import { useGameContext } from '../hooks/useGameContext';
   import { gameApi } from '../services/gameApi';

   // 3. Components
   import { Button } from '../shared/Button';
   import { Chart } from './Chart';

   // 4. Styles (if any)
   import './VotingPage.scss';
   ```

### State Management Rules

1. **Local State First**
   ```javascript
   // ✅ CORRECT: Use local state for component-specific data
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);
   ```

2. **Context for Shared State**
   ```javascript
   // ✅ CORRECT: Use context for app-wide state
   const { game, updateGame } = useGameContext();
   ```

3. **Custom Hooks for Logic**
   ```javascript
   // ✅ CORRECT: Extract complex logic into custom hooks
   const useVoting = (gameId) => {
     const [votes, setVotes] = useState([]);
     const submitVote = useCallback((optionId) => {
       // Voting logic
     }, [gameId]);

     return { votes, submitVote };
   };
   ```

### Event Handling Rules

```javascript
// ✅ CORRECT: Clear event handlers
const handleSubmit = async (event) => {
  event.preventDefault();
  setIsLoading(true);

  try {
    await submitChoice(selectedOption);
    setSelectedOption(null);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// ❌ INCORRECT: Inline complex logic
<button onClick={(e) => {
  e.preventDefault();
  // Complex logic here
}}>
```

### API Integration Rules

1. **Use Service Layer**
   ```javascript
   // ✅ CORRECT: Use gameApi service
   const data = await gameApi.getCurrentGame();

   // ❌ INCORRECT: Direct fetch calls in components
   const response = await fetch('/api/game/current/');
   ```

2. **Error Handling**
   ```javascript
   // ✅ CORRECT: Consistent error handling
   try {
     const result = await gameApi.submitChoice(optionId);
     return result;
   } catch (error) {
     console.error('Failed to submit choice:', error);
     throw new Error(`Vote submission failed: ${error.message}`);
   }
   ```

3. **Loading States**
   ```javascript
   // ✅ CORRECT: Handle loading states
   const [isLoading, setIsLoading] = useState(false);

   const fetchData = async () => {
     setIsLoading(true);
     try {
       const data = await gameApi.getCurrentGame();
       setGame(data);
     } finally {
       setIsLoading(false);
     }
   };
   ```

## Styling Rules

### CSS Class Organization

```javascript
// ✅ CORRECT: Descriptive, BEM-style classes
<div className="voting-page">
  <div className="voting-page__header">
    <h1 className="voting-page__title">Round {game.currentRound}</h1>
  </div>
  <div className="voting-page__options">
    {options.map(option => (
      <button
        key={option.id}
        className={`voting-option ${isSelected ? 'voting-option--selected' : ''}`}
      >
        {option.text}
      </button>
    ))}
  </div>
</div>
```

### Tailwind CSS Rules

```javascript
// ✅ CORRECT: Logical grouping of Tailwind classes
className="flex flex-col items-center justify-center
           w-full h-screen p-4
           bg-gray-900 text-white
           hover:bg-gray-800 transition-colors"

// ❌ INCORRECT: Random order, hard to read
className="p-4 hover:bg-gray-800 text-white bg-gray-900 w-full transition-colors justify-center h-screen flex-col items-center flex"
```

## Performance Rules

### Component Optimization

```javascript
// ✅ CORRECT: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return processLargeDataSet(gameData);
}, [gameData]);

// ✅ CORRECT: Memoize components with stable props
const MemoizedChart = React.memo(Chart);

// ✅ CORRECT: Optimize re-renders
const handleClick = useCallback((id) => {
  setSelectedOption(id);
}, []);
```

### Conditional Rendering

```javascript
// ✅ CORRECT: Early returns for different states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!game) return <EmptyState />;

return <GameInterface game={game} />;

// ❌ INCORRECT: Nested ternary operators
return (
  <div>
    {isLoading ? (
      <LoadingSpinner />
    ) : error ? (
      <ErrorMessage error={error} />
    ) : !game ? (
      <EmptyState />
    ) : (
      <GameInterface game={game} />
    )}
  </div>
);
```

## Error Handling Rules

### Component Error Boundaries

```javascript
// ✅ CORRECT: Wrap risky components in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <ChartComponent data={complexData} />
</ErrorBoundary>
```

### Graceful Degradation

```javascript
// ✅ CORRECT: Provide fallbacks for optional features
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      const ws = new WebSocket(url);
      setSocket(ws);
      setIsConnected(true);
    } catch (error) {
      console.warn('WebSocket not available, falling back to polling');
      setIsConnected(false);
    }
  }, [url]);

  return { socket, isConnected };
};
```

## Accessibility Rules

### Semantic HTML

```javascript
// ✅ CORRECT: Use semantic elements
<main className="game-dashboard">
  <header className="dashboard-header">
    <h1>Game Dashboard</h1>
  </header>
  <section className="game-controls">
    <button aria-label="Start new game">Start Game</button>
  </section>
</main>

// ❌ INCORRECT: Generic divs everywhere
<div className="game-dashboard">
  <div className="dashboard-header">
    <div>Game Dashboard</div>
  </div>
</div>
```

### ARIA Labels

```javascript
// ✅ CORRECT: Provide proper ARIA labels
<button
  aria-label={`Select option ${option.number}: ${option.text}`}
  aria-pressed={isSelected}
  onClick={() => handleSelect(option.id)}
>
  {option.text}
</button>
```

## Testing Guidelines

### Component Testing

```javascript
// ✅ CORRECT: Test component behavior, not implementation
import { render, screen, fireEvent } from '@testing-library/react';
import VotingPage from './VotingPage';

test('allows user to select voting option', () => {
  render(<VotingPage options={mockOptions} />);

  const option1 = screen.getByText('Option 1');
  fireEvent.click(option1);

  expect(option1).toHaveAttribute('aria-pressed', 'true');
});
```

## Documentation Rules

### Component Documentation

```javascript
/**
 * VotingPage - Displays voting options for the current game round
 *
 * @param {string} gameId - The current game identifier
 * @param {Function} onVoteSubmit - Callback when vote is submitted
 * @param {boolean} isDisabled - Whether voting is currently disabled
 *
 * @example
 * <VotingPage
 *   gameId="game-123"
 *   onVoteSubmit={handleVoteSubmit}
 *   isDisabled={false}
 * />
 */
const VotingPage = ({ gameId, onVoteSubmit, isDisabled }) => {
  // Component implementation
};
```

### Code Comments

```javascript
// ✅ CORRECT: Explain WHY, not WHAT
// Debounce user input to avoid excessive API calls during typing
const debouncedSearch = useCallback(
  debounce((query) => searchGames(query), 300),
  []
);

// ❌ INCORRECT: Comments that restate the code
// Set loading to true
setIsLoading(true);
```

## Security Rules

### Input Validation

```javascript
// ✅ CORRECT: Validate and sanitize inputs
const sanitizeDisplayName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name.trim().slice(0, 50); // Limit length
};

// ✅ CORRECT: Escape user content
const SafeUserContent = ({ content }) => (
  <div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(content)
  }} />
);
```

### Environment Variables

```javascript
// ✅ CORRECT: Use environment variables for configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ❌ INCORRECT: Hard-coded URLs
const API_BASE_URL = 'http://127.0.0.1:8000';
```

## Git Commit Rules

### Commit Messages

```bash
# ✅ CORRECT: Clear, descriptive commit messages
feat(voting): add real-time vote synchronization
fix(dashboard): resolve chart rendering performance issue
refactor(api): extract game service into separate module
docs(readme): update installation instructions

# ❌ INCORRECT: Vague commit messages
update files
fix bug
changes
```

### Branch Naming

```bash
# ✅ CORRECT: Descriptive branch names
feature/voting-real-time-sync
fix/dashboard-chart-performance
refactor/api-service-extraction
hotfix/security-vulnerability

# ❌ INCORRECT: Unclear branch names
feature
fix-stuff
updates
```

## Code Review Checklist

Before submitting code, ensure:

- [ ] All functions and components follow single responsibility principle
- [ ] No code duplication (DRY principle applied)
- [ ] Solution is simple and straightforward (KISS principle)
- [ ] Code is readable and self-documenting
- [ ] Proper error handling is implemented
- [ ] Component is accessible (ARIA labels, semantic HTML)
- [ ] Performance optimizations are applied where needed
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Environment variables are used for configuration
- [ ] Proper TypeScript types are used (if applicable)

## AI Tool Integration

### For Claude Code
- Follow these rules in every code generation
- Reference specific rule sections when making suggestions
- Explain which principles are being applied

### For Cursor
- Use these rules as context for code completion
- Apply formatting and structure guidelines automatically
- Suggest refactoring based on these principles

### For GitHub Copilot
- Generate code that adheres to these patterns
- Provide suggestions that follow the established architecture
- Maintain consistency with existing codebase patterns

---

## 中文注释规则 (Chinese Comment Requirements)

### 文件修改注释规范

每个被修改的页面和组件都必须在文件顶部添加中文注释，说明修改内容和时间：

```javascript
/*
 * 修改日期: 2024-XX-XX
 * 修改内容: [简述本次修改的主要变更]
 * 修改原因: [说明为什么需要这样修改]
 * 影响范围: [列出受影响的功能或组件]
 *
 * 例如:
 * 修改日期: 2024-09-17
 * 修改内容: 将静态数据替换为API调用，连接后端游戏数据
 * 修改原因: 从静态UI转为动态数据驱动的应用
 * 影响范围: 游戏状态显示、实时数据更新、用户交互
 */
```

### 注释规则
1. **必须使用中文注释** - 便于团队理解修改内容
2. **每次修改都要更新注释** - 保持注释的时效性
3. **注释要具体明确** - 避免模糊的描述
4. **包含修改日期** - 便于版本追踪
5. **说明影响范围** - 帮助其他开发者理解变更影响
6. **整体修改注释** - 每个页面要有完整的修改说明，便于后续一次性删除检查

### 注释位置
- **文件级注释**: 放在文件最顶部，import语句之前
- **函数级注释**: 重要修改的函数上方
- **代码行注释**: 复杂逻辑或重要变更旁边
- **整体修改标记**: 在修改的代码块前后加上 `/* === 修改开始 === */` 和 `/* === 修改结束 === */`

### 完整示例
```javascript
/*
 * 修改日期: 2024-09-17
 * 修改内容: 添加GameProvider轮询机制，实现每1秒数据同步
 * 修改原因: 需要实时更新游戏状态和玩家投票进度
 * 影响范围: 所有使用游戏数据的组件都会自动更新
 *
 * 整体修改说明:
 * 1. 将静态数据替换为API调用
 * 2. 添加实时轮询机制
 * 3. 添加错误处理和loading状态
 * 4. 保持原有UI样式不变
 */

import React, { useState, useEffect } from 'react';
import { gameApi } from '../services/gameApi';

const GameProvider = ({ children }) => {
  // 原有代码...

  /* === 修改开始 === */
  // 新增：每1秒轮询游戏状态
  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentGame();
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  /* === 修改结束 === */
};
```

### 后端数据管理规则

#### 测试数据添加权限
- **后端路径**: `/Users/allen/workspace/nazala_backend`
- **数据库操作**: 允许添加测试数据到Django数据库
- **测试数据类型**: Game对象、Player对象、Turn对象、Option对象
- **添加方式**:
  - 通过Django Admin界面
  - 通过API调用创建
  - 通过Django shell命令
- **数据清理**: 集成完成后清理测试数据

#### 后端数据库操作示例
```bash
# 进入后端目录并激活环境
cd /Users/allen/workspace/nazala_backend
source venv/bin/activate

# 创建测试数据的方法
python manage.py shell
>>> from nazala_backend_api.models import Game, Player, Turn, Option
>>> game = Game.create_new(max_turns=10)
>>> player = game.create_new_player()
>>> turn = game.create_new_turn()
```

**Remember**: These rules are not just suggestions—they are requirements for maintaining code quality, team collaboration, and project success. Every AI tool working on this project must enforce these standards consistently.