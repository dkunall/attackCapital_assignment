import type { AmdStrategy, AmdDetectionResult } from '../amd-strategies';

/**
 * Gemini 2.5 Flash Strategy
 * Uses Google's Gemini Flash for real-time audio analysis
 */
export class GeminiStrategy implements AmdStrategy {
  readonly name = 'Gemini 2.5 Flash';
  readonly type = 'gemini' as const;
  readonly description = 'Real-time LLM audio analysis';
  
  private apiKey?: string;
  private model = 'gemini-2.5-flash';

  async initialize(config: Record<string, any>): Promise<void> {
    this.apiKey = process.env.GEMINI_API_KEY || config.apiKey;
    this.model = config.model || 'gemini-2.5-flash';
    
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
  }

  async processAudio(audioBuffer: Buffer): Promise<AmdDetectionResult> {
    const startTime = Date.now();
    
    try {
      // Convert audio to base64
      const audioBase64 = audioBuffer.toString('base64');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this audio recording and determine if it's a human speaking or an answering machine/voicemail. 
                    
Respond with ONLY a JSON object in this exact format:
{
  "result": "human" or "machine" or "voicemail",
  "confidence": <number between 0 and 1>,
  "reasoning": "<brief explanation>"
}

Listen carefully for:
- Human: Natural conversational responses, questions, varied intonation
- Machine/Voicemail: Scripted greetings, menu options, beeps, monotone delivery
- Key indicators: "press 1 for...", "leave a message", "hours are...", beep sounds`,
                  },
                  {
                    inline_data: {
                      mime_type: 'audio/wav',
                      data: audioBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 200,
            },
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const detectionTimeMs = Date.now() - startTime;

      // Parse Gemini response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      let result: AmdDetectionResult['result'] = 'unknown';
      const resultLower = parsed.result.toLowerCase();
      
      if (resultLower.includes('human')) {
        result = 'human';
      } else if (resultLower.includes('machine') || resultLower.includes('voicemail')) {
        result = 'machine';
      } else {
        result = 'undecided';
      }

      return {
        result,
        confidence: parsed.confidence || 0.7,
        detectionTimeMs,
        metadata: {
          reasoning: parsed.reasoning,
          rawResponse: text,
          model: this.model,
        },
      };
    } catch (error) {
      console.error('Gemini AMD error:', error);
      
      return {
        result: 'unknown',
        confidence: 0,
        detectionTimeMs: Date.now() - startTime,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async handleStream(stream: ReadableStream): Promise<AmdDetectionResult> {
    // Buffer stream similar to HuggingFace strategy
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        totalSize += value.length;
        
        // Process when we have 2-3 seconds of audio
        if (totalSize >= 48000 * 2) {
          const buffer = Buffer.concat(chunks);
          return await this.processAudio(buffer);
        }
        
        if (totalSize > 5 * 1024 * 1024) break;
      }

      const buffer = Buffer.concat(chunks);
      return await this.processAudio(buffer);
      
    } catch (error) {
      console.error('Gemini stream processing error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  async cleanup(): Promise<void> {
    // No specific cleanup needed
  }
}
