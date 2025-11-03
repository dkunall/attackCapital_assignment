/**
 * API Client for backend communication
 * 
 * NOTE: This project template uses Vite + React. The assignment specifies Next.js 14+.
 * To fully implement this system:
 * 1. Migrate to Next.js 14+ with App Router, OR
 * 2. Implement these endpoints as Supabase Edge Functions, OR
 * 3. Create a separate Express/Node backend
 * 
 * Current implementation provides client-side structure with mock data for demonstration.
 */

import { z } from 'zod';

const dialSchema = z.object({
  targetNumber: z.string().regex(/^\+1\d{10}$/, 'Must be a valid US phone number'),
  amdStrategy: z.enum(['twilio_native', 'jambonz', 'huggingface', 'gemini']),
});

export interface Call {
  id: string;
  targetNumber: string;
  amdStrategy: string;
  status: string;
  amdResult: string | null;
  amdConfidence: number | null;
  detectionTimeMs: number | null;
  dialedAt: string;
  duration: number | null;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // In production, this would point to your backend or Supabase Edge Functions
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  /**
   * Initiate an outbound call
   */
  async dial(targetNumber: string, amdStrategy: string) {
    const validated = dialSchema.parse({ targetNumber, amdStrategy });

    // Mock implementation - replace with actual API call
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📞 [DEMO MODE] Initiating call:', {
      callId,
      targetNumber: validated.targetNumber,
      amdStrategy: validated.amdStrategy,
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      callId,
      twilioSid: `CA${Math.random().toString(36).substr(2, 32)}`,
      status: 'initiated',
      message: 'Call initiated successfully (demo mode)',
    };
  }

  /**
   * Get call history
   */
  async getCalls(): Promise<Call[]> {
    // Mock implementation - replace with actual API call
    console.log('📋 [DEMO MODE] Fetching call history');
    
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return sample data
    return [
      {
        id: 'call_demo_1',
        targetNumber: '+18007742678',
        amdStrategy: 'twilio_native',
        status: 'completed',
        amdResult: 'machine',
        amdConfidence: 0.92,
        detectionTimeMs: 2340,
        dialedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        duration: 45,
      },
      {
        id: 'call_demo_2',
        targetNumber: '+18008066453',
        amdStrategy: 'gemini',
        status: 'completed',
        amdResult: 'machine',
        amdConfidence: 0.95,
        detectionTimeMs: 850,
        dialedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        duration: 38,
      },
      {
        id: 'call_demo_3',
        targetNumber: '+15551234567',
        amdStrategy: 'huggingface',
        status: 'completed',
        amdResult: 'human',
        amdConfidence: 0.88,
        detectionTimeMs: 1250,
        dialedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        duration: 120,
      },
    ];
  }

  /**
   * Get call details by ID
   */
  async getCall(callId: string): Promise<Call | null> {
    console.log('🔍 [DEMO MODE] Fetching call:', callId);
    
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate call progression
    const timestampStr = callId.split('_')[1];
    const timestamp = timestampStr ? parseInt(timestampStr, 10) : Date.now();
    const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
    const statusProgression = ['initiated', 'ringing', 'in_progress', 'completed'];
    const statusIndex = Math.min(Math.floor(elapsedSeconds / 2), statusProgression.length - 1);
    
    return {
      id: callId,
      targetNumber: '+18007742678',
      amdStrategy: 'gemini',
      status: statusProgression[statusIndex],
      amdResult: statusIndex >= 2 ? 'machine' : null,
      amdConfidence: statusIndex >= 2 ? 0.94 : null,
      detectionTimeMs: statusIndex >= 2 ? 920 : null,
      dialedAt: new Date(timestamp).toISOString(),
      duration: statusIndex === 3 ? 42 : null,
    };
  }
}

export const apiClient = new ApiClient();
