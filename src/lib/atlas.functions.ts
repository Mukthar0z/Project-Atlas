import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  languages: z.string().min(1).max(300),
  careerGoal: z.string().min(1).max(500),
});

const ProjectSchema = z.object({
  title: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  estimatedTime: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  features: z.array(z.string()),
  roadmap: z.array(
    z.object({
      step: z.string(),
      detail: z.string(),
    }),
  ),
  resources: z.array(
    z.object({
      title: z.string(),
      type: z.string(),
      note: z.string(),
    }),
  ),
});

const OutputSchema = z.object({
  projects: z.array(ProjectSchema).min(3).max(5),
});

export type AtlasResult = z.infer<typeof OutputSchema>;

export const generateProjects = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `A developer wants tailored project ideas.

Skill level: ${data.skillLevel}
Programming languages they know: ${data.languages}
Career goal: ${data.careerGoal}

Generate exactly 4 diverse, portfolio-worthy project ideas that match their skill level and push them toward their career goal. For each project include:
- A specific title (not generic)
- Difficulty (Beginner | Intermediate | Advanced)
- Realistic estimated time (e.g. "2 weeks", "1 month")
- A 2-3 sentence description of what it does and why it matters for their goal
- A concrete tech stack using languages they know
- 4-6 key features to build
- A learning roadmap of 5-7 ordered steps (each step has a short title and a one-sentence detail)
- 3-5 learning resources (real-ish types like "Official docs", "YouTube series", "Book chapter") with a short note on what to learn from each

Be specific and practical, not generic. Avoid suggesting the same project twice.`;

    try {
      const { object } = await generateObject({
        model: gateway("google/gemini-3-flash-preview"),
        schema: OutputSchema,
        prompt,
      });
      return object;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) {
        throw new Error("Rate limit reached. Please wait a moment and try again.");
      }
      if (msg.includes("402")) {
        throw new Error("AI credits exhausted. Add credits in your workspace billing settings.");
      }
      throw new Error("Failed to generate projects. Please try again.");
    }
  });