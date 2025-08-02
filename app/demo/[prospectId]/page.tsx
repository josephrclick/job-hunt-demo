"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Database, 
  GitBranch,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCode
} from "lucide-react";
import Link from "next/link";
import { getProspectConfig, ProspectConfig } from "../prospects";

interface DemoLandingPageProps {
  params: Promise<{
    prospectId: string;
  }>;
}

// Component implementations remain the same...
function MetricCard({ icon, metric, label, description }: any) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="text-3xl font-bold text-white">{metric}</div>
        <div className="text-sm font-medium text-white/80">{label}</div>
        <div className="text-xs text-white/60 mt-1">{description}</div>
        <div className="p-2 bg-white/10 rounded-lg mt-4">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, description, highlights, codeLink, demoLink }: any) {
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
          {highlights.map((highlight: string, idx: number) => (
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


export default function DemoLandingPage({ params: paramsPromise }: DemoLandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<ProspectConfig | null>(null);

  useEffect(() => {
    setMounted(true);
    paramsPromise.then(params => {
      const prospectConfig = getProspectConfig(params.prospectId);
      if (!prospectConfig) {
        notFound();
      }
      setConfig(prospectConfig);
    });
  }, [paramsPromise]);

  if (!mounted || !config) return null;

  // Apply custom theme if provided
  const bgGradient = config.theme?.gradientFrom && config.theme?.gradientTo
    ? `bg-gradient-to-br from-[${config.theme.gradientFrom}] to-[${config.theme.gradientTo}]`
    : "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900";

  return (
    <div className={`min-h-screen ${bgGradient}`}>
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
          
          {/* Show context if referencing a conversation */}
          {config.context?.referencedConversation && (
            <p className="text-lg text-purple-300 mb-4">
              {config.context.referencedConversation}
            </p>
          )}
                    
          {/* Relevant experience if provided */}
          {config.context?.relevantExperience && (
            <div className="mt-8 mb-12 max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Relevant Experience</h3>
              <div className="space-y-2">
                {config.context.relevantExperience.map((exp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-left text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <MetricCard
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              metric="One Click"
              label="Job Scraping"
              description="Scrape multiple job posts with ease"
            />
            <MetricCard
              icon={<Shield className="w-6 h-6 text-green-400" />}
              metric="AI-Powered"
              label="Smart Enrichment"
              description="OpenAI analyzes fit with resume & preferences"
            />
            <MetricCard
              icon={<Clock className="w-6 h-6 text-blue-400" />}
              metric="Personal"
              label="Dashboard"
              description="Track enriched data & AI-generated insights"
            />
            <MetricCard
              icon={<Database className="w-6 h-6 text-purple-400" />}
              metric="10x Less"
              label="Time Spent"
              description="Finding, vetting & targeting ideal roles"
            />
          </div>


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Access Demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href={config.cta?.secondaryButtonLink || "https://github.com/josephrclick/click-capture-v2"} target="_blank">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <GitBranch className="mr-2 w-4 h-4" />
                {config.cta?.secondaryButtonText || "View on GitHub"}
              </Button>
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}