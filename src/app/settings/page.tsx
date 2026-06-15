"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your ConnectIQ integrations.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Integrations</h2>
          <p className="text-gray-400 text-sm mb-5">API keys are configured via environment variables in <code className="text-blue-400 bg-gray-900 px-1 rounded">.env.local</code>.</p>
          <div className="space-y-4">
            {[
              { label: "Anthropic API Key", env: "ANTHROPIC_API_KEY", desc: "Powers AI research, scoring, and outreach generation." },
              { label: "HubSpot API Key", env: "HUBSPOT_API_KEY", desc: "Enables syncing prospects to your HubSpot CRM." },
              { label: "OpenAI API Key", env: "OPENAI_API_KEY", desc: "Optional secondary AI provider." },
            ].map((item) => (
              <div key={item.env} className="border border-gray-700 rounded-lg p-4">
                <div className="font-medium text-white text-sm mb-0.5">{item.label}</div>
                <div className="text-xs text-gray-400 mb-2">{item.desc}</div>
                <code className="text-xs text-blue-300 bg-gray-900 px-2 py-1 rounded">{item.env}=&quot;your-key-here&quot;</code>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">About ConnectIQ</h2>
          <p className="text-gray-400 text-sm">v1.0.0 — AI Relationship Intelligence Platform</p>
          <p className="text-gray-500 text-xs mt-2 italic">Turn Business Signals Into Qualified Conversations.</p>
        </div>
      </div>
    </div>
  );
}
