import React from 'react';
import { motion } from 'motion/react';

interface ReactorCoreProps {
  isProcessing: boolean;
  activeStage?: string;
}

export const ReactorCore: React.FC<ReactorCoreProps> = ({ isProcessing, activeStage }) => {
  return (
    <div className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32">
      {/* Outer Glow Halo */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
          isProcessing
            ? 'bg-cyan-500/40 scale-110 animate-pulse'
            : 'bg-cyan-600/20 scale-95'
        }`}
      />

      {/* Outer Orbiting Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isProcessing ? 4 : 16, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40"
      />

      {/* Counter-rotating Inner Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: isProcessing ? 3 : 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full border border-cyan-400/50"
        style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
      />

      {/* Central Core Sphere */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.15, 0.95, 1] : [1, 1.05, 1],
        }}
        transition={{ duration: isProcessing ? 1 : 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-950 via-slate-900 to-cyan-800 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]"
      >
        <span className="font-mono text-[10px] font-bold tracking-widest text-cyan-200">JARVIS</span>
        <div
          className={`w-2 h-2 rounded-full mt-1 ${
            isProcessing ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
          }`}
        />
      </motion.div>

      {/* Active Stage Indicator Tag */}
      {isProcessing && activeStage && (
        <div className="absolute -bottom-3 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/80 text-[9px] font-mono text-cyan-300 shadow-md">
          {activeStage}
        </div>
      )}
    </div>
  );
};
