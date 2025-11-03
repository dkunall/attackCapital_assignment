import type { AmdStrategy, AmdDetectionResult } from '../amd-strategies';

/**
 * Hugging Face ML Model Strategy
 * Uses jakeBland/wav2vec-vm-finetune for voicemail detection
 */
export class HuggingFaceStrategy implements AmdStrategy {
  readonly name = 'Hugging Face Model';
  readonly type = 'huggingface' as const;
  readonly description = 'ML-based wav2vec voicemail detection';
  
  private serviceUrl?: string;
  private confidenceThreshold = 0.7;

  async initialize(config: Record<string, any>): Promise<void> {
    this.serviceUrl = process.env.HF_SERVICE_URL || config.serviceUrl || 'http://localhost:8000';
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
    
    // Verify service is available
    try {
      const response = await fetch(`${this.serviceUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error('HuggingFace service not responding');
      }
    } catch (error) {
      console.warn('HuggingFace service health check failed:', error);
      // Don't throw - allow initialization but log warning
    }
  }

  async processAudio(audioBuffer: Buffer): Promise<AmdDetectionResult> {
    const startTime = Date.now();
    
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' });
      formData.append('audio', blob, 'audio.wav');

      const response = await fetch(`${this.serviceUrl}/predict`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace service error: ${response.statusText}`);
      }

      const data = await response.json();
      const detectionTimeMs = Date.now() - startTime;

      // Parse model output
      const label = data.label.toLowerCase();
      const confidence = data.confidence || data.score || 0.0;

      let result: AmdDetectionResult['result'] = 'unknown';
      
      if (label.includes('voicemail') || label.includes('machine')) {
        result = confidence >= this.confidenceThreshold ? 'machine' : 'undecided';
      } else if (label.includes('human') || label.includes('person')) {
        result = confidence >= this.confidenceThreshold ? 'human' : 'undecided';
      } else {
        result = 'undecided';
      }

      return {
        result,
        confidence,
        detectionTimeMs,
        metadata: {
          modelLabel: data.label,
          rawScore: data.confidence,
          processingTime: data.processingTime,
        },
      };
    } catch (error) {
      console.error('HuggingFace AMD error:', error);
      
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
    // Buffer the stream into chunks
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    const maxBufferSize = 5 * 1024 * 1024; // 5MB max

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        totalSize += value.length;
        
        // Process when we have enough data (2-5 seconds of audio)
        if (totalSize >= 48000 * 2) { // ~2 seconds at 24kHz 16-bit
          const buffer = Buffer.concat(chunks);
          return await this.processAudio(buffer);
        }
        
        if (totalSize > maxBufferSize) {
          break; // Prevent memory issues
        }
      }

      // Process remaining buffer
      const buffer = Buffer.concat(chunks);
      return await this.processAudio(buffer);
      
    } catch (error) {
      console.error('Stream processing error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  async cleanup(): Promise<void> {
    // No specific cleanup needed
  }
}
