'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ConnectionMode,
  MarkerType,
} from '@reactflow/core';
import { Background } from '@reactflow/background';
import { Controls } from '@reactflow/controls';
import { MiniMap } from '@reactflow/minimap';
import '@reactflow/core/dist/style.css';
import dagre from 'dagre';
import Link from 'next/link';
import { RoadmapTreeNode } from '@/lib/github';

interface RoadmapTreeProps {
  tree: RoadmapTreeNode;
  repoName: string;
}

interface CustomNodeData {
  label: string;
  type: 'root' | 'part' | 'chapter';
  slug?: string;
  description?: string;
}

const nodeWidth = 220;
const nodeHeight = 120;

function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'LR' | 'TB' = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 50,
    edgesep: 10,
    ranksep: 100,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const isHorizontal = direction === 'LR';
  
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
}

function CustomNode({ data, repoName }: { data: CustomNodeData; repoName: string }) {
  const { label, type, slug, description } = data;

  const getCategory = () => {
    if (type === 'root') return '';
    if (type === 'part') {
      const partMatch = label.match(/part\s+(\d+)/i);
      return partMatch ? `PART ${partMatch[1]}` : 'PART';
    }
    return 'CHAPTER';
  };

  const getIcon = () => {
    if (type === 'root') {
      return (
        <div className="flex flex-col items-center justify-center text-white text-xs font-bold leading-tight">
          <div>01</div>
          <div className="text-[10px] opacity-75">10</div>
        </div>
      );
    }
    if (type === 'part') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  const getTitle = () => {
    if (type === 'part') {
      return label.replace(/^part\s+\d+[:\s-]*/i, '').trim();
    }
    // Format chapter titles: "command parsing" -> "Command Parsing"
    return label
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getChapterNumber = () => {
    if (type === 'chapter' && slug) {
      const match = slug.match(/^(\d+)/);
      return match ? match[1].padStart(2, '0') : '';
    }
    return '';
  };

  const nodeContent = (
    <div className="relative bg-gray-800 border border-gray-600 rounded-md p-4 shadow-md text-white text-center w-full h-full">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
        <div className="bg-gray-900 rounded-full w-6 h-6 flex items-center justify-center border border-gray-600">
          {getIcon()}
        </div>
      </div>
      <div className="pl-2">
        {getCategory() && (
          <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            {getCategory()}
          </div>
        )}
        <div className="text-white font-bold text-sm leading-tight mb-1">
          {type === 'chapter' && getChapterNumber() && (
            <span className="text-gray-400 mr-1">{getChapterNumber()}</span>
          )}
          {getTitle()}
        </div>
        {description && type === 'chapter' && (
          <div className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </div>
  );

  if (type === 'chapter' && slug) {
    return (
      <Link href={`/${repoName}/${slug}`} className="block h-full">
        {nodeContent}
      </Link>
    );
  }

  return nodeContent;
}

const createNodeTypes = (repoName: string) => ({
  custom: (props: any) => <CustomNode {...props} repoName={repoName} />,
});

function FitViewHelper() {
  const { fitView } = useReactFlow();
  
  useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
  }, [fitView]);
  
  return null;
}

export default function RoadmapTree({ tree, repoName }: RoadmapTreeProps) {
  const [direction, setDirection] = useState<'LR' | 'TB'>('TB');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const updateDirection = () => {
      setDirection(window.innerWidth < 768 ? 'LR' : 'TB');
    };
    updateDirection();
    window.addEventListener('resize', updateDirection);
    return () => window.removeEventListener('resize', updateDirection);
  }, []);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const buildNodes = (node: RoadmapTreeNode, parentId?: string) => {
      const nodeId = node.id;
      flowNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x: 0, y: 0 }, // Will be set by dagre layout
        data: {
          label: node.label,
          type: node.type,
          slug: node.slug,
          description: node.description,
        },
      });

      if (parentId) {
        flowEdges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'bezier',
          animated: false,
          style: { 
            stroke: '#6b7280', 
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6b7280',
            width: 20,
            height: 20,
          },
        });
      }

      if (node.children) {
        node.children.forEach((child) => {
          buildNodes(child, nodeId);
        });
      }
    };

    buildNodes(tree);

    return getLayoutedElements(flowNodes, flowEdges, direction);
  }, [tree, direction, repoName]);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const nodeTypes = useMemo(() => createNodeTypes(repoName), []);

  return (
    <div className="w-full h-[900px] border border-gray-700 rounded-lg bg-gray-950 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-950"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background 
          color="#374151" 
          gap={20} 
          size={1}
        />
        <Controls 
          className="bg-gray-900/80 border-gray-700 [&>button]:bg-gray-800 [&>button]:text-white [&>button:hover]:bg-gray-700 [&>button]:border-gray-600" 
        />
        <MiniMap
          className="bg-gray-900/80 border-gray-700"
          nodeColor="#1f2937"
          maskColor="rgba(0, 0, 0, 0.7)"
          pannable
          zoomable
        />
        <FitViewHelper />
      </ReactFlow>
    </div>
  );
}
