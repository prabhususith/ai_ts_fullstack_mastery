/**
 * @file useMcpServer.ts
 * @description React hook to manage Model Context Protocol tool discovery and execution.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: Record<string, any>;
  serverId: string;
}

export function useMcpServer() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMcpTools();
      setTools(data.tools || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch MCP tools');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const executeTool = useCallback(async (toolName: string, params: Record<string, any>) => {
    setIsExecuting(true);
    setError(null);
    try {
      const res = await apiClient.executeMcpTool(toolName, params);
      setExecutionResult(res);
      return res;
    } catch (err: any) {
      setError(err.message || `Execution of ${toolName} failed`);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return {
    tools,
    isLoading,
    isExecuting,
    executionResult,
    error,
    refreshTools: fetchTools,
    executeTool,
  };
}
