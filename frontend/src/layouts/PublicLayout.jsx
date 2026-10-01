import '../styles/auth.css';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  );
}
