import Sidebaradmin from '../components/sidebaradmin';
import { Outlet } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebaradmin />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
