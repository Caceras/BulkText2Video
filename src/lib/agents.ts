import { getElevenLabsClient } from "./elevenlabs";

export async function createAgent(config: {
  name: string;
  systemPrompt: string;
  firstMessage?: string;
  voiceId?: string;
}) {
  const client = getElevenLabsClient();

  const conversationConfig: Record<string, unknown> = {
    agent: {
      prompt: {
        prompt: config.systemPrompt,
      },
      firstMessage: config.firstMessage || `Hello! I'm ${config.name}. How can I help you?`,
    },
  };

  if (config.voiceId) {
    (conversationConfig.tts as Record<string, unknown>) = {
      voiceId: config.voiceId,
    };
  }

  const result = await client.conversationalAi.agents.create({
    name: config.name,
    conversationConfig,
  });

  return result;
}

export async function listAgents() {
  const client = getElevenLabsClient();
  const result = await client.conversationalAi.agents.list();
  return result;
}

export async function getAgent(agentId: string) {
  const client = getElevenLabsClient();
  const result = await client.conversationalAi.agents.get(agentId);
  return result;
}

export async function updateAgent(
  agentId: string,
  config: { name?: string; systemPrompt?: string; firstMessage?: string }
) {
  const client = getElevenLabsClient();

  const updates: Record<string, unknown> = {};
  if (config.name) updates.name = config.name;
  if (config.systemPrompt || config.firstMessage) {
    updates.conversationConfig = {
      agent: {
        ...(config.systemPrompt && { prompt: { prompt: config.systemPrompt } }),
        ...(config.firstMessage && { firstMessage: config.firstMessage }),
      },
    };
  }

  const result = await client.conversationalAi.agents.update(agentId, updates);
  return result;
}

export async function deleteAgent(agentId: string) {
  const client = getElevenLabsClient();
  await client.conversationalAi.agents.delete(agentId);
}

export async function simulateConversation(agentId: string, messages: string[]) {
  const client = getElevenLabsClient();
  const result = await client.conversationalAi.agents.simulateConversation(agentId, {
    simulationSpecification: {
      simulatedUserConfig: {
        firstMessage: messages[0] || "Hello",
        language: "en",
      },
    },
    newTurnsLimit: 5,
  });
  return result;
}
