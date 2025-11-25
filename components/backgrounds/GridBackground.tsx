'use client';

export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute inset-0 bg-slate-950" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.2) 2px, transparent 2px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.2) 2px, transparent 2px)
          `,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
}
