import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseAnnouncementContent } from './commons';
import type { CapPricing, ProviderServerMeta, ToolsList } from '$lib/types';
import type { JSONSchema7 } from 'json-schema';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TAG_SERVER_IDENTIFIER, TAG_CAPABILITY } from '@dvmcp/commons/core';

export type ToolWithMeta = { tool: Tool; meta: ProviderServerMeta };

// Parse a single tool from an event
export const parseTool = async (event: NDKEvent): Promise<ToolWithMeta | null> => {
	try {
		const parsedContent = parseAnnouncementContent<Tool>(event.content);
		if (!parsedContent) return null;
		const serverId = event.tags.find((tag) => tag[0] === TAG_SERVER_IDENTIFIER)?.[1];
		return {
			tool: parsedContent,
			meta: {
				serverId,
				providerPubkey: event.pubkey
			}
		};
	} catch (error) {
		console.error(error);
		return null;
	}
};

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
		const parsedContent = parseAnnouncementContent<{ tools: Tool[] }>(event.content);
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
