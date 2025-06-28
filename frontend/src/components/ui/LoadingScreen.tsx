import { useEffect, useState } from 'react';

export function LoadingScreen({ loading = true }: { loading?: boolean }) {
 
  if (!loading) return null;

  return (
    <div className={`loading ${!loading ? "hidden" : ""}`}>
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </div>
  );
} 