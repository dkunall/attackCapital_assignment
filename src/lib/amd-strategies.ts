/**
 * AMD Strategy Types and Interfaces
 * Defines the contract for all Answering Machine Detection strategies
 */

export type AmdStrategyType = 'twilio_native' | 'jambonz' | 'huggingface' | 'gemini';

export interface AmdDetectionResult {
  result: 'human' | 'machine' | 'voicemail' | 'fax' | 'unknown' | 'undecided';
  confidence: number; // 0.0 to 1.0
  detectionTimeMs: number;
  metadata?: Record<string, any>;
}

export interface AmdStrategy {
  readonly name: string;
  readonly type: AmdStrategyType;
  readonly description: string;
  
  /**
   * Initialize the strategy with configuration
   */
  initialize(config: Record<string, any>): Promise<void>;
  
  /**
   * Process audio buffer and return detection result
   */
  processAudio(audioBuffer: Buffer): Promise<AmdDetectionResult>;
  
  /**
   * Handle real-time audio stream
   */
  handleStream?(stream: ReadableStream): Promise<AmdDetectionResult>;
  
  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
}

/**
 * Strategy metadata for UI display
 */
export const AMD_STRATEGIES = [
  {
    type: 'twilio_native' as AmdStrategyType,
    name: 'Twilio Native AMD',
    description: 'Built-in Twilio machine detection (baseline)',
    latency: 'Medium (2-5s)',
    accuracy: 'Good (75-85%)',
    cost: 'Included',
  },
  {
    type: 'jambonz' as AmdStrategyType,
    name: 'Jambonz SIP AMD',
    description: 'SIP-enhanced detection with custom recognizers',
    latency: 'Low (1-3s)',
    accuracy: 'Very Good (80-90%)',
    cost: 'Self-hosted',
  },
  {
    type: 'huggingface' as AmdStrategyType,
    name: 'Hugging Face Model',
    description: 'ML-based wav2vec voicemail detection',
    latency: 'Low (1-2s)',
    accuracy: 'Excellent (85-95%)',
    cost: 'Compute costs',
  },
  {
    type: 'gemini' as AmdStrategyType,
    name: 'Gemini 2.5 Flash',
    description: 'Real-time LLM audio analysis',
    latency: 'Very Low (<1s)',
    accuracy: 'Excellent (90-95%)',
    cost: 'Per-token',
  },
] as const;

/**
 * Factory function to create strategy instances
 */
export async function createAmdStrategy(type: AmdStrategyType): Promise<AmdStrategy> {
  switch (type) {
    case 'twilio_native':
      const { TwilioNativeStrategy } = await import('./strategies/twilio-native');
      return new TwilioNativeStrategy();
    
    case 'jambonz':
      const { JambonzStrategy } = await import('./strategies/jambonz');
      return new JambonzStrategy();
    
    case 'huggingface':
      const { HuggingFaceStrategy } = await import('./strategies/huggingface');
      return new HuggingFaceStrategy();
    
    case 'gemini':
      const { GeminiStrategy } = await import('./strategies/gemini');
      return new GeminiStrategy();
    
    default:
      throw new Error(`Unknown AMD strategy: ${type}`);
  }
}
