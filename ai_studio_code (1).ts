import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RazyAIService {
  /**
   * Retrieves active RAzy AI settings & credentials
   */
  private static async getConfig() {
    let settings = await prisma.razyAISettings.findFirst();
    if (!settings) {
      settings = await prisma.razyAISettings.create({
        data: { assistantName: 'RAzy AI' },
      });
    }
    return settings;
  }

  /**
   * One-click Creator Skills: Generate Video Titles, Descriptions, and Tags
   */
  public static async generateVideoMetadata(topicPrompt: string) {
    const config = await this.getConfig();

    const systemPrompt = `You are RAzy AI, the native OTT optimization intelligence engine. 
Given a video title or synopsis, return a JSON object with:
1. "title": catchy, SEO-friendly video title
2. "shortDescription": engaging 1-2 sentence description (under 250 characters)
3. "tags": array of 5-8 relevant content tags.
Return ONLY valid JSON.`;

    // Fast-tier via Groq or fallback to OpenAI
    if (config.groqApiKey) {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: config.supportChatModel || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Content brief: ${topicPrompt}` }
          ],
          response_format: { type: 'json_object' }
        },
        { headers: { Authorization: `Bearer ${config.groqApiKey}` } }
      );

      await this.incrementTokenUsage(1);
      return JSON.parse(response.data.choices[0].message.content);
    }

    if (config.openaiApiKey) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: config.assistantModel || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Content brief: ${topicPrompt}` }
          ],
          response_format: { type: 'json_object' }
        },
        { headers: { Authorization: `Bearer ${config.openaiApiKey}` } }
      );

      await this.incrementTokenUsage(1);
      return JSON.parse(response.data.choices[0].message.content);
    }

    throw new Error('No valid AI Provider key found in RAzy AI settings.');
  }

  /**
   * Conversational Assistant Console: Responds to viewer and admin queries
   */
  public static async queryAssistant(userPrompt: string, role: string) {
    const config = await this.getConfig();

    const systemPrompt = `You are ${config.assistantName}, the built-in streaming intelligence for RAzy.
User role: ${role}.
Help the user browse the catalog, inspect analytics, or configure playback rules.`;

    const apiKey = config.openaiApiKey || config.groqApiKey;
    const endpoint = config.openaiApiKey
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.groq.com/openai/v1/chat/completions';

    const response = await axios.post(
      endpoint,
      {
        model: config.assistantModel || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    await this.incrementTokenUsage(1);
    return response.data.choices[0].message.content;
  }

  private static async incrementTokenUsage(calls: number) {
    await prisma.razyAISettings.updateMany({
      data: { totalAICalls: { increment: calls } }
    });
  }
}