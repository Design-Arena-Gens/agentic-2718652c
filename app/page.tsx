'use client';

import { useState } from 'react';

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

export default function Home() {
  const [topic, setTopic] = useState('');
  const [videoType, setVideoType] = useState('tutorial');
  const [duration, setDuration] = useState('5-10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoData | null>(null);
  const [error, setError] = useState('');

  const generateVideo = async () => {
    if (!topic.trim()) {
      setError('Please enter a video topic');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, videoType, duration }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video data');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            YouTube Video Automation Agent
          </h1>
          <p className="text-gray-600 text-lg">
            Generate complete production-ready data for YouTube videos automatically
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to Make Perfect Sourdough Bread"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Type
                </label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="educational">Educational</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="review">Review</option>
                  <option value="documentary">Documentary</option>
                  <option value="listicle">Listicle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  <option value="1-3">1-3 minutes</option>
                  <option value="5-10">5-10 minutes</option>
                  <option value="10-15">10-15 minutes</option>
                  <option value="15-20">15-20 minutes</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateVideo}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Generating...' : 'Generate Video Data'}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">Generated Video Data</h2>
              <button
                onClick={downloadJSON}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Download JSON
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Title</h3>
                  <p className="text-lg text-gray-700 bg-gray-50 p-4 rounded-lg">{result.title}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{result.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Thumbnail</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">Text:</span>
                      <p className="text-gray-700 mt-1">{result.thumbnail.text}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Image Prompt:</span>
                      <p className="text-gray-700 mt-1">{result.thumbnail.prompt}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Script Segments ({result.segments.length})
                  </h3>
                  <div className="space-y-4">
                    {result.segments.map((segment) => (
                      <div key={segment.id} className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-600">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">Segment {segment.id}</h4>
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                            {segment.duration_seconds}s
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Narration:</span>
                            <p className="text-gray-700 mt-1">{segment.narration}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Image Prompt:</span>
                            <p className="text-gray-700 mt-1">{segment.image_prompt}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Visual Instructions:</span>
                            <p className="text-gray-700 mt-1">{segment.visual_instructions}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {result.broll && result.broll.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">B-Roll Suggestions</h3>
                    <div className="space-y-3">
                      {result.broll.map((broll) => (
                        <div key={broll.segment_id} className="bg-gray-50 p-4 rounded-lg">
                          <span className="font-semibold text-gray-700">Segment {broll.segment_id}:</span>
                          <ul className="mt-2 space-y-1 ml-4">
                            {broll.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-gray-700">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Tags / Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
