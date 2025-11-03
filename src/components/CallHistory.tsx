import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Download, RefreshCw } from 'lucide-react';
import { AMD_STRATEGIES } from '@/lib/amd-strategies';
import { apiClient, type Call } from '@/lib/api-client';

export function CallHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getCalls();
      setCalls(data);
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Number', 'Strategy', 'Status', 'AMD Result', 'Confidence', 'Detection Time (ms)', 'Duration (s)'];
    const rows = calls.map(call => [
      new Date(call.dialedAt).toLocaleString(),
      call.targetNumber,
      AMD_STRATEGIES.find(s => s.type === call.amdStrategy)?.name || call.amdStrategy,
      call.status,
      call.amdResult || 'N/A',
      call.amdConfidence ? `${(call.amdConfidence * 100).toFixed(1)}%` : 'N/A',
      call.detectionTimeMs || 'N/A',
      call.duration || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      in_progress: 'secondary',
      failed: 'destructive',
      no_answer: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getAmdResultBadge = (result: string | null) => {
    if (!result) return <Badge variant="outline">N/A</Badge>;

    const colors: Record<string, string> = {
      human: 'bg-success text-success-foreground',
      machine: 'bg-destructive text-destructive-foreground',
      voicemail: 'bg-destructive text-destructive-foreground',
      undecided: 'bg-warning text-warning-foreground',
      unknown: 'bg-muted text-muted-foreground',
    };

    return (
      <Badge className={colors[result] || 'bg-muted text-muted-foreground'}>
        {result}
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-accent" />
              Call History
            </CardTitle>
            <CardDescription>
              View and analyze past call detection results
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCallHistory}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={calls.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No calls yet</p>
            <p className="text-sm">
              Initiate your first call to see detection results here
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={loadCallHistory}
            >
              Load History
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AMD Result</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                  <TableHead className="text-right">Detection (ms)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(call.dialedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">{call.targetNumber}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {AMD_STRATEGIES.find(s => s.type === call.amdStrategy)?.name || call.amdStrategy}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(call.status)}</TableCell>
                    <TableCell>{getAmdResultBadge(call.amdResult)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {call.amdConfidence ? `${(call.amdConfidence * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {call.detectionTimeMs || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
