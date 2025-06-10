import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseContent, parseCapabilityListEvent } from './commons';
import type { ToolsList } from '$lib/types';
import type { ListToolsResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { queryClient } from '$lib/queries/queryClient';

/**
 * Parse a tools list event (kind 31317)
 * According to the new DVMCP spec, tools list events contain:
 * - A list of tools in the content
 * - Pricing information in the cap tags
 *
 * @param event The tools list event
 * @returns A ToolsList object or null if parsing fails
 */
export const parseToolsList = (event: NDKEvent): ToolsList | null => {
	const result = parseCapabilityListEvent<ListToolsResult>(event, 'tool', parseContent);

	if (!result || !result.content?.tools) {
		return null;
	}

	return {
		tools: result.content.tools,
		toolsPricing: result.pricing
	};
};

export const toolKeys = {
	all: ['tools'] as const,
	execution: (hash: string) => [...toolKeys.all, 'execution', hash] as const
};

export function createToolExecutionHash(
	tool: Tool,
	params: Record<string, unknown>,
	providerPk: string,
	serverId?: string
): string {
	const executionString = JSON.stringify({
		toolName: tool.name,
		toolId: tool.id || '',
		params,
		providerPk,
		serverId
	});

	let hash = 5381;
	for (let i = 0; i < executionString.length; i++) {
		hash = (hash << 5) + hash + executionString.charCodeAt(i);
	}

	return (hash >>> 0).toString(16);
}

/**
 * Get cached tool execution result if available
 */
export const getCachedToolExecution = (
	tool: Tool,
	params: Record<string, unknown> | undefined,
	providerPk: string,
	serverId?: string
): unknown | undefined => {
	const executionHash = createToolExecutionHash(tool, params || {}, providerPk, serverId);
	return queryClient.getQueryData(toolKeys.execution(executionHash));
};

/**
 * Cache tool execution result for future use
 */
export const setCachedToolExecution = (
	tool: Tool,
	params: Record<string, unknown>,
	providerPk: string,
	result: unknown,
	serverId?: string
): void => {
	const executionHash = createToolExecutionHash(tool, params, providerPk, serverId);
	queryClient.setQueryData(toolKeys.execution(executionHash), result);
};
