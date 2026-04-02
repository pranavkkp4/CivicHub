import { Gamepad2 } from 'lucide-react';

export default function RecyclingGame() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Gamepad2 className="w-8 h-8 mr-3 text-purple-500" />
          Recycling Game
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Learn waste sorting with quick, practical examples.
        </p>
      </div>

      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
        <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">Practice mode is on the way</h3>
        <p className="text-kaleo-charcoal/60">The recycling sorting game will appear here as a lightweight learning tool.</p>
      </div>
    </div>
  );
}
