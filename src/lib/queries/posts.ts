import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import { postKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import ndkStore from '$lib/stores/nostr';
import { get } from 'svelte/store';
import { eventCache } from '$lib/cache/eventCache';

export type NostrPost = {
	id: string;
	content: string;
	author: string;
	createdAt: number;
};

export const fetchPosts = async (
	forceRefresh = false,
	backgroundRefreshCallback?: (data: any) => void
) => {
	const filter: NDKFilter = {
		kinds: [1],
		limit: 20
	};

	if (!forceRefresh) {
		try {
			const cachedEvents = await eventCache?.query({ kind: 1 });
			if (cachedEvents && cachedEvents.length > 0) {
				const posts = cachedEvents;
				const sortedPosts = posts.sort((a, b) => b.created_at - a.created_at);

				if (backgroundRefreshCallback && !forceRefresh) {
					setTimeout(async () => {
						try {
							const freshData = await fetchPosts(true);
							// Call the callback with the fresh data
							backgroundRefreshCallback(freshData);
						} catch (error) {
							console.error('Background refresh failed:', error);
						}
					}, 1000);
				}

				return sortedPosts;
			}
		} catch (error) {
			console.error('Error retrieving posts from cache:', error);
		}
	}

	const ndk = get(ndkStore);
	const events = await ndk.fetchEvents(filter, {
		cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
	});

	for (const event of events) {
		await eventCache?.set(event);
	}

	const posts = Array.from(events);

	return posts.sort((a, b) => b.created_at - a.created_at);
};

export const fetchPost = async (
	id: string,
	forceRefresh = false,
	backgroundRefreshCallback?: (data: any) => void
) => {
	if (!forceRefresh) {
		const cachedEvent = await eventCache?.get(id);
		if (cachedEvent) {
			if (backgroundRefreshCallback && !forceRefresh) {
				setTimeout(async () => {
					try {
						const freshData = await fetchPost(id, true);
						backgroundRefreshCallback(freshData);
						backgroundRefreshCallback(freshData);
					} catch (error) {
						console.error('Background refresh failed:', error);
					}
				}, 1000);
			}

			return cachedEvent;
		}
	}

	const ndk = get(ndkStore);
	const event = await ndk.fetchEvent(id, {
		cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
	});

	if (!event) {
		throw new Error('Post not found');
	}

	await eventCache?.set(event);

	return event;
};

export const createPostsQuery = (options = { forceRefresh: false }) => {
	const query = createQuery({
		queryKey: postKeys.all,
		queryFn: (context) =>
			fetchPosts(options.forceRefresh, () => {
				if (context.client.getQueryState(postKeys.all)?.dataUpdateCount! > 4) return;
				context.client.refetchQueries({ queryKey: postKeys.all });
			})
	});
	return query;
};

export const createPostQuery = (id: string, options = { forceRefresh: false }) => {
	const query = createQuery({
		queryKey: postKeys.details(id),
		queryFn: (context) =>
			fetchPost(id, options.forceRefresh, () => {
				if (context.client.getQueryState(postKeys.details(id))?.dataUpdateCount! > 4) return;
				context.client.refetchQueries({ queryKey: postKeys.details(id) });
			})
	});
	return query;
};
