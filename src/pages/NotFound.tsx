import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mb-2">
          <Compass className="w-12 h-12 animate-spin-slow" />
        </div>
        
        <h1 className="text-6xl font-black text-amber-400 font-mono tracking-tighter">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-serif">
            ¡Rumbo Perdido en el Océano!
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            La aguja magnética del Log Pose gira descontrolada. Las coordenadas que buscas
            no existen en ninguna carta náutica de la Guild.
          </p>
        </div>

        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
