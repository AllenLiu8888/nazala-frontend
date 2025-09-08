# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


WaitingPage：
After players scan the QR code, wait for other players to join the game.
http://localhost:5173/game/demo-game/waiting

VotingPage：
Player selection phase
http://localhost:5173/game/demo-game/voting

History：
Players can view their past choices here
http://localhost:5173/game/demo-game/history

移动端页面切换说明：
进入http://localhost:****/screen/intro之后
点击标题“NAVIGATING THE FUTURE OF MEMORY" 
->进入WaitingPage.jsx
->点击“waiting for players to join..."
->进入VotingPage.jsx
->点击最上面的问题，可能是“Memories is：”
->进入History.jsx