import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2, AlertCircle } from 'lucide-react';
import { AMD_STRATEGIES, type AmdStrategyType } from '@/lib/amd-strategies';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DialerFormProps {
  onCallInitiated?: (callId: string) => void;
}

export function DialerForm({ onCallInitiated }: DialerFormProps) {
  const { toast } = useToast();
  const [targetNumber, setTargetNumber] = useState('');
  const [amdStrategy, setAmdStrategy] = useState<AmdStrategyType>('twilio_native');
  const [isDialing, setIsDialing] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleDial = async () => {
    if (!targetNumber || targetNumber.replace(/\D/g, '').length !== 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Number',
        description: 'Please enter a valid 10-digit US phone number',
      });
      return;
    }

    setIsDialing(true);

    try {
      const data = await apiClient.dial(
        `+1${targetNumber.replace(/\D/g, '')}`,
        amdStrategy
      );

      toast({
        title: 'Call Initiated',
        description: `Dialing ${formatPhoneNumber(targetNumber)} with ${AMD_STRATEGIES.find(s => s.type === amdStrategy)?.name}`,
      });

      onCallInitiated?.(data.callId);
      setTargetNumber('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Dial Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsDialing(false);
    }
  };

  const selectedStrategy = AMD_STRATEGIES.find(s => s.type === amdStrategy);

  return (
    <Card className="bg-gradient-card border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-accent" />
          Outbound Dialer
        </CardTitle>
        <CardDescription>
          Initiate calls with advanced answering machine detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-warning/10 border-warning/30">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <strong>Demo Mode:</strong> This UI demonstrates the AMD system architecture. 
            To enable actual calling, implement the backend with Supabase Edge Functions or migrate to Next.js 14+.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label htmlFor="targetNumber">Target Number</Label>
          <Input
            id="targetNumber"
            type="tel"
            placeholder="555-123-4567"
            value={targetNumber}
            onChange={(e) => setTargetNumber(formatPhoneNumber(e.target.value))}
            maxLength={12}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            US toll-free numbers supported
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amdStrategy">AMD Strategy</Label>
          <Select value={amdStrategy} onValueChange={(value) => setAmdStrategy(value as AmdStrategyType)}>
            <SelectTrigger id="amdStrategy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AMD_STRATEGIES.map((strategy) => (
                <SelectItem key={strategy.type} value={strategy.type}>
                  <div className="flex flex-col">
                    <span className="font-medium">{strategy.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {strategy.latency} • {strategy.accuracy}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedStrategy && (
            <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
              <p className="text-sm font-medium text-secondary-foreground">
                {selectedStrategy.description}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>⏱️ {selectedStrategy.latency}</span>
                <span>🎯 {selectedStrategy.accuracy}</span>
                <span>💰 {selectedStrategy.cost}</span>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleDial}
          disabled={isDialing || !targetNumber}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all"
          size="lg"
        >
          {isDialing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Dialing...
            </>
          ) : (
            <>
              <Phone className="mr-2 h-4 w-4" />
              Dial Now
            </>
          )}
        </Button>

        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Test Numbers:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setTargetNumber('1-800-774-2678')}
            >
              Costco
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setTargetNumber('1-800-806-6453')}
            >
              Nike
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setTargetNumber('1-888-221-1161')}
            >
              PayPal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
