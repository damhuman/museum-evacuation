"use client";

import { motion } from "framer-motion";

const agents = [
  { id: "orchestrator", label: "Оркестратор", icon: "⚡" },
  { id: "triage", label: "Тріаж", icon: "🔴" },
  { id: "packing", label: "Пакування", icon: "📦" },
  { id: "logistics", label: "Логістика", icon: "🚛" },
];

interface AgentPipelineProps {
  activeAgent: string | null;
  completedAgents: string[];
}

export function AgentPipeline({ activeAgent, completedAgents }: AgentPipelineProps) {
  if (!activeAgent && completedAgents.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="border-b border-border bg-surface/50 px-4 py-3"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-1 overflow-x-auto">
        <span className="text-[10px] uppercase tracking-widest text-text-muted mr-2 flex-shrink-0">
          Pipeline
        </span>
        {agents.map((agent, i) => {
          const isActive = activeAgent === agent.id;
          const isCompleted = completedAgents.includes(agent.id);
          const isPending = !isActive && !isCompleted;

          return (
            <div key={agent.id} className="flex items-center">
              {i > 0 && (
                <div className={`w-4 sm:w-6 h-px mx-0.5 ${isCompleted || isActive ? "bg-accent" : "bg-border"}`} />
              )}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-accent-soft text-accent font-medium ring-1 ring-accent/30"
                    : isCompleted
                    ? "bg-success-soft text-success"
                    : isPending
                    ? "text-text-muted"
                    : ""
                }`}
              >
                <span className="text-xs">{agent.icon}</span>
                <span className="hidden sm:inline">{agent.label}</span>
                {isActive && (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-accent" style={{ animation: "pulse-dot 1.2s infinite 0s" }} />
                    <span className="w-1 h-1 rounded-full bg-accent" style={{ animation: "pulse-dot 1.2s infinite 0.2s" }} />
                    <span className="w-1 h-1 rounded-full bg-accent" style={{ animation: "pulse-dot 1.2s infinite 0.4s" }} />
                  </span>
                )}
                {isCompleted && <span className="text-success">✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
