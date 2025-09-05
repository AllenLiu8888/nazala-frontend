import { Outlet } from 'react-router-dom';
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

function App() {
  return (
    <div className="fixed inset-0 box-border overflow-hidden bg-gradient-to-br from-gray-900 to-black p-6">
          <Outlet />
    </div>
  );
}


export default App