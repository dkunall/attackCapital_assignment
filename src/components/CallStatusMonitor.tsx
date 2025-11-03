import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, XCircle, Clock, Radio } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface CallStatus {
  callId: string;
  status: string;
  amdResult?: string;
  confidence?: number;
  detectionTime?: number;
  message?: string;
}

interface CallStatusMonitorProps {
  activeCallId?: string;
}

export function CallStatusMonitor({ activeCallId }: CallStatusMonitorProps) {
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!activeCallId) {
      setCallStatus(null);
      setIsActive(false);
      return;
    }

    setIsActive(true);
    
    // Poll for call status
    const pollInterval = setInterval(async () => {
      try {
        const data = await apiClient.getCall(activeCallId);
        
        if (data) {
          setCallStatus({
            callId: data.id,
            status: data.status,
            amdResult: data.amdResult,
            confidence: data.amdConfidence,
            detectionTime: data.detectionTimeMs,
          });

          // Stop polling if call is completed or failed
          if (data.status === 'completed' || data.status === 'failed') {
            setIsActive(false);
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Failed to fetch call status:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [activeCallId]);

  if (!callStatus) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Call Monitor
          </CardTitle>
          <CardDescription>
            Real-time call status and AMD detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No active calls</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (callStatus.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'failed':
      case 'no_answer':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'in_progress':
      case 'ringing':
        return <Radio className="h-5 w-5 text-accent animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getAmdResultDisplay = () => {
    if (!callStatus.amdResult) return null;

    const colors: Record<string, string> = {
      human: 'bg-success text-success-foreground',
      machine: 'bg-destructive text-destructive-foreground',
      voicemail: 'bg-destructive text-destructive-foreground',
      undecided: 'bg-warning text-warning-foreground',
      unknown: 'bg-muted text-muted-foreground',
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">AMD Result</span>
          <Badge className={colors[callStatus.amdResult] || ''}>
            {callStatus.amdResult.toUpperCase()}
          </Badge>
        </div>
        
        {callStatus.confidence !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="text-sm font-mono font-medium">
              {(callStatus.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}
        
        {callStatus.detectionTime !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Detection Time</span>
            <span className="text-sm font-mono font-medium">
              {callStatus.detectionTime}ms
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Call Monitor
        </CardTitle>
        <CardDescription>
          {isActive ? 'Call in progress...' : 'Last call completed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Call ID</span>
            <span className="text-sm font-mono">{callStatus.callId.slice(0, 8)}...</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={callStatus.status === 'completed' ? 'default' : 'secondary'}>
              {callStatus.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {callStatus.amdResult && (
          <div className="pt-3 border-t border-border">
            {getAmdResultDisplay()}
          </div>
        )}

        {isActive && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Monitoring call status...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
