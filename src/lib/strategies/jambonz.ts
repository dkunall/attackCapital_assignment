import type { AmdStrategy, AmdDetectionResult } from '../amd-strategies';

/**
 * Jambonz SIP AMD Strategy
 * Uses Jambonz's SIP-based AMD with custom recognizers
 */
export class JambonzStrategy implements AmdStrategy {
  readonly name = 'Jambonz SIP AMD';
  readonly type = 'jambonz' as const;
  readonly description = 'SIP-enhanced detection with custom recognizers';
  
  private config: Record<string, any> = {};
  private jambonzUrl?: string;

  async initialize(config: Record<string, any>): Promise<void> {
    this.config = {
      thresholdWordCount: 5,
      decisionTimeoutMs: 10000,
      toneTimeoutMs: 5000,
      greetingCompletionTimeoutMs: 3000,
      ...config,
    };
    
    this.jambonzUrl = process.env.JAMBONZ_URL || config.jambonzUrl;
    
    if (!this.jambonzUrl) {
      throw new Error('Jambonz URL not configured');
    }
  }

  async processAudio(audioBuffer: Buffer): Promise<AmdDetectionResult> {
    // Jambonz AMD is handled via SIP hooks and webhooks
    throw new Error('Jambonz AMD processes via SIP webhooks, not direct audio processing');
  }

  /**
   * Get Jambonz dial verb configuration
   */
  getJambonzDialConfig() {
    return {
      actionHook: `${process.env.NEXT_PUBLIC_APP_URL}/api/amd-events/jambonz`,
      amd: {
        recognizer: {
          vendor: 'default',
          language: 'en-US',
        },
        thresholdWordCount: this.config.thresholdWordCount,
        timers: {
          noSpeechTimeoutMs: this.config.decisionTimeoutMs,
          decisionTimeoutMs: this.config.decisionTimeoutMs,
          toneTimeoutMs: this.config.toneTimeoutMs,
          greetingCompletionTimeoutMs: this.config.greetingCompletionTimeoutMs,
        },
      },
    };
  }

  /**
   * Parse Jambonz AMD webhook event
   */
  parseWebhookEvent(eventData: any): AmdDetectionResult {
    const startTime = eventData.timestamp || Date.now();
    let result: AmdDetectionResult['result'] = 'unknown';
    let confidence = 0.75;

    switch (eventData.event) {
      case 'amd_human_detected':
        result = 'human';
        confidence = 0.85;
        break;
      case 'amd_machine_detected':
        result = 'machine';
        confidence = 0.88;
        break;
      case 'amd_decision_timeout':
        result = 'undecided';
        confidence = 0.5;
        break;
      case 'amd_tone_detected':
        result = 'fax';
        confidence = 0.9;
        break;
      default:
        result = 'unknown';
    }

    return {
      result,
      confidence,
      detectionTimeMs: Date.now() - startTime,
      metadata: {
        jambonzEvent: eventData.event,
        wordCount: eventData.wordCount,
        speechDuration: eventData.speechDurationMs,
      },
    };
  }

  async cleanup(): Promise<void> {
    // No specific cleanup needed
  }
}
