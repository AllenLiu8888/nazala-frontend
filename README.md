# NaZaLa Frontend

NaZaLa is a multiplayer turn-based game exploring the social and ethical implications of memory technology. Players make collective decisions that shape four world attributes across 10 rounds, experiencing how biotechnology choices affect society through an immersive, collaborative gameplay experience.

## 🎮 Project Overview

### Core Concept
- **Memory Technology Ethics**: Players navigate scenarios involving "memory-editable, tradable technology"
- **Collective Decision Making**: Multiple players influence shared world outcomes
- **Dual-Screen Experience**: Large screen for visualization + mobile devices for individual choices
- **AI-Generated Content**: Dynamic scenarios powered by local LLM + RAG system

### Game Flow
1. **Setup**: Admin starts game on large screen, displays QR code
2. **Join**: Players scan QR code to join on mobile devices
3. **Gameplay**: 10 rounds of decision-making with real-time attribute visualization
4. **Decisions**: Each choice affects four world attributes with immediate visual feedback
5. **Reflection**: Historical timeline allows players to trace decision impacts

### Four World Attributes
- **Memory Equality** (记忆平等)
- **Technical Control** (技术控制)
- **Society Cohesion** (社会凝聚力)
- **Autonomy Control** (自主控制)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on `http://127.0.0.1:8000`

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Environment Setup
Create `.env` file:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 📱 User Interfaces

### Large Screen (Admin/Host)
- **HomePage** (`/` or `/screen/home`) - Game lobby and setup
- **GameIntro** (`/screen/intro`) - Introduction and QR code display
- **GameDashboard** (`/screen/game`) - Real-time game visualization with radar charts
- **GameOver** (`/screen/gameover`) - Final results and world state

### Mobile (Players)
- **WaitingPage** (`/game/:gameId/waiting`) - Join game and wait for others
- **VotingPage** (`/game/:gameId/voting`) - Make choices during each round
- **History** (`/game/:gameId/history`) - View past decisions and their impacts

### Navigation Flow
```
Large Screen: intro → (QR scan) → dashboard → gameover
Mobile: scan QR → waiting → voting ↔ history
```

## 🛠 Tech Stack

### Core Framework
- **React 19** - Modern hooks-based components
- **Vite 7** - Fast development and build tooling
- **React Router 7** - Client-side routing

### Styling & UI
- **TailwindCSS 4** - Utility-first CSS framework
- **Sass** - CSS preprocessing
- **Framer Motion** - Smooth animations

### Data Visualization
- **ApexCharts** - Interactive radar charts for world attributes
- **Recharts** - Additional chart components
- **React Circular Progressbar** - Round progress indicators

### Communication
- **Axios** - HTTP client for API calls
- **Socket.io-client** - Real-time WebSocket communication
- **QRCode.react** - QR code generation

### State Management
- **React Context** - Global game state
- **Zustand** - Lightweight state management
- **Custom hooks** - Reusable state logic

## 🏗 Architecture

### Project Structure
```
src/
├── components/          # UI components
│   ├── dashboard/       # Game visualization components
│   │   ├── header/      # Round info, world status
│   │   ├── main/        # Charts, voting options, story
│   │   └── footer/      # Progress, user states
│   └── shared/          # Reusable components
├── pages/               # Route components
│   ├── screen/          # Large screen interfaces
│   └── mobile/          # Mobile player interfaces
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── services/            # API layer
│   ├── http.js          # HTTP client setup
│   ├── gameApi.js       # Game API endpoints
│   └── API_Documentation.md
├── constants/           # Game configuration
└── styles/              # Global styles
```

### State Management Pattern
```javascript
// GameProvider wraps entire app
<GameProvider>
  <App>
    <RouterProvider router={router} />
  </App>
</GameProvider>

// Components access game state via context
const { game, loading, getCurrentGame } = useGameContext();
```

### API Integration Pattern
```javascript
// Standard async pattern used throughout
try {
  const data = await gameApi.getCurrentGame();
  setGame(data.game);
} catch (error) {
  setError(error.message);
}
```

## 🔧 Development Guidelines

### Code Style
- **Functional Components**: Modern React patterns with hooks
- **ESLint**: Configured with React hooks rules
- **Mixed Languages**: Chinese/English comments throughout codebase
- **No TypeScript**: Plain JavaScript with .jsx extensions

### Component Organization
- **dashboard/**: Large screen visualization components
- **mobile/**: Player-specific mobile interfaces
- **shared/**: Reusable components across interfaces
- **Atomic Design**: Components organized by complexity and reusability

### API Authentication
```javascript
// Bearer token authentication
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 🎯 Game Development Features

### Real-time Synchronization
- **WebSocket Events**: Player joins, choices, round transitions
- **Polling Fallback**: Regular API calls for state synchronization
- **State Reconciliation**: Handle out-of-order events gracefully

### Responsive Design
- **Mobile-First**: Touch-optimized interfaces for players
- **Large Screen Optimization**: Data visualization and group viewing
- **Cross-Device Sync**: Real-time updates across all connected devices

### Accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full functionality without mouse
- **Color Contrast**: WCAG compliant color schemes
- **Mobile Accessibility**: Touch targets and gesture support

## 🔍 Testing Strategy

### Frontend Testing
```bash
# Component testing
npm run test

# E2E testing
npm run test:e2e

# Visual regression testing
npm run test:visual
```

### Integration Testing
- **API Integration**: Mock backend responses during development
- **Real-time Features**: WebSocket connection testing
- **Multi-device**: Cross-browser and device compatibility

## 📈 Performance Optimization

### Bundle Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Remove unused dependencies
- **Asset Optimization**: Image compression and lazy loading

### Runtime Performance
- **React Optimization**: Memoization and lazy loading
- **Chart Performance**: Canvas-based rendering for smooth animations
- **WebSocket Efficiency**: Debounced updates and connection pooling

## 🔐 Security Considerations

### Data Protection
- **Token Management**: Secure storage and automatic refresh
- **Input Validation**: Client-side validation with server verification
- **CORS Configuration**: Proper cross-origin request handling

### Privacy Compliance
- **Fictional Disclaimer**: Clear indication of simulated scenarios
- **Data Minimization**: Only collect necessary game state data
- **Session Management**: Automatic cleanup of player sessions

## 🚧 Known Issues & Roadmap

### Current Limitations
- **Device Performance**: Heavy visualization may lag on older devices
- **Network Reliability**: Limited offline functionality
- **Scalability**: Current architecture supports ~20 concurrent players

### Future Enhancements
- **Progressive Web App**: Offline capability and app-like experience
- **Enhanced Analytics**: Detailed decision-making insights
- **Accessibility Improvements**: Better screen reader support
- **Performance Optimization**: Lighter bundle and faster loading

## 📚 Additional Resources

- **API Documentation**: `src/services/API_Documentation.md`
- **Claude Code Guide**: `CLAUDE.md`
- **Design Assets**: Contact team for Figma access
- **Backend Repository**: [Link to backend repo]

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `setup`
2. Implement changes following code style guidelines
3. Test on both large screen and mobile interfaces
4. Submit PR with detailed description
5. Code review and merge

### Team Communication
- **Jira**: Task management and sprint planning
- **Slack**: Daily communication and updates
- **GitHub**: Code review and technical discussions
- **Weekly Meetings**: Saturday 1:00 PM progress sync

## 📄 License

This project is part of an educational research initiative exploring biotechnology ethics and social decision-making through interactive media.