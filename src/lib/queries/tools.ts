import { type NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import ndkStore from '$lib/stores/nostr';
import { toolKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import { parseDVMCP } from '$lib/utils/tools';
import { get } from 'svelte/store';

export const fetchDVMCPs = async () => {
	const filter: NDKFilter = {
		kinds: [31990 as NDKKind],
		'#t': ['mcp']
	};

	const events = await get(ndkStore).fetchEvents(filter);
	const dvmcp = (await Promise.all(Array.from(events).map(parseDVMCP))).filter(
		(dvmcp) => dvmcp !== null
	);
	return dvmcp;
};

export const fetchToolById = async (id: string) => {
	const event = await get(ndkStore).fetchEvent(id);
	if (!event) {
		throw new Error('Tool not found');
	}
	return parseDVMCP(event);
};

// Svelte Query hooks
export const createDVMCPsQuery = () => {
	return createQuery({
		queryKey: toolKeys.all,
		queryFn: fetchDVMCPs
	});
};

export const createDVMCPQuery = (id: string) => {
	return createQuery({
		queryKey: toolKeys.details(id),
		queryFn: () => fetchToolById(id),
		enabled: !!id
	});
};
