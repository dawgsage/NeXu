import { useState, useEffect } from 'react';
import AdminLogin from '@/admin/AdminLogin';
import AdminDashboard from '@/admin/AdminDashboard';

type Props = {
  onExit: () => void;
};

export default function AdminApp({ onExit }: Props) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem('nexu_admin') === '1');
  }, []);

  if (!authed) {
    return <AdminLogin onUnlock={() => setAuthed(true)} onBack={onExit} />;
  }
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem('nexu_admin'); setAuthed(false); }} />;
}
