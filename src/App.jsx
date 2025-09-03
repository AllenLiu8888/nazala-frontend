import { Outlet } from 'react-router-dom';
// import { Outlet, useLoaderData } from 'react-router-dom';

// export async function loader() {
//   return {
//     return fetch('/api/games');
//   }
// }


function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <Outlet />
    </div>
  );
}

export default App