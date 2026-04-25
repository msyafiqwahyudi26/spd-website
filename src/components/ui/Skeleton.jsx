export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-16 bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 rounded mt-2" />
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-2/3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTextBlock({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-3 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-slate-200 rounded ${i === lines - 1 ? 'w-4/6' : i % 2 === 0 ? 'w-full' : 'w-5/6'}`} 
        />
      ))}
    </div>
  );
}
