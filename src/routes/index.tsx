import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Compass, Sparkles, Loader2, MapPin, BookOpen, Wrench, ListChecks, Target, ArrowRight } from "lucide-react";
import { generateProjects, type AtlasResult } from "@/lib/atlas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Atlas — AI-charted projects for your coding journey" },
      {
        name: "description",
        content:
          "Tell Project Atlas your skills and goals. Get tailored project ideas, a learning roadmap, and curated resources.",
      },
      { property: "og:title", content: "Project Atlas" },
      {
        property: "og:description",
        content: "AI-charted projects, roadmaps, and resources for developers.",
      },
    ],
  }),
  component: AtlasPage,
});

type Skill = "beginner" | "intermediate" | "advanced";

const SKILLS: { value: Skill; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "0–1 yr · learning the basics" },
  { value: "intermediate", label: "Intermediate", hint: "1–3 yrs · shipping features" },
  { value: "advanced", label: "Advanced", hint: "3+ yrs · architecting systems" },
];

function AtlasPage() {
  const [skillLevel, setSkillLevel] = useState<Skill>("intermediate");
  const [languages, setLanguages] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [result, setResult] = useState<AtlasResult | null>(null);

  const generate = useServerFn(generateProjects);
  const mutation = useMutation({
    mutationFn: (input: { skillLevel: Skill; languages: string; careerGoal: string }) =>
      generate({ data: input }),
    onSuccess: (data) => {
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("atlas-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!languages.trim() || !careerGoal.trim()) {
      toast.error("Tell us your languages and your goal.");
      return;
    }
    setResult(null);
    mutation.mutate({ skillLevel, languages: languages.trim(), careerGoal: careerGoal.trim() });
  }

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" />

      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-md bg-brass text-brass-foreground">
              <Compass className="size-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="font-display text-lg leading-none">Project Atlas</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                AI-charted dev journeys
              </div>
            </div>
          </div>
          <a
            href="#chart"
            className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline"
          >
            Start charting ↓
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="atlas-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <Sparkles className="size-3 text-brass" /> Tailored to your skills
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            Chart your next
            <br />
            <span className="italic text-brass">build-worthy</span> project.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Tell Atlas where you are and where you're going. It returns project ideas, a step-by-step
            roadmap, and the resources to get there.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section id="chart" className="scroll-mt-8">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
          >
            <div className="mb-6 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brass">
                01 — Your bearings
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-7">
              <div>
                <Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Skill level
                </Label>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {SKILLS.map((s) => {
                    const active = skillLevel === s.value;
                    return (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => setSkillLevel(s.value)}
                        className={`group rounded-lg border px-4 py-3 text-left transition ${
                          active
                            ? "border-brass bg-brass/10 ring-1 ring-brass"
                            : "border-border bg-secondary/40 hover:border-brass/60 hover:bg-secondary"
                        }`}
                      >
                        <div className="font-display text-base text-foreground">{s.label}</div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="languages"
                  className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Programming languages
                </Label>
                <Input
                  id="languages"
                  placeholder="e.g. TypeScript, Python, a bit of Rust"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  maxLength={300}
                  className="mt-3 h-12 border-border bg-input/60 text-base focus-visible:ring-brass"
                />
              </div>

              <div>
                <Label
                  htmlFor="goal"
                  className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Career goal
                </Label>
                <Textarea
                  id="goal"
                  placeholder="e.g. Land a backend role at a fintech, or build a SaaS side-business"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-3 resize-none border-border bg-input/60 text-base focus-visible:ring-brass"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Powered by Lovable AI · ~10s to chart
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending}
                className="h-12 bg-brass px-6 text-base font-medium text-brass-foreground hover:bg-brass/90"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Charting your atlas…
                  </>
                ) : (
                  <>
                    Chart my projects <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        <section id="atlas-results" className="mt-16 scroll-mt-8">
          {mutation.isPending && <LoadingState />}
          {result && !mutation.isPending && <ResultsView result={result} />}
          {!result && !mutation.isPending && <EmptyHints />}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Project Atlas · for explorers who ship
      </footer>
    </div>
  );
}

function EmptyHints() {
  const items = [
    { icon: Target, label: "Project ideas matched to your goal" },
    { icon: MapPin, label: "Step-by-step learning roadmap" },
    { icon: BookOpen, label: "Curated resources per project" },
    { icon: Wrench, label: "Realistic tech stack & features" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-3 rounded-lg border border-dashed border-border/80 bg-card/30 px-4 py-4"
        >
          <div className="grid size-9 place-items-center rounded-md bg-secondary text-brass">
            <it.icon className="size-4" />
          </div>
          <div className="text-sm text-muted-foreground">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-xl border border-border bg-card/40"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

function difficultyTone(d: string) {
  switch (d) {
    case "Beginner":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "Advanced":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    default:
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
}

function ResultsView({ result }: { result: AtlasResult }) {
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brass">
          02 — Your atlas
        </span>
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {result.projects.length} projects
        </span>
      </div>

      <div className="grid gap-6">
        {result.projects.map((p, idx) => (
          <article
            key={idx}
            className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-xl shadow-black/30 backdrop-blur"
          >
            <div className="border-b border-border bg-gradient-to-br from-secondary/60 to-transparent p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Project · {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                    {p.title}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${difficultyTone(
                      p.difficulty,
                    )}`}
                  >
                    {p.difficulty}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ⏱ {p.estimatedTime}
                  </span>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-[11px] text-foreground/85"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-3">
              <Block icon={ListChecks} title="Key features">
                <ul className="space-y-2 text-sm text-foreground/90">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brass" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block icon={MapPin} title="Learning roadmap">
                <ol className="space-y-3">
                  {p.roadmap.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-brass/50 font-mono text-[10px] text-brass">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{step.step}</div>
                        <div className="text-xs leading-relaxed text-muted-foreground">
                          {step.detail}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Block>

              <Block icon={BookOpen} title="Resources">
                <ul className="space-y-3">
                  {p.resources.map((r, i) => (
                    <li key={i} className="rounded-lg border border-border/80 bg-secondary/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                        <span className="shrink-0 rounded-sm border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {r.type}
                        </span>
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {r.note}
                      </div>
                    </li>
                  ))}
                </ul>
              </Block>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="#chart"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:text-brass"
        >
          ↑ Chart a different journey
        </a>
      </div>
    </div>
  );
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-3.5 text-brass" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}