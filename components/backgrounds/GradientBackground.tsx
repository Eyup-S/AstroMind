'use client';

export function GradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/10 via-transparent to-cyan-900/10" />
    </div>
  );
}
