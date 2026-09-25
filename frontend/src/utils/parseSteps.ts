/**
 * Client-side parser for extracting steps, code blocks, and suggestions
 * from the LLM's XML-tagged response. Mirrors backend/step_parser.py.
 */

import type { Step, CodeBlock, Suggestion } from "../stores/chatStore";

export function parseSteps(raw: string): Step[] {
  const steps: Step[] = [];

  // XML format: <step number="1" status="new">...</step>
  const xmlPattern = /<step\s+number="(\d+)"(?:\s+status="(\w+)")?\s*>(.*?)<\/step>/gs;
  let match;

  while ((match = xmlPattern.exec(raw)) !== null) {
    steps.push({
      number: parseInt(match[1]),
      description: match[3].trim(),
      status: (match[2] as Step["status"]) || "new",
    });
  }

  // Fallback: numbered list
  if (steps.length === 0) {
    const listPattern = /(\d+)\.\s+(.+?)(?=\n\d+\.|\n\n|$)/gs;
    while ((match = listPattern.exec(raw)) !== null) {
      steps.push({
        number: parseInt(match[1]),
        description: match[2].trim(),
        status: "new",
      });
    }
  }

  return steps;
}

export function parseCodeBlocks(raw: string, includePartial = false): CodeBlock[] {
  const blocks: CodeBlock[] = [];

  // XML: <code language="python">...</code>
  const xmlPattern = /<code\s+language="(\w+)">(.*?)<\/code>/gs;
  let match;
  while ((match = xmlPattern.exec(raw)) !== null) {
    blocks.push({ language: match[1], code: match[2].trim() });
  }

  // Partial block mid-stream: opening tag present but no closing tag yet
  if (includePartial && blocks.length === 0) {
    const partial = raw.match(/<code\s+language="(\w+)">([\s\S]*)$/);
    if (partial) {
      blocks.push({ language: partial[1], code: partial[2] });
    }
  }

  // Fallback: markdown fences (skip sequence/wsd - handled by diagram renderer)
  if (blocks.length === 0) {
    const mdPattern = /```(\w+)?\n([\s\S]*?)```/g;
    while ((match = mdPattern.exec(raw)) !== null) {
      const lang = match[1] || "python";
      if (lang === "sequence" || lang === "wsd") continue;
      blocks.push({ language: lang, code: match[2].trim() });
    }
  }

  return blocks;
}

export function parseSuggestions(raw: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const pattern = /<chip>(.*?)<\/chip>/gs;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    suggestions.push({ label: match[1].trim() });
  }
  return suggestions;
}

export function parseComplexity(raw: string): number | undefined {
  const match = raw.match(/<complexity\s+level="(\d+)"/);
  return match ? parseInt(match[1]) : undefined;
}

/**
 * Strip XML tags from content for display, keeping the readable text.
 */
export function stripXmlTags(raw: string): string {
  return raw
    // Remove complete blocks first
    .replace(/<steps>[\s\S]*?<\/steps>/g, "")
    .replace(/<code[\s\S]*?<\/code>/g, "")
    .replace(/<suggestions>[\s\S]*?<\/suggestions>/g, "")
    .replace(/<complexity[^/]*\/>/g, "")
    // Remove markdown code fences (duplicates of <code> blocks), but keep sequence/wsd for diagram rendering
    .replace(/```(?!sequence|wsd)\w*\n[\s\S]*?```/g, "")
    // Remove incomplete blocks at end of string (mid-stream)
    .replace(/<(steps|code|suggestions)[\s\S]*/g, "")
    .replace(/<complexity[^>]*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
