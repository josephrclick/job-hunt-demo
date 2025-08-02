"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Building2, User } from "lucide-react";
import { getActiveProspectIds, PROSPECTS } from "../prospects";

export default function DemoDirectory() {
  const activeIds = getActiveProspectIds();
  const activeProspects = activeIds.map(id => PROSPECTS[id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Demo Directory</h1>
        <p className="text-gray-400 mb-8">Manage all your personalized prospect demos</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProspects.map((prospect) => (
            <Card key={prospect.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {prospect.companyName || "Generic Demo"}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {prospect.role || prospect.industry}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={prospect.companyType === "enterprise" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {prospect.companyType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {prospect.contactName && (
                    <div className="flex items-center gap-2 text-white/80">
                      <User className="w-4 h-4" />
                      <span>{prospect.contactName}</span>
                    </div>
                  )}
                  {prospect.team && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Building2 className="w-4 h-4" />
                      <span>{prospect.team}</span>
                    </div>
                  )}
                  {prospect.expiresAt && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(prospect.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/demo/${prospect.id}`} className="flex-1">
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      View Demo
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/demo/${prospect.id}`
                      );
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
                
                {/* Show which features are highlighted */}
                <div className="flex flex-wrap gap-1">
                  {prospect.highlightFeatures.aiPipeline && (
                    <Badge variant="outline" className="text-xs">AI</Badge>
                  )}
                  {prospect.highlightFeatures.vectorSearch && (
                    <Badge variant="outline" className="text-xs">Vector</Badge>
                  )}
                  {prospect.focusAreas.security && (
                    <Badge variant="outline" className="text-xs">Security</Badge>
                  )}
                  {prospect.highlightFeatures.costOptimization && (
                    <Badge variant="outline" className="text-xs">Cost</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">How to Add New Prospects</h2>
          <ol className="text-left max-w-2xl mx-auto space-y-2 text-gray-300">
            <li>1. Edit <code className="text-purple-400">app/demo/prospects.ts</code></li>
            <li>2. Add a new entry to the PROSPECTS object with a unique ID</li>
            <li>3. Customize the configuration for the specific company/role</li>
            <li>4. Deploy to Vercel (auto-deploys on push)</li>
            <li>5. Share the unique URL: <code className="text-purple-400">/demo/[prospect-id]</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}