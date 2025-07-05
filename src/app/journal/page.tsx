import { Journal } from '@/components/Journal';
import { Toaster } from '@/components/ui/sonner';

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Journal />
      <Toaster />
    </div>
  );
}
