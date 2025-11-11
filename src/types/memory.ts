export type ClaudeMemory = {
  summary?: string
  highlights?: Array<{
    label: string
    detail: string
    timestamp: string
  }>
  lastUpdated?: string
}
