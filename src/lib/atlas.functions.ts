import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  languages: z.array(z.string().min(1).max(40)).min(1).max(8),
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
Programming languages they know: ${data.languages.join(", ")}
Career goal: ${data.careerGoal}

Generate exactly 4 diverse, portfolio-worthy project ideas matched to their skill level and career goal. Be specific and practical; avoid duplicates.

Respond with ONLY valid minified JSON (no markdown fences, no commentary) matching this exact shape:
{"projects":[{"title":string,"difficulty":"Beginner"|"Intermediate"|"Advanced","estimatedTime":string,"description":string,"techStack":string[],"features":string[],"roadmap":[{"step":string,"detail":string}],"resources":[{"title":string,"type":string,"note":string}]}]}

Rules:
- title: specific, not generic
- estimatedTime: e.g. "2 weeks", "1 month"
- description: 2-3 sentences explaining what it does and why it matters for the goal
- techStack: concrete tools, mostly using languages they listed
- features: 4-6 key features
- roadmap: 5-7 ordered steps, each with a short step title and one-sentence detail
- resources: 3-5 items; type is e.g. "Docs", "YouTube", "Book", "Course", "Blog"`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
      });

      const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Try to extract the first {...} block
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("AI returned an unreadable response. Please try again.");
        parsed = JSON.parse(match[0]);
      }

      return OutputSchema.parse(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) {
        throw new Error("Rate limit reached. Please wait a moment and try again.");
      }
      if (msg.includes("402")) {
        throw new Error("AI credits exhausted. Add credits in your workspace billing settings.");
      }
      console.error("Atlas generate error:", err);
      throw new Error(msg || "Failed to generate projects. Please try again.");
    }
  });