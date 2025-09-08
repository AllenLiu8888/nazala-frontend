import { Outlet } from 'react-router-dom';
import { GameProvider } from './context/GameProvider';
// import { Outlet, useLoaderData } from 'react-router-dom';

// export async function loader() {
//   return {
//     return fetch('/api/games');
//   }
// }


// function App() {
//   return (
//     <div className="h-screen bg-gradient-to-br from-gray-900 to-black">
//       <Outlet />
//     </div>
//   );
// }

const bgImage = "bg-[url(https://res.cloudinary.com/dd9dbngmy/image/upload/v1757131038/screen_ymm9yw.svg)]"; {/*bg-gradient-to-br from-gray-900 to-black*/} {/*bg-black/60 bg-blend-multiply 来显示bgImage的透明度*/}

function App() {
  return (
    <GameProvider>
      <div className={`fixed inset-0 box-border overflow-hidden ${bgImage} bg-center bg-black/60 bg-blend-multiply bg-cover`}>
            <Outlet />
      </div>
    </GameProvider>
  );
}


export default App