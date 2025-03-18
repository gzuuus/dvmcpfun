import { NDKEvent, type NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import { nostrService } from '$lib/stores/nostr';
import { toolKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import { parseDVMCP } from '$lib/utils/tools';

export const fetchTools = async () => {
	if (!nostrService.isConnected) {
		await nostrService.connect();
	}

	const filter: NDKFilter = {
		kinds: [31990 as NDKKind],
		'#t': ['mcp']
	};

	const events = await nostrService.ndkInstance.fetchEvents(filter);
	const tools = (await Promise.all(Array.from(events).map(parseDVMCP))).filter(
		(tool) => tool !== null
	);
	return tools;
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
	return parseDVMCP(event);
};

// Svelte Query hooks
export const createDVMCPsQuery = () => {
	return createQuery({
		queryKey: toolKeys.all,
		queryFn: fetchTools
	});
};

export const createDVMCPQuery = (id: string) => {
	return createQuery({
		queryKey: toolKeys.details(id),
		queryFn: () => fetchToolById(id),
		enabled: !!id
	});
};
