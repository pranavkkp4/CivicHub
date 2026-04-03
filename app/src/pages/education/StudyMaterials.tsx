import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Loader2,
  Mail,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../api/client';
import EmailContentDialog from '../../components/education/EmailContentDialog';
import StarterPackCard from '../../components/education/StarterPackCard';
import StudyMaterialCard from '../../components/education/StudyMaterialCard';
import StudyMaterialsHero from '../../components/education/StudyMaterialsHero';
import WorkspaceFilterChip from '../../components/education/WorkspaceFilterChip';
import { cn } from '../../lib/utils';
import type { StudyMaterial } from '../../types';

type MaterialDraft = {
  title: string;
  content: string;
  subject: string;
};

type FilterValue = 'all' | 'recent' | `subject:${string}`;
type SortValue = 'newest' | 'oldest' | 'title' | 'density';

const seedMaterials: Array<MaterialDraft & { label: string }> = [
  {
    label: 'Physics fundamentals',
    title: 'Kinematics equations',
    subject: 'Physics',
    content:
      'The kinematic equations describe motion with constant acceleration in one dimension.\n\n' +
      'Key variables: initial position (x0), final position (x), initial velocity (v0), final velocity (v), constant acceleration (a), and time (t).\n\n' +
      'Core formulas:\n' +
      'v = v0 + at\n' +
      'x = x0 + v0t + 1/2 at^2\n' +
      'v^2 = v0^2 + 2a(x - x0)\n' +
      '(x - x0) / t = (v0 + v) / 2\n\n' +
      'Use these only when acceleration stays constant during the interval.',
  },
  {
    label: 'Differential equations',
    title: 'Undetermined coefficients',
    subject: 'Mathematics',
    content:
      'Undetermined coefficients is a method for finding a particular solution to certain nonhomogeneous differential equations.\n\n' +
      'Best fit: constant-coefficient differential equations with forcing terms made from exponentials, sines, cosines, and polynomials.\n\n' +
      'Core idea: guess the form of the particular solution from the forcing term, plug it in, and solve for the unknown coefficients.\n\n' +
      'Common guesses:\n' +
      '- ae^(bt) -> A e^(bt)\n' +
      '- a cos(bt) or a sin(bt) -> A cos(bt) + B sin(bt)\n' +
      '- polynomial of degree n -> nth-degree polynomial guess\n\n' +
      'For products, combine the polynomial, trig, and exponential pieces while keeping coefficients separate.',
  },
  {
    label: 'Applied machine learning',
    title: 'How machine learning works',
    subject: 'Computer Science',
    content:
      'Machine learning builds models that map input features to outputs and improves them through training.\n\n' +
      'Typical workflow:\n' +
      '1. Collect and prepare data.\n' +
      '2. Clean, encode, normalize, and split the data.\n' +
      '3. Choose a model and train it using a loss function.\n' +
      '4. Compare predictions to known outputs and update parameters.\n' +
      '5. Repeat until performance stabilizes.\n\n' +
      'Strong generalization happens when the training data reflects real-world conditions.\n\n' +
      'Key concepts: data quality, feature extraction, loss, optimization, and evaluation.',
  },
];

const sortOptions: Array<{ value: SortValue; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'density', label: 'Most dense' },
];

export default function StudyMaterials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<MaterialDraft>({ title: '', content: '', subject: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seedingMaterial, setSeedingMaterial] = useState<string | null>(null);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');
  const [emailPayload, setEmailPayload] = useState<{ subject: string; content: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [sortValue, setSortValue] = useState<SortValue>('newest');

  useEffect(() => {
    void fetchMaterials();
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.createStudyMaterial(newMaterial);
      setShowAddModal(false);
      setNewMaterial({ title: '', content: '', subject: '' });
      await fetchMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSeedMaterial = async (seed: MaterialDraft) => {
    setSeedingMaterial(seed.title);
    try {
      await apiClient.createStudyMaterial(seed);
      await fetchMaterials();
    } catch (error) {
      console.error('Error creating preset material:', error);
    } finally {
      setSeedingMaterial(null);
    }
  };

  const startDrills = (material: StudyMaterial) => {
    navigate('/education/mock-tests', {
      state: {
        materialId: material.id,
        materialTitle: material.title,
        materialSubject: material.subject,
        sourcePreview: material.content.slice(0, 1200),
      },
    });
  };

  const startInterviewPrep = (material: StudyMaterial) => {
    navigate('/education/interview', {
      state: {
        materialId: material.id,
        topic: material.subject || material.title,
        materialTitle: material.title,
        sourcePreview: material.content.slice(0, 1800),
      },
    });
  };

  const openMaterialEmail = (material: StudyMaterial) => {
    setEmailPayload({
      subject: `Civic Hub study material: ${material.title}`,
      content: buildMaterialEmailContent(material),
    });
    setIsEmailOpen(true);
  };

  const filterOptions = buildFilterOptions(materials);
  const filteredMaterials = sortMaterials(
    materials.filter((material) => matchesSearch(material, searchQuery) && matchesFilter(material, activeFilter)),
    sortValue,
  );
  const featuredMaterials = filteredMaterials.slice(0, Math.min(filteredMaterials.length, 3));
  const featuredIds = new Set(featuredMaterials.map((material) => material.id));
  const gridMaterials = filteredMaterials.filter((material) => !featuredIds.has(material.id));
  const heroRows = sortMaterials([...materials], 'newest').slice(0, 3);
  const latestMaterial = sortMaterials([...materials], 'newest')[0] || null;
  const totalWords = materials.reduce((sum, material) => sum + countWords(material.content), 0);
  const totalStudyMinutes = Math.max(0, Math.round(totalWords / 165));
  const totalOutputsReady = materials.length > 0 ? materials.reduce((sum, material) => sum + Math.max(6, Math.round(countWords(material.content) / 42)), 0) : 0;
  const uniqueSubjectCount = new Set(materials.map((material) => material.subject || 'General study')).size;
  const workspaceReadiness = clamp(34 + materials.length * 11 + uniqueSubjectCount * 7, 24, 98);

  if (isLoading) {
    return (
      <div className="workspace-surface relative min-h-[34rem] overflow-hidden rounded-[2.5rem] p-8 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.88)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,107,107,0.2),transparent_38%)]" />
        <div className="relative flex min-h-[28rem] flex-col items-center justify-center gap-4 text-center">
          <div className="absolute inset-0 animate-ambient-drift bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_62%)] blur-3xl" />
          <Loader2 className="relative h-12 w-12 animate-spin text-kaleo-earth" />
          <div className="space-y-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-kaleo-charcoal/42">Building workspace</p>
            <h2 className="font-serif text-3xl tracking-[-0.04em] text-kaleo-charcoal">Syncing your study library</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <StudyMaterialsHero
        materialsCount={materials.length}
        uniqueSubjectCount={uniqueSubjectCount}
        totalOutputsReady={totalOutputsReady}
        totalStudyMinutes={totalStudyMinutes}
        workspaceReadiness={workspaceReadiness}
        featuredMaterial={heroRows[0] || null}
        latestMaterial={latestMaterial}
        summaryRows={heroRows}
        onAddMaterial={() => setShowAddModal(true)}
        onSecondaryAction={() => scrollToSection(materials.length > 0 ? 'materials-deck' : 'seed-library')}
        secondaryLabel={materials.length > 0 ? 'Jump to workspace deck' : 'Browse starter packs'}
      />

      {emailNotice ? (
        <div className="workspace-surface-muted animate-rise-in rounded-[1.8rem] border border-[rgba(66,211,146,0.18)] bg-[linear-gradient(180deg,rgba(11,25,20,0.94),rgba(8,18,14,0.88))] px-5 py-4 text-sm text-emerald-100 shadow-[0_32px_72px_-48px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-emerald-100/60">Delivery update</p>
              <p className="mt-1">{emailNotice}</p>
            </div>
          </div>
        </div>
      ) : null}

      {materials.length > 0 ? (
        <>
          <section className="workspace-surface-muted animate-rise-in rounded-[2rem] p-4 sm:p-5" style={{ animationDelay: '120ms' }}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kaleo-charcoal/42" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search titles, subjects, or notes..."
                  className="workspace-control h-14 w-full rounded-full border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-kaleo-charcoal placeholder:text-kaleo-charcoal/38"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[14rem]">
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kaleo-charcoal/38" />
                  <select
                    value={sortValue}
                    onChange={(event) => setSortValue(event.target.value as SortValue)}
                    className="workspace-control h-14 w-full appearance-none rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-11 text-sm text-kaleo-charcoal"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kaleo-charcoal/34" />
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-center sm:min-w-[12rem]">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-kaleo-charcoal/36">Visible library</p>
                  <p className="mt-1 font-serif text-2xl tracking-[-0.04em] text-kaleo-charcoal">{filteredMaterials.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-kaleo-charcoal/42">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </div>
              {filterOptions.map((option) => (
                <WorkspaceFilterChip
                  key={option.value}
                  label={option.label}
                  count={option.count}
                  icon={option.icon}
                  active={activeFilter === option.value}
                  onClick={() => setActiveFilter(option.value)}
                />
              ))}
            </div>
          </section>

          <section id="materials-deck" className="space-y-5">
            <SectionHeader
              kicker="Featured & Recent"
              title="The strongest materials in your orbit"
              copy="Featured cards lead with the newest and densest sources so your demo flow lands instantly."
            />

            {featuredMaterials.length > 0 ? (
              <div className={cn('grid gap-5', featuredMaterials.length === 1 ? 'grid-cols-1' : 'xl:grid-cols-[1.16fr_0.84fr]')}>
                <StudyMaterialCard
                  material={featuredMaterials[0]}
                  variant="featured"
                  index={0}
                  onCreateDrills={() => startDrills(featuredMaterials[0])}
                  onInterviewPrep={() => startInterviewPrep(featuredMaterials[0])}
                  onEmail={() => openMaterialEmail(featuredMaterials[0])}
                />
                {featuredMaterials.length > 1 ? (
                  <div className="grid gap-5">
                    {featuredMaterials.slice(1).map((material, index) => (
                      <StudyMaterialCard
                        key={material.id}
                        material={material}
                        index={index + 1}
                        onCreateDrills={() => startDrills(material)}
                        onInterviewPrep={() => startInterviewPrep(material)}
                        onEmail={() => openMaterialEmail(material)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyLibraryMessage text="No materials match this view yet. Try another filter or clear the search." />
            )}
          </section>

          <section className="space-y-5">
            <SectionHeader
              kicker="Full Library"
              title="Browse every source in the workspace"
              copy={
                gridMaterials.length > 0
                  ? `${gridMaterials.length} additional materials remain after the featured row.`
                  : 'Everything matching your current view is already highlighted above.'
              }
            />

            {gridMaterials.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {gridMaterials.map((material, index) => (
                  <StudyMaterialCard
                    key={material.id}
                    material={material}
                    index={index + featuredMaterials.length}
                    onCreateDrills={() => startDrills(material)}
                    onInterviewPrep={() => startInterviewPrep(material)}
                    onEmail={() => openMaterialEmail(material)}
                  />
                ))}
              </div>
            ) : (
              <EmptyLibraryMessage text="Your current sort and filter settings leave no extra cards below the featured row." />
            )}
          </section>
        </>
      ) : (
        <section id="seed-library" className="space-y-6">
          <SectionHeader
            kicker="Starter Packs"
            title="Launch the workspace with curated study signals"
            copy="Each pack is built to show the full drill, interview, and email workflow in a polished demo sequence."
          />

          <div className="grid gap-5 xl:grid-cols-3">
            {seedMaterials.map((seed, index) => (
              <StarterPackCard
                key={seed.title}
                index={index}
                label={seed.label}
                title={seed.title}
                subject={seed.subject}
                content={seed.content}
                isLoading={seedingMaterial === seed.title}
                onLoad={() => void loadSeedMaterial(seed)}
              />
            ))}
          </div>

          <div className="workspace-surface-muted rounded-[2rem] p-8">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-kaleo-charcoal/38">Add Your Own</p>
                <h3 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-kaleo-charcoal">Bring your own source material into the cockpit</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-kaleo-charcoal/60">
                  Paste lecture notes, reading excerpts, or project prep and the page will immediately treat them like premium study assets.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <CalloutCard icon={FileText} label="Structured notes" text="Supports concise chapters, long-form notes, and topic breakdowns." />
                <CalloutCard icon={GraduationCap} label="Interview prep" text="Strong for concept reviews, technical answers, and explanation drills." />
                <CalloutCard icon={Clock3} label="Fast workflow" text="Add once, then branch into cards, tests, and email-ready study packets." />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-kaleo-charcoal transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.18)] hover:bg-white/[0.08]"
            >
              <Plus className="h-4 w-4 text-kaleo-earth" />
              Add your own material
            </button>
          </div>
        </section>
      )}

      {showAddModal ? (
        <div className="fixed inset-0 z-50 bg-[rgba(6,8,12,0.78)] p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,107,107,0.14),transparent_32%)]" />
          <div className="relative flex min-h-full items-center justify-center">
            <div className="workspace-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.2rem] p-7 shadow-[0_48px_110px_-58px_rgba(0,0,0,0.96)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-kaleo-charcoal/38">Add Material</p>
                  <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-kaleo-charcoal">Bring a new source into the workspace</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-kaleo-charcoal/70 transition duration-300 ease-out hover:bg-white/[0.08] hover:text-kaleo-charcoal"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                  <Field label="Title">
                    <input
                      type="text"
                      value={newMaterial.title}
                      onChange={(event) => setNewMaterial({ ...newMaterial, title: event.target.value })}
                      className="workspace-control min-h-[3.5rem] w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-kaleo-charcoal placeholder:text-kaleo-charcoal/35"
                      placeholder="e.g. Biology chapter notes"
                      required
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      type="text"
                      value={newMaterial.subject}
                      onChange={(event) => setNewMaterial({ ...newMaterial, subject: event.target.value })}
                      className="workspace-control min-h-[3.5rem] w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-kaleo-charcoal placeholder:text-kaleo-charcoal/35"
                      placeholder="e.g. Biology"
                    />
                  </Field>
                </div>

                <Field label="Source content">
                  <textarea
                    value={newMaterial.content}
                    onChange={(event) => setNewMaterial({ ...newMaterial, content: event.target.value })}
                    className="workspace-control min-h-[16rem] w-full resize-none rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-kaleo-charcoal placeholder:text-kaleo-charcoal/35"
                    placeholder="Paste notes, excerpts, or prompts here..."
                    required
                  />
                </Field>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-kaleo-charcoal/72 transition duration-300 ease-out hover:bg-white/[0.08] hover:text-kaleo-charcoal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-6 py-3 text-sm font-semibold text-[#fff3eb] shadow-[0_24px_38px_-24px_rgba(139,92,246,0.86)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_30px_44px_-22px_rgba(139,92,246,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span>{isSubmitting ? 'Saving...' : 'Save material'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <EmailContentDialog
        open={isEmailOpen}
        onOpenChange={setIsEmailOpen}
        title="Email study material"
        description="Send this material as a clean study note to any email address."
        defaultSubject={emailPayload?.subject || 'Civic Hub study material'}
        defaultContent={emailPayload?.content || ''}
        emailType="study_material"
        sourcePage="education/materials"
        onSent={setEmailNotice}
      />
    </div>
  );
}

function SectionHeader({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-kaleo-charcoal/38">{kicker}</p>
        <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-kaleo-charcoal">{title}</h2>
      </div>
      <div className="max-w-sm text-sm leading-6 text-kaleo-charcoal/58">{copy}</div>
    </div>
  );
}

function EmptyLibraryMessage({ text }: { text: string }) {
  return <div className="workspace-surface-muted rounded-[2rem] border border-dashed border-white/10 p-8 text-sm leading-6 text-kaleo-charcoal/58">{text}</div>;
}

function CalloutCard({ icon: Icon, label, text }: { icon: typeof FileText; label: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_22px_48px_-38px_rgba(0,0,0,0.84)] backdrop-blur-md">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-kaleo-earth">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-kaleo-charcoal/38">{label}</p>
      <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/60">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-kaleo-charcoal/38">{label}</span>
      {children}
    </label>
  );
}

function buildFilterOptions(materials: StudyMaterial[]) {
  const counts = new Map<string, number>();
  materials.forEach((material) => {
    const key = material.subject || 'General study';
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [
    { value: 'all' as const, label: 'All materials', count: materials.length, icon: Layers },
    { value: 'recent' as const, label: 'Recent', count: materials.filter((material) => isRecentMaterial(material.created_at)).length, icon: Clock3 },
    ...Array.from(counts.entries())
      .map(([subject, count]) => ({ value: `subject:${subject.toLowerCase()}` as const, label: subject, count, icon: FileText }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4),
  ];
}

function matchesSearch(material: StudyMaterial, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [material.title, material.subject, material.content].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
}

function matchesFilter(material: StudyMaterial, filterValue: FilterValue) {
  if (filterValue === 'all') return true;
  if (filterValue === 'recent') return isRecentMaterial(material.created_at);
  return (material.subject || 'General study').toLowerCase() === filterValue.replace('subject:', '');
}

function sortMaterials(materials: StudyMaterial[], sortValue: SortValue) {
  return [...materials].sort((left, right) => {
    if (sortValue === 'title') return left.title.localeCompare(right.title);
    if (sortValue === 'density') return countWords(right.content) - countWords(left.content);
    const leftDate = new Date(left.created_at).getTime();
    const rightDate = new Date(right.created_at).getTime();
    return sortValue === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
  });
}

function countWords(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function isRecentMaterial(createdAt: string) {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return false;
  return Date.now() - parsed.getTime() <= 1000 * 60 * 60 * 24 * 7;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function buildMaterialEmailContent(material: StudyMaterial) {
  return [
    `Study material: ${material.title}`,
    material.subject ? `Subject: ${material.subject}` : 'Subject: General study material',
    `Created: ${new Date(material.created_at).toLocaleDateString()}`,
    '',
    material.content,
  ].join('\n');
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
