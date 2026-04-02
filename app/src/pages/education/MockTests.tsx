import { useState, useEffect } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import type { StudyMaterial } from '../../types';

interface StudyMaterialWithMockTests extends StudyMaterial {
  mock_tests?: unknown[];
}

export default function MockTests() {
  const [materials, setMaterials] = useState<StudyMaterialWithMockTests[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await apiClient.getStudyMaterials();
      setMaterials(data as StudyMaterialWithMockTests[]);
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
          <ClipboardList className="w-8 h-8 mr-3 text-green-500" />
          Mock Tests
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Practice with focused checks that highlight what to review next.
        </p>
      </div>

      {materials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">{material.title}</h3>
              <p className="text-sm text-kaleo-charcoal/60 mb-4">
                {material.mock_tests?.length || 0} practice tests available
              </p>
              <button
                onClick={async () => {
                  try {
                    await apiClient.generateMockTest(material.id, 10);
                    fetchMaterials();
                  } catch (error) {
                    console.error('Error generating test:', error);
                  }
                }}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Generate test
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">Add study materials first</h3>
          <p className="text-kaleo-charcoal/60">Once you add material, the platform can build a realistic practice test.</p>
        </div>
      )}
    </div>
  );
}
