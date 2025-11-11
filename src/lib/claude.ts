const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_API_BASE = "https://api.anthropic.com/v1/messages"

if (!CLAUDE_API_KEY) {
  console.warn("[claude] Missing CLAUDE_API_KEY environment variable")
}

type ClaudeTextBlock = {
  type: "text"
  text: string
}

export type ClaudeMessage = {
  role: "user" | "assistant"
  content: string | ClaudeTextBlock[]
}

export type ClaudeRequest = {
  system?: string
  messages: ClaudeMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
}

export async function callClaude(payload: ClaudeRequest) {
  if (!CLAUDE_API_KEY) {
    throw new Error("Claude API key is not configured")
  }

  const response = await fetch(CLAUDE_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify((() => {
      const { max_tokens, messages, ...rest } = payload
      return {
        model: "claude-sonnet-4-5-20250929",
        ...rest,
        max_tokens: max_tokens ?? 800,
        messages: messages.map((message) => ({
          ...message,
          content: typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content,
        })),
      }
    })()),
  })
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Claude API error (${response.status}): ${errorBody}`)
  }

  return response.json()
}
