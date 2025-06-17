
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
import { Button } from '@/components/ui/button';
import { Save, Play, Download, Upload } from 'lucide-react';
import { AdvancedActionNode } from './AdvancedActionNode';
import { BlocksSidebar } from './BlocksSidebar';
import { PresetsSidebar } from './PresetsSidebar';
import { BlockConfigPanel } from './BlockConfigPanel';
import { SCENARIO_PRESETS } from './PresetTemplates';

const nodeTypes = {
  action: AdvancedActionNode,
};

interface AdvancedScenarioBuilderContentProps {
  onSave: (nodes: Node[], edges: Edge[]) => void;
}

const AdvancedScenarioBuilderContent: React.FC<AdvancedScenarioBuilderContentProps> = ({ onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
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
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'presets'>('blocks');
  const { screenToFlowPosition } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const blockTypeId = event.dataTransfer.getData('application/reactflow');
      if (!blockTypeId) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Импортируем BLOCK_TYPES здесь чтобы избежать циклических зависимостей
      import('./BlockTypes').then(({ BLOCK_TYPES, getBlockTypeById }) => {
        const blockType = getBlockTypeById(blockTypeId);
        if (!blockType) return;

        const newNode: Node = {
          id: `${blockType.id}-${Date.now()}`,
          type: 'action',
          position,
          data: {
            id: `${blockType.id}-${Date.now()}`,
            type: blockType.id,
            label: blockType.name,
            icon: blockType.icon.name,
            config: {},
            isConfigured: false,
            blockType: blockType,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      });
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'action') {
      setSelectedNode(node);
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

  const handleExportJSON = () => {
    const scenarioData = {
      nodes,
      edges,
      metadata: {
        name: 'Экспортированный сценарий',
        version: '1.0',
        exportedAt: new Date().toISOString(),
      }
    };

    const dataStr = JSON.stringify(scenarioData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scenario_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scenarioData = JSON.parse(e.target?.result as string);
        if (scenarioData.nodes && scenarioData.edges) {
          setNodes(scenarioData.nodes);
          setEdges(scenarioData.edges);
        }
      } catch (error) {
        console.error('Ошибка при импорте сценария:', error);
        alert('Ошибка при импорте файла сценария');
      }
    };
    reader.readAsText(file);
    
    // Сброс значения для возможности повторного выбора того же файла
    event.target.value = '';
  };

  const loadPreset = useCallback((presetId: string) => {
    const preset = SCENARIO_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setNodes(preset.nodes);
      setEdges(preset.edges);
    }
  }, [setNodes, setEdges]);

  return (
    <div className="flex h-[800px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Боковая панель с вкладками */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Переключатель вкладок */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'blocks' 
                ? 'bg-gray-700 text-white border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Блоки
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'presets' 
                ? 'bg-gray-700 text-white border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Пресеты
          </button>
        </div>

        {/* Содержимое вкладок */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'blocks' ? (
            <BlocksSidebar />
          ) : (
            <PresetsSidebar onLoadPreset={loadPreset} />
          )}
        </div>
      </div>

      {/* Основная область конструктора */}
      <div className="flex-1 relative" ref={ref => ref && (ref.onDrop = onDrop, ref.onDragOver = onDragOver)}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
            <Button onClick={handleImportJSON} className="bg-purple-600 hover:bg-purple-700">
              <Upload className="mr-2 h-4 w-4" />
              Импорт
            </Button>
            <Button onClick={handleExportJSON} className="bg-orange-600 hover:bg-orange-700">
              <Download className="mr-2 h-4 w-4" />
              Экспорт JSON
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </Panel>
        </ReactFlow>

        {/* Скрытый input для загрузки файлов */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {/* Панель настроек выбранного блока */}
      {selectedNode && (
        <BlockConfigPanel
          node={selectedNode}
          onSave={(config) => updateNodeConfig(selectedNode.id, config)}
          onCancel={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

export const AdvancedScenarioBuilder: React.FC<AdvancedScenarioBuilderContentProps> = ({ onSave }) => {
  return (
    <ReactFlowProvider>
      <AdvancedScenarioBuilderContent onSave={onSave} />
    </ReactFlowProvider>
  );
};
