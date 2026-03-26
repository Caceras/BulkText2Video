"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editFirstMsg, setEditFirstMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Simulate state
  const [simMessage, setSimMessage] = useState("");
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Knowledge upload state
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        const data = await res.json();
        setAgent(data);
        setEditName((data.name as string) || "");
        const convConfig = data.conversation_config as Record<string, unknown> || {};
        const agentConfig = convConfig.agent as Record<string, unknown> || {};
        const prompt = agentConfig.prompt as Record<string, unknown> || {};
        setEditPrompt((prompt.prompt as string) || "");
        setEditFirstMsg((agentConfig.first_message as string) || "");
      } catch (err) {
        console.error("Failed to fetch agent:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [agentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          systemPrompt: editPrompt,
          firstMessage: editFirstMsg,
        }),
      });
      setEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [simMessage] }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleKnowledgeUpload = async () => {
    if (!knowledgeFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", knowledgeFile);
      formData.append("name", knowledgeFile.name);
      await fetch(`/api/agents/${agentId}/knowledge`, {
        method: "POST",
        body: formData,
      });
      setKnowledgeFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <p className="text-gray-400 text-center py-20">Loading agent...</p>;
  }

  if (!agent) {
    return <p className="text-red-400 text-center py-20">Agent not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/agents" className="text-sm text-gray-400 hover:text-gray-300">
        &larr; Back to Agents
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{editName || "Agent"}</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Agent name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="System prompt"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <input
            type="text"
            value={editFirstMsg}
            onChange={(e) => setEditFirstMsg(e.target.value)}
            placeholder="First message"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm rounded-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Knowledge Base */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Knowledge Base</h2>
        <p className="text-sm text-gray-400">Upload documents to give your agent context.</p>
        <div className="flex gap-3">
          <input
            type="file"
            onChange={(e) => setKnowledgeFile(e.target.files?.[0] || null)}
            className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
          />
          <button
            onClick={handleKnowledgeUpload}
            disabled={!knowledgeFile || uploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm rounded-lg"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Test Conversation */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">Test Conversation</h2>
        <p className="text-sm text-gray-400">Simulate a conversation with your agent.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={simMessage}
            onChange={(e) => setSimMessage(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
          />
          <button
            onClick={handleSimulate}
            disabled={!simMessage.trim() || simulating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm rounded-lg"
          >
            {simulating ? "..." : "Send"}
          </button>
        </div>
        {simResult && (
          <pre className="p-4 bg-gray-800 rounded-lg text-xs text-gray-300 overflow-auto max-h-64">
            {JSON.stringify(simResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Raw Config */}
      <details className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <summary className="text-sm text-gray-400 cursor-pointer">Raw Agent Config</summary>
        <pre className="mt-4 text-xs text-gray-500 overflow-auto max-h-64">
          {JSON.stringify(agent, null, 2)}
        </pre>
      </details>
    </div>
  );
}
