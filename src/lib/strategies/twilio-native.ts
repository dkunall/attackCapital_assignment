import type { AmdStrategy, AmdDetectionResult } from '../amd-strategies';

/**
 * Twilio Native AMD Strategy
 * Uses Twilio's built-in machine detection capabilities
 */
export class TwilioNativeStrategy implements AmdStrategy {
  readonly name = 'Twilio Native AMD';
  readonly type = 'twilio_native' as const;
  readonly description = 'Built-in Twilio machine detection';
  
  private config: Record<string, any> = {};

  async initialize(config: Record<string, any>): Promise<void> {
    this.config = {
      machineDetection: 'DetectMessageEnd',
      asyncAmd: true,
      asyncAmdStatusCallback: config.statusCallbackUrl,
      machineDetectionTimeout: 30,
      machineDetectionSpeechThreshold: 2400,
      machineDetectionSpeechEndThreshold: 1200,
      machineDetectionSilenceTimeout: 5000,
      ...config,
    };
  }

  async processAudio(audioBuffer: Buffer): Promise<AmdDetectionResult> {
    // Twilio Native AMD is handled server-side via webhooks
    // This method is a placeholder for the interface
    throw new Error('Twilio Native AMD processes via webhooks, not direct audio processing');
  }

  /**
   * Get Twilio call parameters for AMD
   */
  getTwilioCallParams() {
    return {
      machineDetection: this.config.machineDetection,
      asyncAmd: this.config.asyncAmd,
      asyncAmdStatusCallback: this.config.asyncAmdStatusCallback,
      machineDetectionTimeout: this.config.machineDetectionTimeout,
      machineDetectionSpeechThreshold: this.config.machineDetectionSpeechThreshold,
      machineDetectionSpeechEndThreshold: this.config.machineDetectionSpeechEndThreshold,
      machineDetectionSilenceTimeout: this.config.machineDetectionSilenceTimeout,
    };
  }

  /**
   * Parse Twilio AMD webhook result
   */
  parseWebhookResult(webhookData: any): AmdDetectionResult {
    const startTime = webhookData.timestamp || Date.now();
    const amdStatus = webhookData.AnsweredBy || webhookData.AnsweringMachineDetection;
    
    let result: AmdDetectionResult['result'] = 'unknown';
    let confidence = 0.7; // Twilio doesn't provide confidence, so we use a default

    switch (amdStatus) {
      case 'human':
        result = 'human';
        confidence = 0.8;
        break;
      case 'machine_start':
      case 'machine_end_beep':
      case 'machine_end_silence':
      case 'machine_end_other':
        result = 'machine';
        confidence = 0.85;
        break;
      case 'fax':
        result = 'fax';
        confidence = 0.9;
        break;
      case 'unknown':
      default:
        result = 'undecided';
        confidence = 0.5;
    }

    return {
      result,
      confidence,
      detectionTimeMs: Date.now() - startTime,
      metadata: {
        twilioStatus: amdStatus,
        callDuration: webhookData.CallDuration,
      },
    };
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for Twilio Native
  }
}
