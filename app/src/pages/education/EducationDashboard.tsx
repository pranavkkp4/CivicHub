import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Layers,
  ClipboardList,
  TrendingDown,
  MessageSquare,
  Brain,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../api/client';
import type { AgentResult, StudyMaterial, WeakTopic } from '../../types';

export default function EducationDashboard() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [agentSuggestion, setAgentSuggestion] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      const [materialsData, topicsData, agentData] = await Promise.all([
        apiClient.getStudyMaterials(),
        apiClient.getWeakTopics(),
        apiClient.runEducationAgent('education_dashboard'),
      ]);
      setMaterials((materialsData as StudyMaterial[]).slice(0, 3));
      setWeakTopics((topicsData as WeakTopic[]).slice(0, 5));
      setAgentSuggestion(agentData as AgentResult);
    } catch (error) {
      console.error('Error fetching education data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: 'Study Materials',
      description: 'Study materials become drills, notes, and interview preparation.',
      icon: FileText,
      path: '/education/materials',
      color: 'bg-blue-500',
    },
    {
      title: 'Flashcards',
      description: 'Fast recall from the material you already have.',
      icon: Layers,
      path: '/education/flashcards',
      color: 'bg-purple-500',
    },
    {
      title: 'Mock Tests',
      description: 'Practice sessions that turn study into measurable readiness.',
      icon: ClipboardList,
      path: '/education/mock-tests',
      color: 'bg-green-500',
    },
    {
      title: 'Weak Topics',
      description: 'Identify the topics that deserve a little more review.',
      icon: TrendingDown,
      path: '/education/weak-topics',
      color: 'bg-orange-500',
    },
    {
      title: 'Interview Practice',
      description: 'Use your notes and projects to build stronger, clearer answers.',
      icon: MessageSquare,
      path: '/education/interview',
      color: 'bg-pink-500',
    },
    {
      title: 'Digit Recognizer',
      description: 'A lightweight machine learning demo for handwritten digit recognition.',
      icon: Brain,
      path: '/education/digit-recognizer',
      color: 'bg-indigo-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-kaleo-terracotta/30 border-t-kaleo-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
            Education
          </h1>
          <p className="text-kaleo-charcoal/60 mt-1">
            Study materials become drills, notes, and interview preparation.
          </p>
        </div>
        <Link
          to="/education/materials"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add material</span>
        </Link>
      </div>

      {agentSuggestion && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{agentSuggestion.action}</h3>
              <p className="text-white/80 text-sm mb-3">{agentSuggestion.summary}</p>
              {agentSuggestion.recommendations?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {agentSuggestion.recommendations.slice(0, 2).map((rec, idx: number) => (
                    <Link
                      key={idx}
                      to={rec.link || '#'}
                      className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                    >
                      {rec.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.path}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 card-hover"
          >
            <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">{feature.title}</h3>
            <p className="text-kaleo-charcoal/60 text-sm">{feature.description}</p>
            <div className="mt-4 flex items-center text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-kaleo-charcoal">Recent materials</h2>
            <Link to="/education/materials" className="text-blue-500 text-sm hover:underline">
              View all
            </Link>
          </div>

          {materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center p-3 bg-kaleo-sand rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-kaleo-charcoal truncate">{material.title}</p>
                    <p className="text-xs text-kaleo-charcoal/50">
                      {material.subject || 'General notes'} | {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to="/education/materials" className="text-blue-500 hover:text-blue-600">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-kaleo-charcoal/50">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No study materials yet</p>
              <Link
                to="/education/materials"
                className="text-blue-500 text-sm hover:underline mt-2 inline-block"
              >
                Add material to begin
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-kaleo-charcoal">Topics to review</h2>
            <Link to="/education/weak-topics" className="text-orange-500 text-sm hover:underline">
              View All
            </Link>
          </div>

          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <TrendingDown className="w-5 h-5 text-orange-500 mr-3" />
                    <div>
                      <p className="font-medium text-kaleo-charcoal">{topic.topic}</p>
                      <p className="text-xs text-kaleo-charcoal/50">
                        {topic.subject || 'General'} | Missed {topic.miss_count} times
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    Review
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-kaleo-charcoal/50">
              <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No topics need attention yet</p>
              <p className="text-sm mt-1">Once you complete a few drills, the dashboard will show what to revisit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
