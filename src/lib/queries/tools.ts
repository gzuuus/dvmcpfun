import { NDKRelaySet, NDKSubscriptionCacheUsage, type NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import ndkStore from '$lib/stores/nostr';
import { toolKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import { parseDVMCP } from '$lib/utils/tools';
import { get } from 'svelte/store';
import { eventCache } from '$lib/cache/eventCache';

export const fetchDVMCPs = async (
	forceRefresh = false,
	backgroundRefreshCallback?: (data: any) => void
) => {
	const filter: NDKFilter = {
		kinds: [31990 as NDKKind],
		'#t': ['mcp']
	};
	if (!forceRefresh) {
		try {
			const cachedEvents = await eventCache?.query({ kind: 31990 });
			if (cachedEvents && cachedEvents.length > 0) {
				const dvmcp = (await Promise.all(cachedEvents.map(parseDVMCP))).filter(
					(dvmcp) => dvmcp !== null
				);

				if (backgroundRefreshCallback && !forceRefresh) {
					setTimeout(async () => {
						try {
							const freshData = await fetchDVMCPs(true);
							// Call the callback with the fresh data
							backgroundRefreshCallback(freshData);
						} catch (error) {
							console.error('Background refresh failed:', error);
						}
					}, 1000);
				}

				return dvmcp;
			}
		} catch (error) {
			console.error('Error retrieving from cache:', error);
		}
	}

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

	for (const event of events) {
		await eventCache?.set(event);
	}

	const dvmcp = (await Promise.all(Array.from(events).map(parseDVMCP))).filter(
		(dvmcp) => dvmcp !== null
	);
	return dvmcp;
};

export const fetchToolById = async (
	id: string,
	forceRefresh = false,
	backgroundRefreshCallback?: (data: any) => void
) => {
	if (!forceRefresh) {
		const cachedEvent = await eventCache?.get(id);
		if (cachedEvent) {
			const result = await parseDVMCP(cachedEvent);

			if (backgroundRefreshCallback && !forceRefresh) {
				setTimeout(async () => {
					try {
						const freshData = await fetchToolById(id, true);
						backgroundRefreshCallback(freshData);
					} catch (error) {
						console.error('Background refresh failed:', error);
					}
				}, 1000);
			}

			return result;
		}
	}

	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());
	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

	const event = await ndk.fetchEvent(
		id,
		{
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
		},
		relaySet
	);

	if (!event) {
		throw new Error('Tool not found');
	}

	await eventCache?.set(event);

	return parseDVMCP(event);
};

export const createDVMCPsQuery = (options = { forceRefresh: false }) => {
	const query = createQuery({
		queryKey: toolKeys.all,
		queryFn: (context) =>
			fetchDVMCPs(options.forceRefresh, () => {
				if (context.client.getQueryState(toolKeys.all)?.dataUpdateCount! > 4) return;
				context.client.refetchQueries({ queryKey: toolKeys.all });
			})
	});
	return query;
};

export const createDVMCPQuery = (id: string, options = { forceRefresh: false }) => {
	const query = createQuery({
		queryKey: toolKeys.details(id),
		queryFn: (context) =>
			fetchToolById(id, options.forceRefresh, () => {
				if (context.client.getQueryState(toolKeys.details(id))?.dataUpdateCount! > 4) return;
				context.client.refetchQueries({ queryKey: toolKeys.details(id) });
			}),
		enabled: !!id
	});
	return query;
};
