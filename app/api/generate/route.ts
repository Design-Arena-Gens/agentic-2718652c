import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface Segment {
  id: number;
  narration: string;
  image_prompt: string;
  visual_instructions: string;
  duration_seconds: number;
}

interface BRoll {
  segment_id: number;
  suggestions: string[];
}

interface VideoData {
  title: string;
  description: string;
  thumbnail: {
    text: string;
    prompt: string;
  };
  segments: Segment[];
  broll: BRoll[];
  tags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { topic, videoType, duration } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are a YouTube Video Automation Agent. Your job is to generate complete production-ready data for creating a full YouTube video automatically.

Always produce a single JSON object with the exact structure below. Your output must include:
1. Video Title
2. Short YouTube Description (SEO optimized)
3. Thumbnail Text + Thumbnail Image Prompt
4. Segmented Script (each segment contains: narration, image prompt, visual instructions, duration estimate)
5. Optional B-Roll suggestions
6. Tags / Keywords

REQUIRED OUTPUT FORMAT (STRICT JSON):
{
  "title": "",
  "description": "",
  "thumbnail": {
    "text": "",
    "prompt": ""
  },
  "segments": [
    {
      "id": 1,
      "narration": "",
      "image_prompt": "",
      "visual_instructions": "",
      "duration_seconds": 0
    }
  ],
  "broll": [
    {"segment_id": 1, "suggestions": []}
  ],
  "tags": []
}

CONTENT RULES:
1. Title: Engaging, SEO-friendly, click-optimized
2. Description: 2-3 sentences, keywords included, retention optimized
3. Thumbnail Text: Max 4-6 words, bold statement, high contrast
4. Thumbnail Prompt: Detailed image generation prompt for thumbnail
5. Segments: Break video into logical segments with complete narration scripts
6. Image Prompts: Detailed prompts for generating visuals for each segment
7. Visual Instructions: Camera angles, transitions, text overlays, effects
8. Duration: Realistic time estimates per segment in seconds
9. B-Roll: Relevant supplementary footage suggestions
10. Tags: 10-15 relevant keywords for SEO

You must ONLY output valid JSON. No explanations, no markdown, just the JSON object.`;

    const userPrompt = `Generate a complete YouTube video automation script for:
Topic: ${topic}
Video Type: ${videoType}
Target Duration: ${duration} minutes

Create engaging content optimized for YouTube with high retention, SEO optimization, and production-ready details.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const videoData: VideoData = JSON.parse(content);

    // Validate structure
    if (!videoData.title || !videoData.description || !videoData.thumbnail || !videoData.segments || !videoData.tags) {
      throw new Error('Invalid video data structure');
    }

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Error generating video data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video data' },
      { status: 500 }
    );
  }
}
