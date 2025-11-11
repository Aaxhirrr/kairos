import { prisma } from "@/lib/prisma"
import type { ClaudeMemory } from "@/types/memory"

export async function getUserMemory(userId: string): Promise<ClaudeMemory | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { claudeMemory: true },
  })

  if (!user?.claudeMemory) return null
  return user.claudeMemory as ClaudeMemory
}

export async function saveUserMemory(userId: string, memory: ClaudeMemory) {
  const payload: ClaudeMemory = {
    ...memory,
    lastUpdated: memory.lastUpdated ?? new Date().toISOString(),
  }

  await prisma.user.update({
    where: { id: userId },
    data: { claudeMemory: payload },
  })

  return payload
}
