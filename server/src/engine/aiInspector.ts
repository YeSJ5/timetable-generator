import OpenAI from 'openai';
import { TimetableData } from './utils';

export interface Conflict {
  type: 'teacher' | 'room' | 'subject' | 'lab';
  day: string;
  slot: string;
  message: string;
  sectionId?: string;
}

// Only initialize OpenAI if API key is provided
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export interface AIExplanation {
  topDecisions: Array<{
    decision: string;
    reasoning: string;
  }>;
  suggestions: Array<{
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  summary: string;
}

export interface AIFix {
  type: 'move' | 'swap' | 'remove';
  sectionId: string;
  day: string;
  fromSlot: number;
  toSlot?: number;
  reason: string;
}

export async function analyzeTimetable(
  timetables: { [sectionId: string]: TimetableData },
  conflicts: Conflict[],
  diagnostics: any,
  sections: Array<{ id: string; name: string }>
): Promise<AIExplanation | null> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    // Build summary of timetable
    const summary = buildTimetableSummary(timetables, conflicts, diagnostics, sections);

    const prompt = `You are an expert academic timetable scheduler. Analyze the following timetable generation results and provide:

1. Top 5 placement decisions with reasoning
2. Suggestions to improve the timetable (prioritize: high, medium, low)
3. A brief summary

Timetable Summary:
${summary}

Conflicts: ${conflicts.length}
${conflicts.slice(0, 10).map(c => `- ${c.message}`).join('\n')}

Provide your analysis in a structured format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic timetable scheduler. Provide clear, actionable insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return null;
    }

    // Parse response (simple extraction)
    return parseAIResponse(response);
  } catch (error) {
    console.error('AI Inspector error:', error);
    return null;
  }
}

export async function generateAIFixes(
  timetables: { [sectionId: string]: TimetableData },
  conflicts: Conflict[]
): Promise<AIFix[]> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    return [];
  }

  try {
    const conflictSummary = conflicts.map(c => `${c.type}: ${c.message} (${c.day}, ${c.slot})`).join('\n');

    const prompt = `Analyze these timetable conflicts and suggest specific fixes:

Conflicts:
${conflictSummary}

For each conflict, suggest a fix with:
- type: move, swap, or remove
- sectionId, day, fromSlot, toSlot (if applicable)
- reason

Return as JSON array.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert timetable scheduler. Provide specific fix suggestions as JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return [];
    }

    try {
      const fixes = JSON.parse(response);
      return Array.isArray(fixes) ? fixes : [];
    } catch (e) {
      return [];
    }
  } catch (error) {
    console.error('AI Fix generation error:', error);
    return [];
  }
}

function buildTimetableSummary(
  timetables: { [sectionId: string]: TimetableData },
  conflicts: Conflict[],
  diagnostics: any,
  sections: Array<{ id: string; name: string }>
): string {
  let summary = `Generated timetables for ${sections.length} sections:\n`;
  sections.forEach(s => {
    summary += `- ${s.name}: ${Object.keys(timetables[s.id] || {}).length} days\n`;
  });

  summary += `\nDiagnostics:\n`;
  summary += `- Total slots: ${diagnostics.totalSlots}\n`;
  summary += `- Used slots: ${diagnostics.usedSlots}\n`;
  summary += `- Lab slots: ${diagnostics.labSlots}\n`;
  summary += `- Theory slots: ${diagnostics.theorySlots}\n`;

  summary += `\nTeacher Load:\n`;
  Object.entries(diagnostics.teacherLoad || {}).slice(0, 10).forEach(([id, load]) => {
    summary += `- Teacher ${id}: ${load} slots\n`;
  });

  return summary;
}

function parseAIResponse(response: string): AIExplanation {
  // Simple parsing - in production, use more robust parsing
  const topDecisions: Array<{ decision: string; reasoning: string }> = [];
  const suggestions: Array<{ suggestion: string; priority: 'high' | 'medium' | 'low' }> = [];

  // Extract decisions (look for numbered lists)
  const decisionMatches = response.match(/\d+\.\s*([^\n]+)/g);
  if (decisionMatches) {
    decisionMatches.slice(0, 5).forEach(match => {
      const text = match.replace(/^\d+\.\s*/, '');
      topDecisions.push({
        decision: text,
        reasoning: text, // Simplified
      });
    });
  }

  // Extract suggestions
  const suggestionMatches = response.match(/- ([^\n]+)/g);
  if (suggestionMatches) {
    suggestionMatches.forEach(match => {
      const text = match.replace(/^-\s*/, '');
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (text.toLowerCase().includes('high') || text.toLowerCase().includes('critical')) {
        priority = 'high';
      } else if (text.toLowerCase().includes('low') || text.toLowerCase().includes('optional')) {
        priority = 'low';
      }
      suggestions.push({ suggestion: text, priority });
    });
  }

  return {
    topDecisions,
    suggestions,
    summary: response.substring(0, 200) + '...',
  };
}
