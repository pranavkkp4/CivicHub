import { useEffect, useState } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import type { StudyMaterial } from '../../types';

export default function StudyMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', content: '', subject: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await apiClient.getStudyMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.createStudyMaterial(newMaterial);
      setShowAddModal(false);
      setNewMaterial({ title: '', content: '', subject: '' });
      fetchMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
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
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-kaleo-charcoal">Study Materials</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add material</span>
        </button>
      </div>

      {materials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl shadow-sm p-6 card-hover">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">{material.title}</h3>
              <p className="text-sm text-kaleo-charcoal/60 mb-4">
                {material.subject || 'General notes'} | {new Date(material.created_at).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                  Create drills
                </button>
                <button className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors">
                  Interview prep
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <FileText className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">Start with a note, reading, or lecture</h3>
          <p className="text-kaleo-charcoal/60 mb-6">
            The platform can turn source material into drills, notes, and interview preparation when you are ready.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add source material
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-2xl text-kaleo-charcoal mb-6">Add material</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Title</label>
                <input
                  type="text"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="e.g., Biology chapter notes"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Subject (optional)</label>
                <input
                  type="text"
                  value={newMaterial.subject}
                  onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="e.g., Biology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Content</label>
                <textarea
                  value={newMaterial.content}
                  onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                  className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 h-48 resize-none"
                  placeholder="Paste notes, excerpts, or prompts here..."
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-kaleo-sand text-kaleo-charcoal rounded-lg hover:bg-kaleo-terracotta/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
