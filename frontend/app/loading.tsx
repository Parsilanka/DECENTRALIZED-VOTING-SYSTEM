import { Blueprint, Box, Database, Shield, Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="w-24 h-24 bg-blue-600/10 rounded-3xl blur-2xl animate-pulse absolute inset-0" />
        <Zap className="w-16 h-16 text-blue-600 animate-bounce relative z-10" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold dark:text-white">Synchronizing with Chain</h2>
        <p className="text-sm text-gray-500 max-w-[200px]">Fetching the latest blocks and election data...</p>
      </div>
    </div>
  );
}
