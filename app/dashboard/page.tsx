import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full h-screen flex flex-col p-4">
      {/* Split Layout: 60% Metrics, 40% Chatbot */}
      <div className="flex gap-4">
        {/* Left Side - Metrics Panel (60% width) - Fixed height */}
        <div className="flex-[0.6] h-[660px] overflow-y-auto">
          <MetricsPanel />
        </div>

        {/* Right Side - AI Chat Interface (40% width) - Fixed height */}
        <div className="flex-[0.4] h-[660px] flex flex-col">
          <div className="flex-shrink-0 pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">AI Job Assistant</h2>
            </div>
          </div>
          {/* ChatInterface fills remaining space (660px - title height) */}
          <div className="flex-1 min-h-0">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
