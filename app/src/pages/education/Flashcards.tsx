import { useState, useEffect } from 'react';
import { Layers, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import type { StudyMaterial } from '../../types';

interface StudyMaterialWithFlashcards extends StudyMaterial {
  flashcards?: unknown[];
}

export default function Flashcards() {
  const [materials, setMaterials] = useState<StudyMaterialWithFlashcards[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await apiClient.getStudyMaterials();
      setMaterials(data as StudyMaterialWithFlashcards[]);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setIsLoading(false);
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
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Layers className="w-8 h-8 mr-3 text-purple-500" />
          Flashcards
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Study materials become concise review cards.
        </p>
      </div>

      {materials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">{material.title}</h3>
              <p className="text-sm text-kaleo-charcoal/60 mb-4">
                {material.flashcards?.length || 0} flashcards
              </p>
              <button
                onClick={async () => {
                  try {
                    await apiClient.generateFlashcards(material.id, 10);
                    fetchMaterials();
                  } catch (error) {
                    console.error('Error generating flashcards:', error);
                  }
                }}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Generate flashcards
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Layers className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">Add study materials first</h3>
          <p className="text-kaleo-charcoal/60">Once you add material, the platform can turn it into quick review cards.</p>
        </div>
      )}
    </div>
  );
}
