import { useState, useCallback } from "react";
import { Layout } from "~/components/layout/Layout";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Knob } from "~/components/audio/Knob";
import { Button } from "~/components/ui/button";
import { Power } from "lucide-react";

const initialNodes: Node[] = [
  {
    id: "input",
    type: "input",
    data: { label: "Audio Input" },
    position: { x: 50, y: 200 },
    style: { background: "#06b6d4", color: "white", border: "2px solid #0891b2" },
  },
  {
    id: "filter",
    data: { label: "SVF Filter", type: "filter" },
    position: { x: 250, y: 100 },
    style: { background: "#3b82f6", color: "white", border: "2px solid #2563eb" },
  },
  {
    id: "delay",
    data: { label: "Stereo Delay", type: "delay" },
    position: { x: 250, y: 250 },
    style: { background: "#8b5cf6", color: "white", border: "2px solid #7c3aed" },
  },
  {
    id: "reverb",
    data: { label: "Plate Reverb", type: "reverb" },
    position: { x: 500, y: 175 },
    style: { background: "#ec4899", color: "white", border: "2px solid #db2777" },
  },
  {
    id: "output",
    type: "output",
    data: { label: "Audio Output" },
    position: { x: 750, y: 200 },
    style: { background: "#10b981", color: "white", border: "2px solid #059669" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "input", target: "filter", animated: true },
  { id: "e2", source: "input", target: "delay", animated: true },
  { id: "e3", source: "filter", target: "reverb", animated: true },
  { id: "e4", source: "delay", target: "reverb", animated: true },
  { id: "e5", source: "reverb", target: "output", animated: true },
];

export default function EffectsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Effect parameters state
  const [filterParams, setFilterParams] = useState({ cutoff: 1000, resonance: 0.7, type: 0 });
  const [delayParams, setDelayParams] = useState({ time: 0.375, feedback: 0.4, mix: 0.3 });
  const [reverbParams, setReverbParams] = useState({ roomSize: 0.7, damping: 0.5, mix: 0.25 });

  const renderEffectControls = (): React.ReactNode => {
    if (!selectedNode || selectedNode.type === "input" || selectedNode.type === "output") {
      return (
        <div className="text-center text-zinc-500 py-8">
          Select an effect node to edit parameters
        </div>
      );
    }

    const effectType = selectedNode.data.type as string;

    switch (effectType) {
      case "filter":
        return (
          <div className="space-y-6">
            <div className="flex justify-around">
              <Knob
                value={filterParams.cutoff}
                onChange={(v) => setFilterParams({ ...filterParams, cutoff: v })}
                min={20}
                max={20000}
                label="Cutoff"
                valueDisplay={(v) => `${v.toFixed(0)}Hz`}
              />
              <Knob
                value={filterParams.resonance}
                onChange={(v) => setFilterParams({ ...filterParams, resonance: v })}
                min={0}
                max={1}
                label="Resonance"
                valueDisplay={(v) => v.toFixed(2)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">Filter Type</label>
              <div className="grid grid-cols-3 gap-2">
                {["Low Pass", "High Pass", "Band Pass"].map((type, idx) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={filterParams.type === idx ? "secondary" : "outline"}
                    onClick={() => setFilterParams({ ...filterParams, type: idx })}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case "delay":
        return (
          <div className="space-y-6">
            <div className="flex justify-around">
              <Knob
                value={delayParams.time}
                onChange={(v) => setDelayParams({ ...delayParams, time: v })}
                min={0}
                max={2}
                label="Time"
                valueDisplay={(v) => `${(v * 1000).toFixed(0)}ms`}
              />
              <Knob
                value={delayParams.feedback}
                onChange={(v) => setDelayParams({ ...delayParams, feedback: v })}
                min={0}
                max={0.95}
                label="Feedback"
                valueDisplay={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Knob
                value={delayParams.mix}
                onChange={(v) => setDelayParams({ ...delayParams, mix: v })}
                min={0}
                max={1}
                label="Mix"
                valueDisplay={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
          </div>
        );

      case "reverb":
        return (
          <div className="space-y-6">
            <div className="flex justify-around">
              <Knob
                value={reverbParams.roomSize}
                onChange={(v) => setReverbParams({ ...reverbParams, roomSize: v })}
                min={0}
                max={1}
                label="Room Size"
                valueDisplay={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Knob
                value={reverbParams.damping}
                onChange={(v) => setReverbParams({ ...reverbParams, damping: v })}
                min={0}
                max={1}
                label="Damping"
                valueDisplay={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Knob
                value={reverbParams.mix}
                onChange={(v) => setReverbParams({ ...reverbParams, mix: v })}
                min={0}
                max={1}
                label="Mix"
                valueDisplay={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="h-full flex gap-4 p-4 bg-zinc-900">
        {/* React Flow Canvas */}
        <div className="flex-1 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#27272a" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const style = node.style as any;
                return style?.background || "#3b82f6";
              }}
              maskColor="rgba(0, 0, 0, 0.5)"
            />
          </ReactFlow>
        </div>

        {/* Effect Controls Panel */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Effect Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-zinc-500">
                Click on effect nodes to edit parameters
              </div>
              <div className="space-y-1">
                {initialNodes
                  .filter((n) => n.type !== "input" && n.type !== "output")
                  .map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800"
                    >
                      <span className="text-sm">{(node.data as { label: string }).label}</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Power className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle>{(selectedNode.data as { label: string }).label}</CardTitle>
              </CardHeader>
              <CardContent>{renderEffectControls()}</CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
