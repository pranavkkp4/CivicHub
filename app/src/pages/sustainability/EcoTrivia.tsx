import { Target } from 'lucide-react';

export default function EcoTrivia() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Target className="w-8 h-8 mr-3 text-blue-500" />
          Eco Trivia
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Learn practical sustainability habits one question at a time.
        </p>
      </div>

      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <Target className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
        <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">Practice is coming soon</h3>
        <p className="text-kaleo-charcoal/60">Eco trivia questions will appear here as a lightweight learning check-in.</p>
      </div>
    </div>
  );
}
