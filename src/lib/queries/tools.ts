import { NDKRelaySet, NDKSubscriptionCacheUsage, type NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import ndkStore from '$lib/stores/nostr';
import { toolKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import { parseDVMCP, createToolExecutionHash } from '$lib/utils/tools';
import { get } from 'svelte/store';
import { queryClient } from './queryClient';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const fetchDVMCPs = async () => {
	const filter: NDKFilter = {
		kinds: [31990 as NDKKind],
		'#t': ['mcp']
	};

	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());

	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);
	const events = await ndk.fetchEvents(
		filter,
		{
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
		},
		relaySet
	);

	const dvmcp = (await Promise.all(Array.from(events).map(parseDVMCP))).filter(
		(dvmcp) => dvmcp !== null
	);
	return dvmcp;
};

export const fetchToolById = async (identifier: string) => {
	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());
	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

	// First try to find by d tag
	const filter: NDKFilter = {
		kinds: [31990 as NDKKind],
		'#t': ['mcp'],
		'#d': [identifier]
	};

	let events = await ndk.fetchEvents(
		filter,
		{
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
		},
		relaySet
	);

	let event = events.size > 0 ? Array.from(events)[0] : null;

	// If not found by d tag, try to fetch by event ID as fallback
	if (!event) {
		try {
			event = await ndk.fetchEvent(
				identifier,
				{
					cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
				},
				relaySet
			);
		} catch (error) {
			console.error('Error fetching by ID:', error);
		}
	}

	if (!event) {
		throw new Error('Tool not found');
	}

	return parseDVMCP(event);
};

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

export const getCachedToolExecution = (
	tool: Tool,
	params: Record<string, unknown>,
	providerPk: string
): unknown | undefined => {
	const executionHash = createToolExecutionHash(tool, params, providerPk);
	return queryClient.getQueryData(toolKeys.execution(executionHash));
};

export const setCachedToolExecution = (
	tool: Tool,
	params: Record<string, unknown>,
	providerPk: string,
	result: unknown
): void => {
	const executionHash = createToolExecutionHash(tool, params, providerPk);
	queryClient.setQueryData(toolKeys.execution(executionHash), result);
};
