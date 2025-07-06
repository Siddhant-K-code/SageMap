import { GraphPageWrapper } from '@/components/GraphPageWrapper';
import { Suspense } from 'react';

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <GraphPageWrapper />
    </Suspense>
  );
}
