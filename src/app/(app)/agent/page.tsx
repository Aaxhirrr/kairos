import AgentClient from "./agent-client"

export const metadata = {
  title: "Agent · Kairos",
  description: "Chat with your Claude-powered copilot across markets, alerts, and data hygiene.",
}

export default function AgentPage() {
  return (
    <div className="space-y-6">
      <AgentClient />
    </div>
  )
}
