import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseContent, parseCapabilityListEvent } from './commons';
import type { CapPricing, ToolsList } from '$lib/types';
import type { ListToolsResult, Tool } from '@modelcontextprotocol/sdk/types.js';

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

export function createToolExecutionHash(
	tool: Tool,
	params: Record<string, unknown>,
	providerPk: string
): string {
	const executionString = JSON.stringify({
		toolName: tool.name,
		toolId: tool.id || '',
		params,
		providerPk
	});

	let hash = 5381;
	for (let i = 0; i < executionString.length; i++) {
		hash = (hash << 5) + hash + executionString.charCodeAt(i);
	}

	return (hash >>> 0).toString(16);
}
