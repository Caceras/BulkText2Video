"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VoiceSelector } from "@/components/VoiceSelector";

interface AgentSummary {
  agent_id: string;
  name: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Create agent form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, systemPrompt, firstMessage, voiceId: voiceId || undefined }),
      });
      if (res.ok) {
        setShowCreate(false);
        setName("");
        setSystemPrompt("");
        setFirstMessage("");
        setVoiceId("");
        fetchAgents();
      }
    } catch (err) {
      console.error("Create agent failed:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      fetchAgents();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Conversational AI Agents</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          Create Agent
        </button>
      </div>

      {/* Create Agent Form */}
      {showCreate && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">New Agent</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agent name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="System prompt (e.g. 'You are a helpful customer service agent for Acme Corp...')"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="First message (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <VoiceSelector
            label="Agent Voice"
            value={voiceId}
            onChange={(id) => setVoiceId(id)}
          />
          <button
            onClick={handleCreate}
            disabled={!name || !systemPrompt || creating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm rounded-lg"
          >
            {creating ? "Creating..." : "Create Agent"}
          </button>
        </div>
      )}

      {/* Agent List */}
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading agents...</p>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No agents yet</p>
          <p className="mt-1">Create your first conversational AI agent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.agent_id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <Link
                href={`/agents/${agent.agent_id}`}
                className="flex-1 min-w-0"
              >
                <p className="text-white font-medium">{agent.name}</p>
                <p className="text-xs text-gray-500 font-mono">{agent.agent_id}</p>
              </Link>
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/agents/${agent.agent_id}`}
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(agent.agent_id)}
                  className="px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
