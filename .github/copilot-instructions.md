# GitHub Copilot Instructions for NaZaLa Frontend

## Primary Rules Reference
**MANDATORY**: Read and follow ALL rules in `rules/frontend-coding-rules.md` before any code generation.

## Core Development Principles

### SOLID Principles (React Context)
- **Single Responsibility**: One component, one purpose
- **Open/Closed**: Extend via composition, not modification
- **Liskov Substitution**: Consistent prop interfaces
- **Interface Segregation**: Specific prop contracts
- **Dependency Inversion**: Use contexts and hooks, not direct dependencies

### DRY (Don't Repeat Yourself)
- Extract repeated UI patterns into components
- Create custom hooks for shared logic
- Use constants for repeated values
- Share utility functions across modules

### KISS (Keep It Simple, Stupid)
- Prefer explicit over clever solutions
- Avoid complex component hierarchies
- Use clear, descriptive naming
- Keep functions focused and small

### Readability First
- Self-documenting code
- Descriptive variable names
- Logical code structure
- Human-readable over computer-optimized

## React Component Patterns

### Standard Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../hooks/useGameContext';

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks
  const { game } = useGameContext();
  const [localState, setLocalState] = useState(null);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 3. Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // 4. Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // 5. Main render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Custom Hooks Pattern
```javascript
const useFeatureName = (dependencies) => {
  const [state, setState] = useState(initialState);

  const action = useCallback(async (params) => {
    try {
      // Action logic
    } catch (error) {
      // Error handling
    }
  }, [dependencies]);

  return { state, action };
};
```

## Code Generation Guidelines

### Component Creation
1. Check existing components for similar patterns
2. Follow the exact structure from `rules/frontend-coding-rules.md`
3. Include proper error handling and loading states
4. Add accessibility attributes
5. Use established design patterns

### API Integration
```javascript
// Always use service layer
const data = await gameApi.methodName(params);

// Include error handling
try {
  const result = await gameApi.action(data);
  // Success handling
} catch (error) {
  console.error('Operation failed:', error);
  // User-friendly error handling
}
```

### State Management
```javascript
// Local state for component-specific data
const [isVisible, setIsVisible] = useState(false);

// Context for shared app state
const { game, updateGame } = useGameContext();

// Custom hooks for complex logic
const { votes, submitVote, isLoading } = useVoting(gameId);
```

## Performance Optimization

### Memoization Patterns
```javascript
// Expensive calculations
const processedData = useMemo(() => {
  return expensiveFunction(rawData);
}, [rawData]);

// Event handlers
const handleClick = useCallback((id) => {
  onSelect(id);
}, [onSelect]);

// Component memoization
const MemoizedComponent = React.memo(ExpensiveComponent);
```

### Conditional Rendering
```javascript
// Prefer early returns over nested ternaries
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

## Styling Guidelines

### Tailwind CSS Organization
```javascript
// Group classes logically: layout, spacing, colors, states
className="flex flex-col items-center
           w-full h-screen p-4
           bg-gray-900 text-white
           hover:bg-gray-800 transition-colors"
```

### Component Styling
```javascript
// Use descriptive class names
<div className="voting-page">
  <div className="voting-page__header">
    <h1 className="voting-page__title">Title</h1>
  </div>
  <div className="voting-page__content">
    {/* Content */}
  </div>
</div>
```

## Error Handling Standards

### Async Operations
```javascript
const fetchData = async () => {
  setIsLoading(true);
  try {
    const data = await gameApi.getData();
    setData(data);
  } catch (error) {
    setError(error.message);
    console.error('Failed to fetch data:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Component Error Boundaries
```javascript
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

## Accessibility Requirements

### Semantic HTML
```javascript
<main className="app-main">
  <header className="app-header">
    <h1>Page Title</h1>
  </header>
  <section className="content-section">
    <button aria-label="Descriptive action">Action</button>
  </section>
</main>
```

### Interactive Elements
```javascript
<button
  aria-label={`Select ${option.text}`}
  aria-pressed={isSelected}
  onClick={handleSelect}
>
  {option.text}
</button>
```

## Project Context

### NaZaLa Game Features
- Multiplayer biotechnology ethics education
- 10-round decision-making gameplay
- Dual-screen experience (large screen + mobile)
- Real-time synchronization
- Four world attributes: Memory Equality, Technical Control, Society Cohesion, Autonomy Control

### Technology Stack
- React 19 + Vite
- TailwindCSS 4 + Sass
- Socket.io-client for real-time features
- ApexCharts/Recharts for visualizations
- React Router 7 for navigation

### File Structure
```
src/
├── components/
│   ├── dashboard/    # Large screen components
│   ├── shared/       # Reusable components
├── pages/
│   ├── screen/       # Large screen pages
│   ├── mobile/       # Mobile player pages
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── services/         # API layer
└── constants/        # Configuration
```

## Code Quality Checklist

Before suggesting code completion:
- [ ] Follows SOLID principles
- [ ] No code duplication (DRY)
- [ ] Simple and straightforward (KISS)
- [ ] Readable and self-documenting
- [ ] Includes proper error handling
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] Follows established patterns
- [ ] Uses service layer for API calls
- [ ] Includes loading states

## Integration Notes

### Multi-AI Tool Environment
This project uses multiple AI coding tools:
- Claude Code (primary)
- Cursor AI
- GitHub Copilot (this tool)

### Consistency Requirements
- All tools must follow the same rules in `rules/frontend-coding-rules.md`
- Maintain consistent code style across the codebase
- Follow established architectural patterns
- Use existing components and utilities

**CRITICAL**: Every suggestion must align with the comprehensive coding standards defined in the rules file to ensure team consistency and code quality.