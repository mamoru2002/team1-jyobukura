import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      {children}
    </div>
  );
};

export default Layout;
