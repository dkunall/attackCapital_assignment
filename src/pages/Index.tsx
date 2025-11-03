import { useState } from 'react';
import { DialerForm } from '@/components/DialerForm';
import { CallStatusMonitor } from '@/components/CallStatusMonitor';
import { CallHistory } from '@/components/CallHistory';
import { Phone, Activity, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [activeCallId, setActiveCallId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Phone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AMD Telephony System
                </h1>
                <p className="text-sm text-muted-foreground">
                  Advanced Answering Machine Detection
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 text-accent" />
                <span>Real-time Detection</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Dialer */}
          <div className="lg:col-span-2">
            <DialerForm onCallInitiated={setActiveCallId} />
          </div>
          
          {/* Status Monitor */}
          <div>
            <CallStatusMonitor activeCallId={activeCallId} />
          </div>
        </div>

        {/* Tabs for History and Analytics */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="history" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Call History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="mt-6">
            <CallHistory />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="rounded-lg border border-border/50 bg-card/50 p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Strategy comparison, accuracy metrics, and performance analysis coming soon.
                Track detection rates, latency, and cost per strategy.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="rounded-lg border border-border/50 bg-card/30 p-4">
            <h3 className="font-semibold text-sm mb-2 text-accent">Multi-Strategy Detection</h3>
            <p className="text-xs text-muted-foreground">
              Choose from 4 AMD strategies: Twilio Native, Jambonz SIP, Hugging Face ML, and Gemini Flash
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/30 p-4">
            <h3 className="font-semibold text-sm mb-2 text-success">Real-Time Processing</h3>
            <p className="text-xs text-muted-foreground">
              Sub-3-second detection latency with streaming audio analysis and live status updates
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/30 p-4">
            <h3 className="font-semibold text-sm mb-2 text-warning">Comprehensive Logging</h3>
            <p className="text-xs text-muted-foreground">
              PostgreSQL-backed call logs with confidence scores, timing data, and export capabilities
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Twilio, Prisma, and cutting-edge AI models</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
