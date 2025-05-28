import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseAnnouncementContent } from './commons';
import type { CapPricing, ToolsList } from '$lib/types';
import type { ListToolsResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { TAG_CAPABILITY } from '@dvmcp/commons/core';

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
	try {
		const parsedContent = parseAnnouncementContent<ListToolsResult>(event.content);
		if (!parsedContent || !parsedContent.tools) return null;

		// Extract tool pricing information from cap tags
		const toolsPricing = new Map<string, CapPricing>();
		event.tags
			.filter((tag) => tag[0] === TAG_CAPABILITY && tag.length >= 4)
			.forEach((tag) => {
				const [_, toolName, price, unit] = tag;
				if (toolName && price && unit) {
					toolsPricing.set(toolName, { price, unit });
				}
			});

		// Return the tools list with pricing information
		return {
			tools: parsedContent.tools,
			toolsPricing
		};
	} catch (error) {
		console.error('Error parsing tools list:', error);
		return null;
	}
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
