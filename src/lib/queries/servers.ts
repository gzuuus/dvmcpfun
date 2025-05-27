import { NDKRelaySet, NDKSubscriptionCacheUsage, type NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import ndkStore from '$lib/stores/nostr';
import { serverKeys, toolsListKeys, resourcesListKeys, promptsListKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import { get } from 'svelte/store';
import {
	SERVER_ANNOUNCEMENT_KIND,
	TOOLS_LIST_KIND,
	RESOURCES_LIST_KIND,
	PROMPTS_LIST_KIND
} from '@dvmcp/commons/core';
import type {
	ServerWithMeta,
	ToolsListWithProvider,
	ResourcesListWithProvider,
	PromptsListWithProvider,
	ResourcesTemplatesListWithProvider
} from '$lib/types';
import { parseServer } from '$lib/utils/servers';
import { parseToolsList } from '$lib/utils/tools';
import { parseResourcesList } from '$lib/utils/resources';
import { parsePromptsList } from '$lib/utils/prompts';

/**
 * Fetches all server announcements from the network
 * According to the new DVMCP spec, servers announce themselves separately from their capabilities
 */
export const fetchServers = async (): Promise<ServerWithMeta[]> => {
	const filter: NDKFilter = {
		kinds: [SERVER_ANNOUNCEMENT_KIND as number]
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

	const servers = (await Promise.all(Array.from(events).map(parseServer))).filter(
		(server): server is ServerWithMeta => server !== null
	);
	return servers;
};

/**
 * Fetches a specific server by its identifier
 * @param identifier The server identifier (d tag) or event ID
 */
export const fetchServerById = async (identifier: string): Promise<ServerWithMeta> => {
	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());
	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

	// First try to find by d tag
	const filter: NDKFilter = {
		kinds: [SERVER_ANNOUNCEMENT_KIND as NDKKind],
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
		throw new Error('Server not found');
	}

	const server = await parseServer(event);
	if (!server) {
		throw new Error('Failed to parse server');
	}

	return server;
};

/**
 * Fetches the tools list for a specific server
 * According to the new DVMCP spec, tools lists are separate events (kind 31317)
 * that reference the server via the 's' tag
 * @param serverId The server identifier
 */
export const fetchToolsListByServerId = async (
	serverId: string
): Promise<ToolsListWithProvider | null> => {
	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());
	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

	const filter: NDKFilter = {
		kinds: [TOOLS_LIST_KIND as NDKKind],
		'#s': [serverId]
	};

	const events = await ndk.fetchEvents(
		filter,
		{
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
		},
		relaySet
	);

	if (events.size === 0) {
		return null;
	}

	// Get the most recent tools list event
	const event = Array.from(events)[0];
	const toolsList = parseToolsList(event);

	if (!toolsList) {
		return null;
	}

	// Add provider pubkey and server ID to create ToolsListWithProvider
	return {
		...toolsList,
		providerPubkey: event.pubkey,
		serverId
	};
};

/**
 * Fetches the resources list for a specific server
 * According to the new DVMCP spec, resources lists are separate events (kind 31318)
 * that reference the server via the 's' tag
 * @param serverId The server identifier
 */
export const fetchResourcesListByServerId = async (
	serverId: string
): Promise<ResourcesListWithProvider | ResourcesTemplatesListWithProvider | null> => {
	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());
	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

	const filter: NDKFilter = {
		kinds: [RESOURCES_LIST_KIND as NDKKind],
		'#s': [serverId]
	};

	const events = await ndk.fetchEvents(
		filter,
		{
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
		},
		relaySet
	);

	if (events.size === 0) {
		return null;
	}

	// Get the most recent resources list event
	const event = Array.from(events)[0];
	const resourcesList = parseResourcesList(event);

	if (!resourcesList) {
		return null;
	}

	// Add provider pubkey and server ID to create ResourcesListWithProvider or ResourcesTemplatesListWithProvider
	return {
		...resourcesList,
		providerPubkey: event.pubkey,
		serverId
	};
};

/**
 * Fetches the prompts list for a specific server
 * According to the new DVMCP spec, prompts lists are separate events (kind 31319)
 * that reference the server via the 's' tag
 * @param serverId The server identifier
 */
export const fetchPromptsListByServerId = async (
	serverId: string
): Promise<PromptsListWithProvider | null> => {
	const ndk = get(ndkStore);
	const relayUrls = Array.from(ndk.pool.relays.keys());
	const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

	const filter: NDKFilter = {
		kinds: [PROMPTS_LIST_KIND as NDKKind],
		'#s': [serverId]
	};

	const events = await ndk.fetchEvents(
		filter,
		{
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
		},
		relaySet
	);

	if (events.size === 0) {
		return null;
	}

	// Get the most recent prompts list event
	const event = Array.from(events)[0];
	const promptsList = parsePromptsList(event);

	if (!promptsList) {
		return null;
	}

	// Add provider pubkey and server ID to create PromptsListWithProvider
	return {
		...promptsList,
		providerPubkey: event.pubkey,
		serverId
	};
};

/**
 * Create query hooks for fetching data
 * These hooks follow the server-first pattern where server data is fetched first,
 * then capability-specific data is fetched based on the server ID
 */

// Create a query for fetching all servers
export const createServersQuery = () => {
	return createQuery({
		queryKey: serverKeys.all,
		queryFn: fetchServers
	});
};

// Create a query for fetching a specific server by ID
export const createServerQuery = (id: string) => {
	return createQuery({
		queryKey: serverKeys.details(id),
		queryFn: () => fetchServerById(id),
		enabled: !!id
	});
};

// Create a query for fetching tools list for a specific server
export const createToolsListQuery = (serverId: string) => {
	return createQuery({
		queryKey: toolsListKeys.list(serverId),
		queryFn: () => fetchToolsListByServerId(serverId),
		enabled: !!serverId
	});
};

export const createResourcesListQuery = (serverId: string) => {
	return createQuery({
		queryKey: resourcesListKeys.list(serverId),
		queryFn: () => fetchResourcesListByServerId(serverId),
		enabled: !!serverId
	});
};

export const createPromptsListQuery = (serverId: string) => {
	return createQuery({
		queryKey: promptsListKeys.list(serverId),
		queryFn: () => fetchPromptsListByServerId(serverId),
		enabled: !!serverId
	});
};
