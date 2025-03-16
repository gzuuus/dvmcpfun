import { NDKEvent, type NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import { nostrService } from '$lib/stores/nostr';
import { toolKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';

export type McpTool = {
	name: string;
	description: string;
	parameters?: Record<string, unknown>;
	author: string;
	eventId?: string;
	capabilities?: string[];
	about?: string;
	rawContent?: any; // For debugging
};

const transformToolEvent = (event: NDKEvent): McpTool => {
	try {
		const content = JSON.parse(event.content);
		const capabilities = event.tags.filter((tag) => tag[0] === 'capabilities').map((tag) => tag[1]);
		return {
			name: content.name || 'Unknown Tool',
			description: content.description || '',
			parameters: content.parameters,
			author: event.pubkey,
			eventId: event.id,
			capabilities: capabilities,
			about: content.about,
			rawContent: {
				parsed: content,
				id: event.id,
				pubkey: event.pubkey,
				created_at: event.created_at,
				kind: event.kind,
				content: event.content,
				tags: event.tags,
				sig: event.sig
			}
		};
	} catch (e) {
		console.error('Error parsing tool event:', e);
		return {
			name: 'Error parsing tool',
			description: 'Could not parse tool data',
			author: event.pubkey,
			eventId: event.id,
			capabilities: [],
			rawContent: {
				error: 'Could not parse content',
				id: event.id,
				pubkey: event.pubkey,
				created_at: event.created_at,
				kind: event.kind,
				content: event.content,
				tags: event.tags,
				sig: event.sig
			}
		};
	}
};

export const fetchTools = async () => {
	// Wait for connection if not already connected
	if (!nostrService.isConnected) {
		await nostrService.connect();
	}

	const filter: NDKFilter = {
		kinds: [31990 as NDKKind], // MCP tool kind
		'#t': ['mcp'] // MCP tag
	};

	const events = await nostrService.ndkInstance.fetchEvents(filter);
	const tools = Array.from(events).map(transformToolEvent);

	// Sort by name
	return tools.sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchToolById = async (id: string) => {
	// Wait for connection if not already connected
	if (!nostrService.isConnected) {
		await nostrService.connect();
	}

	const event = await nostrService.ndkInstance.fetchEvent(id);
	if (!event) {
		throw new Error('Tool not found');
	}
	return transformToolEvent(event);
};

// Svelte Query hooks
export const createToolsQuery = () => {
	return createQuery({
		queryKey: toolKeys.all,
		queryFn: fetchTools
	});
};

export const createToolQuery = (id: string) => {
	return createQuery({
		queryKey: toolKeys.details(id),
		queryFn: () => fetchToolById(id),
		enabled: !!id
	});
};
