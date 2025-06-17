
import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionNode } from './ActionNode';
import { ActionsSidebar } from './ActionsSidebar';
import { Eye, MousePointer, Type, Clock, Navigation, Play, Save } from 'lucide-react';

const nodeTypes = {
  action: ActionNode,
};

export interface ActionNodeData {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'wait' | 'view';
  label: string;
  icon: React.ComponentType<any>;
  config: Record<string, any>;
  isConfigured: boolean;
}

const initialNodes: Node<ActionNodeData>[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'Начало сценария' },
    position: { x: 250, y: 50 },
    style: { 
      background: '#4ade80', 
      color: 'white',
      border: '2px solid #22c55e',
      borderRadius: '8px'
    }
  }
];

const ScenarioFlowBuilderContent: React.FC<{
  onSave: (nodes: Node[], edges: Edge[]) => void;
}> = ({ onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<ActionNodeData> | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const actionTypes = {
        navigate: { icon: Navigation, label: 'Переход на сайт' },
        click: { icon: MousePointer, label: 'Клик по элементу' },
        type: { icon: Type, label: 'Ввод текста' },
        wait: { icon: Clock, label: 'Ожидание' },
        view: { icon: Eye, label: 'Просмотр контента' },
      };

      const actionConfig = actionTypes[type as keyof typeof actionTypes];
      if (!actionConfig) return;

      const newNode: Node<ActionNodeData> = {
        id: `${type}-${Date.now()}`,
        type: 'action',
        position,
        data: {
          id: `${type}-${Date.now()}`,
          type: type as ActionNodeData['type'],
          label: actionConfig.label,
          icon: actionConfig.icon,
          config: {},
          isConfigured: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'action') {
      setSelectedNode(node as Node<ActionNodeData>);
    }
  }, []);

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config,
              isConfigured: Object.keys(config).length > 0,
            },
          };
        }
        return node;
      })
    );
    setSelectedNode(null);
  }, [setNodes]);

  const handleSave = () => {
    onSave(nodes, edges);
  };

  return (
    <div className="flex h-[800px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Боковая панель с действиями */}
      <ActionsSidebar />

      {/* Основная область конструктора */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ backgroundColor: '#1f2937' }}
        >
          <Controls />
          <MiniMap 
            style={{ backgroundColor: '#374151' }}
            maskColor="rgba(0, 0, 0, 0.2)"
          />
          <Background gap={20} size={1} color="#374151" />
          
          <Panel position="top-right" className="space-x-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Сохранить сценарий
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Панель настроек выбранного узла */}
      {selectedNode && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <selectedNode.data.icon className="h-5 w-5 text-blue-400" />
                {selectedNode.data.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NodeConfigPanel
                node={selectedNode}
                onSave={(config) => updateNodeConfig(selectedNode.id, config)}
                onCancel={() => setSelectedNode(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const NodeConfigPanel: React.FC<{
  node: Node<ActionNodeData>;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}> = ({ node, onSave, onCancel }) => {
  const [config, setConfig] = useState(node.data.config);

  const renderConfigFields = () => {
    switch (node.data.type) {
      case 'navigate':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-300">URL сайта</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Время ожидания загрузки (сек)</label>
              <input
                type="number"
                value={config.waitTime || 5}
                onChange={(e) => setConfig({ ...config, waitTime: parseInt(e.target.value) })}
                min="1"
                max="60"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      case 'click':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-300">CSS селектор</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => setConfig({ ...config, selector: e.target.value })}
                placeholder="button, .class, #id"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Задержка перед кликом (мс)</label>
              <input
                type="number"
                value={config.delay || 1000}
                onChange={(e) => setConfig({ ...config, delay: parseInt(e.target.value) })}
                min="100"
                max="10000"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      case 'type':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-300">CSS селектор поля</label>
              <input
                type="text"
                value={config.selector || ''}
                onChange={(e) => setConfig({ ...config, selector: e.target.value })}
                placeholder="input, textarea, [contenteditable]"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Текст для ввода</label>
              <textarea
                value={config.text || ''}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="Введите текст..."
                rows={3}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      case 'wait':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-300">Мин. время ожидания (мс)</label>
              <input
                type="number"
                value={config.minTime || 1000}
                onChange={(e) => setConfig({ ...config, minTime: parseInt(e.target.value) })}
                min="100"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Макс. время ожидания (мс)</label>
              <input
                type="number"
                value={config.maxTime || 3000}
                onChange={(e) => setConfig({ ...config, maxTime: parseInt(e.target.value) })}
                min="100"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      case 'view':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-300">Время просмотра (сек)</label>
              <input
                type="number"
                value={config.viewTime || 30}
                onChange={(e) => setConfig({ ...config, viewTime: parseInt(e.target.value) })}
                min="5"
                max="300"
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Прокрутка страницы</label>
              <select
                value={config.scrollBehavior || 'random'}
                onChange={(e) => setConfig({ ...config, scrollBehavior: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="none">Без прокрутки</option>
                <option value="random">Случайная прокрутка</option>
                <option value="full">Полная прокрутка</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderConfigFields()}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <Button onClick={() => onSave(config)} className="flex-1 bg-blue-600 hover:bg-blue-700">
          Сохранить
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Отмена
        </Button>
      </div>
    </div>
  );
};

export const ScenarioFlowBuilder: React.FC<{
  onSave: (nodes: Node[], edges: Edge[]) => void;
}> = ({ onSave }) => {
  return (
    <ReactFlowProvider>
      <ScenarioFlowBuilderContent onSave={onSave} />
    </ReactFlowProvider>
  );
};
