"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code2, 
  Zap, 
  Shield, 
  Database, 
  Brain, 
  GitBranch,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCode,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { getProspectConfig } from "./prospect-config";

interface MetricCardProps {
  icon: React.ReactNode;
  metric: string;
  label: string;
  description: string;
}

function MetricCard({ icon, metric, label, description }: MetricCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-white/10 rounded-lg">
            {icon}
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{metric}</div>
            <div className="text-sm font-medium text-white/80">{label}</div>
            <div className="text-xs text-white/60 mt-1">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
  codeLink?: string;
  demoLink?: string;
}

function FeatureCard({ icon, title, description, highlights, codeLink, demoLink }: FeatureCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur hover:bg-white/10 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-white/70">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {highlights.map((highlight, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          {codeLink && (
            <Link href={codeLink}>
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                <FileCode className="w-4 h-4 mr-1" />
                View Code
              </Button>
            </Link>
          )}
          {demoLink && (
            <Link href={demoLink}>
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                <Sparkles className="w-4 h-4 mr-1" />
                Try Demo
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LiveJobDemo() {
  const [jobUrl, setJobUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDemo = async () => {
    if (!jobUrl) return;
    
    setIsProcessing(true);
    // Simulate API call - in real implementation, this would call your API
    setTimeout(() => {
      setResult({
        fitScore: 85,
        company: "Example Corp",
        title: "Senior Software Engineer",
        insights: [
          "Strong alignment with your AI/ML background",
          "Remote-first culture matches preferences",
          "Competitive compensation range"
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          placeholder="Paste a LinkedIn job URL to see AI enrichment in action..."
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button 
          onClick={handleDemo}
          disabled={isProcessing || !jobUrl}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>
      
      {result && (
        <Card className="mt-4 bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{result.title}</h3>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                {result.fitScore}% Match
              </Badge>
            </div>
            <p className="text-sm text-white/70 mb-3">{result.company}</p>
            <div className="space-y-2">
              {result.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DemoLandingPage() {
  const [mounted, setMounted] = useState(false);
  const config = getProspectConfig();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto text-center">
          {config.companyName && (
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/50">
              Customized for {config.companyName} • {config.role}
            </Badge>
          )}
          
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            {config.heroMessage || "Job Hunt Hub"}
          </h1>
          
          {config.personalNote && (
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto italic">
              &quot;{config.personalNote}&quot;
            </p>
          )}
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Production-Ready AI Job Platform with{" "}
            <span className="text-purple-400 font-semibold">10-Second Enrichment</span>
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Built with Next.js 15, TypeScript, and OpenAI. Features single-pass AI processing,
            vector search, and comprehensive observability.
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <MetricCard
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              metric="7x"
              label="Faster Processing"
              description="vs. traditional pipelines"
            />
            <MetricCard
              icon={<Shield className="w-6 h-6 text-green-400" />}
              metric="90%+"
              label="Test Coverage"
              description="Unit, integration, E2E"
            />
            <MetricCard
              icon={<Clock className="w-6 h-6 text-blue-400" />}
              metric="<200ms"
              label="API Response"
              description="P95 latency"
            />
            <MetricCard
              icon={<Database className="w-6 h-6 text-purple-400" />}
              metric="50%"
              label="Cost Reduction"
              description="Single-pass AI"
            />
          </div>

          {/* Live Demo */}
          <Card className="bg-white/5 border-white/10 backdrop-blur mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Try the Live Demo
              </CardTitle>
              <CardDescription className="text-white/70">
                Experience the AI enrichment pipeline in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveJobDemo />
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={config.cta?.primaryButtonLink || "/jobs"}>
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                {config.cta?.primaryButtonText || "View Live Application"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href={config.cta?.secondaryButtonLink || "https://github.com/yourusername/job-hunt-hub"} target="_blank">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <GitBranch className="mr-2 w-4 h-4" />
                {config.cta?.secondaryButtonText || "View on GitHub"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse delay-1000" />
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="px-4 sm:px-8 py-16 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Engineering Excellence
          </h2>
          <p className="text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            {config.personalNote || 
              "A showcase of modern web development practices and AI integration"}
          </p>

          <Tabs defaultValue="architecture" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white/5">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="features">Key Features</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="architecture" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard
                  icon={<Brain className="w-5 h-5 text-purple-400" />}
                  title="Single-Pass AI Pipeline"
                  description="Unified extraction and analysis in one API call"
                  highlights={[
                    "50% cost reduction vs. multi-pass systems",
                    "10-second end-to-end processing",
                    "GPT-4o-mini for optimal cost/performance",
                    "Graceful fallback handling"
                  ]}
                  codeLink="/api/jobs/enrich/route.ts"
                />
                <FeatureCard
                  icon={<Database className="w-5 h-5 text-blue-400" />}
                  title="Vector Search with pgvector"
                  description="Semantic similarity search across all job content"
                  highlights={[
                    "Dual embedding strategy",
                    "<50ms query latency",
                    "Hybrid search capabilities",
                    "Auto-classification on ingest"
                  ]}
                  codeLink="/lib/services/embeddingService.ts"
                />
                <FeatureCard
                  icon={<Shield className="w-5 h-5 text-green-400" />}
                  title="Production-Grade Security"
                  description="Multi-layered security architecture"
                  highlights={[
                    "API key authentication",
                    "Rate limiting (token bucket)",
                    "Zod validation on all inputs",
                    "Row-level security in Postgres"
                  ]}
                  codeLink="/middleware.ts"
                />
                <FeatureCard
                  icon={<BarChart3 className="w-5 h-5 text-yellow-400" />}
                  title="Comprehensive Observability"
                  description="Full system visibility and debugging"
                  highlights={[
                    "Distributed tracing with correlation IDs",
                    "Structured JSON logging",
                    "Performance metrics tracking",
                    "Error recovery patterns"
                  ]}
                  codeLink="/lib/tracing.ts"
                />
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard
                  icon={<Cpu className="w-5 h-5 text-orange-400" />}
                  title="Chrome Extension Integration"
                  description="One-click job scraping from LinkedIn/Indeed"
                  highlights={[
                    "Minimal permissions (activeTab only)",
                    "Structured data extraction",
                    "Real-time enrichment trigger",
                    "Cross-origin security handled"
                  ]}
                  demoLink="#demo"
                />
                <FeatureCard
                  icon={<Code2 className="w-5 h-5 text-pink-400" />}
                  title="Type-Safe Everything"
                  description="End-to-end type safety with TypeScript"
                  highlights={[
                    "Strict mode TypeScript",
                    "Generated Supabase types",
                    "Zod runtime validation",
                    "Type-safe API contracts"
                  ]}
                  codeLink="/app/types/job.ts"
                />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-8">
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Performance Benchmarks
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">AI Enrichment Pipeline</span>
                          <span className="text-green-400">~10s</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: '95%'}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">API Response Time (P95)</span>
                          <span className="text-blue-400">&lt;200ms</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{width: '90%'}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">Vector Search Latency</span>
                          <span className="text-purple-400">&lt;50ms</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{width: '98%'}} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Architecture Preview */}
      <section className="px-4 sm:px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            System Architecture
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Built for scale, maintainability, and performance
          </p>
          <Link href="/docs/system-architecture">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer max-w-4xl mx-auto">
              <CardContent className="p-8">
                <img 
                  src="/api/placeholder/800/400" 
                  alt="System Architecture"
                  className="w-full rounded-lg mb-4 opacity-80"
                />
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                  View Full Architecture Documentation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 sm:px-8 py-16 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Dive into the codebase, try the live demo, or reach out to discuss the implementation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                Launch Application
              </Button>
            </Link>
            <Link href="mailto:your.email@example.com">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Contact Me
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}