import { useState, useEffect } from 'react';
import { Recycle, Plus, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import type { SustainabilityLog } from '../../types';

interface EcoLogFormState {
  action_type: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string;
}

const ACTION_CATEGORY_MAP: Record<string, string> = {
  recycling: 'waste',
  composting: 'waste',
  energy_saving: 'energy',
  water_saving: 'water',
  transportation: 'transportation',
};

const INITIAL_LOG: EcoLogFormState = {
  action_type: 'recycling',
  category: 'waste',
  quantity: 1,
  unit: 'kg',
  notes: '',
};

export default function EcoTracker() {
  const [logs, setLogs] = useState<SustainabilityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLog, setNewLog] = useState<EcoLogFormState>(INITIAL_LOG);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getEcoLogs();
      setLogs(data);
    } catch (fetchError) {
      console.error('Error fetching logs:', fetchError);
      setError('We could not load your eco log right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const category = ACTION_CATEGORY_MAP[newLog.action_type] ?? newLog.category;
      await apiClient.logEcoAction({
        ...newLog,
        category,
      });
      setShowAddModal(false);
      setNewLog(INITIAL_LOG);
      fetchLogs();
    } catch (submitError) {
      console.error('Error logging action:', submitError);
      setError('Your action could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-kaleo-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Recycle className="w-8 h-8 mr-3 text-emerald-500" />
          Eco Tracker
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log action</span>
        </button>
      </div>

      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Recycle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-kaleo-charcoal capitalize">{log.action_type.replace('_', ' ')}</p>
                  <p className="text-sm text-kaleo-charcoal/60">
                    {log.category} - {new Date(log.logged_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {log.co2_saved_kg != null && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm">
                  {log.co2_saved_kg.toFixed(2)} kg CO2
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Recycle className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">No actions logged</h3>
          <p className="text-kaleo-charcoal/60 mb-6">Start tracking your sustainability actions.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Log your first action
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-serif text-2xl text-kaleo-charcoal mb-6">Log eco action</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Action type</label>
                <select
                  value={newLog.action_type}
                  onChange={(e) => {
                    const actionType = e.target.value;
                    setNewLog({
                      ...newLog,
                      action_type: actionType,
                      category: ACTION_CATEGORY_MAP[actionType] ?? newLog.category,
                    });
                  }}
                  className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg"
                >
                  <option value="recycling">Recycling</option>
                  <option value="composting">Composting</option>
                  <option value="energy_saving">Energy Saving</option>
                  <option value="water_saving">Water Saving</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newLog.quantity}
                    onChange={(e) => {
                      const quantity = Number(e.target.value);
                      setNewLog({ ...newLog, quantity: Number.isFinite(quantity) ? quantity : 0 });
                    }}
                    className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Unit</label>
                  <input
                    type="text"
                    value={newLog.unit}
                    onChange={(e) => setNewLog({ ...newLog, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Notes (optional)</label>
                <textarea
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg h-20 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-kaleo-sand text-kaleo-charcoal rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving...' : 'Log action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
