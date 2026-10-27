import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#070d17] text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-900 bg-[#05080f] py-4 text-center text-xs text-slate-500">
        Guild de Cazarrecompensas · Log Pose Console v2026.2.0 · Rumbo al Grand Line
      </footer>
    </div>
  );
};
