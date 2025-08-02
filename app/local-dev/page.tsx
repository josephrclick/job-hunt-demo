interface ServiceInfo {
  port: number;
  icon: string;
  title: string;
  description: string;
  note: string;
  url: string;
}

export default function LocalDevPortal() {
  const supabaseServices: ServiceInfo[] = [
    {
      port: 54321,
      icon: "🔌",
      title: "Supabase API Gateway",
      description: "Main API endpoint for all Supabase operations",
      note: "Edge Functions accessible at /functions/v1/*",
      url: "http://localhost:54321"
    },
    {
      port: 54322,
      icon: "🗄️",
      title: "PostgreSQL Database",
      description: "Direct database connection",
      note: "Used by scripts for seeding and maintenance",
      url: "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    },
    {
      port: 54323,
      icon: "🎛️",
      title: "Supabase Studio (Web UI)",
      description: "Database management interface",
      note: "Your primary development dashboard",
      url: "http://localhost:54323"
    },
    {
      port: 54324,
      icon: "📧",
      title: "Inbucket Email Testing",
      description: "Captures emails sent during development",
      note: "Web interface for viewing test emails",
      url: "http://localhost:54324"
    },
    {
      port: 54320,
      icon: "🌑",
      title: "Shadow Database Port",
      description: "Used by supabase db diff for migrations",
      note: "",
      url: "http://localhost:54320"
    },
    {
      port: 54327,
      icon: "📊",
      title: "Database Metrics",
      description: "Database performance monitoring",
      note: "",
      url: "http://localhost:54327"
    },
    {
      port: 54329,
      icon: "🔗",
      title: "Connection Pooler",
      description: "Database connection management",
      note: "",
      url: "http://localhost:54329"
    },
    {
      port: 8083,
      icon: "🔍",
      title: "Database Inspector",
      description: "Advanced database inspection tools",
      note: "",
      url: "http://localhost:8083"
    }
  ];

  const mcpServices: ServiceInfo[] = [
    {
      port: 8765,
      icon: "🧠",
      title: "OpenMemory MCP Server",
      description: "Model Context Protocol memory service",
      note: "SSE endpoint: http://localhost:8765/mcp/claude/sse/joe",
      url: "http://localhost:8765"
    }
  ];

  const dockerServices: ServiceInfo[] = [
    {
      port: 8000,
      icon: "🐳",
      title: "Kong Gateway (Internal Docker)",
      description: "Used for pg_cron internal function calls",
      note: "Reference: http://kong:8000/functions/v1",
      url: "http://localhost:8000"
    },
    {
      port: 8080,
      icon: "🌐",
      title: "General HTTP Services",
      description: "Various HTTP services",
      note: "",
      url: "http://localhost:8080"
    }
  ];

  const ServiceCard = ({ service }: { service: ServiceInfo }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{service.icon}</span>
          <span className="font-mono text-sm text-gray-500">Port {service.port}</span>
        </div>
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          Open
        </a>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{service.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
      {service.note && (
        <p className="text-xs text-gray-500 dark:text-gray-500 italic">{service.note}</p>
      )}
      <p className="text-xs font-mono text-gray-400 dark:text-gray-600 mt-2 break-all">{service.url}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Local Development Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quick access to all your localhost development services
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Supabase Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supabaseServices.map((service) => (
              <ServiceCard key={service.port} service={service} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            MCP (Model Context Protocol) Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mcpServices.map((service) => (
              <ServiceCard key={service.port} service={service} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <span className="mr-2">🐳</span>
            Docker/External Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dockerServices.map((service) => (
              <ServiceCard key={service.port} service={service} />
            ))}
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">
          <p>Development portal for Job Hunt Hub local services</p>
        </footer>
      </div>
    </div>
  );
}