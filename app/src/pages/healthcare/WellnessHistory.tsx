import { Activity } from 'lucide-react';

export default function WellnessHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Activity className="w-8 h-8 mr-3 text-purple-500" />
          Wellness History
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          See the routines, meals, and check-ins that shaped your progress.
        </p>
      </div>

      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <Activity className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
        <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">History starts with one plan</h3>
        <p className="text-kaleo-charcoal/60">Your completed routines and check-ins will appear here.</p>
      </div>
    </div>
  );
}
