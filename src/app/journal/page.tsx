import { Journal } from '@/components/Journal';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Journal />
      </Suspense>
      <Toaster />
    </div>
  );
}
