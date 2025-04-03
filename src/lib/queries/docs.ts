import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import type { NDKFilter, NDKEvent } from '@nostr-dev-kit/ndk';
import { createQuery } from '@tanstack/svelte-query';
import ndkStore from '$lib/stores/nostr';
import { get } from 'svelte/store';
import { eventCache } from '$lib/cache/eventCache';
import { docKeys } from './queryKeyFactory';
import { LongFormArticle } from 'nostr-tools/kinds';

// Define a new query key for documentation

export type LongFormArticleContent = {
	id: string;
	title: string;
	content: string;
	summary?: string;
	image?: string;
	publishedAt?: number;
	createdAt: number;
	tags: string[];
};

// Function to fetch documentation from a specific author
export const fetchDocs = async (
	authorPubkey: string,
	forceRefresh = false,
	backgroundRefreshCallback?: (data: NDKEvent[]) => void
): Promise<NDKEvent[]> => {
	const filter: NDKFilter = {
		kinds: [LongFormArticle],
		authors: [authorPubkey],
		limit: 20
	};

	if (!forceRefresh) {
		try {
			const cachedEvents = await eventCache?.query({ kind: 30023, pubkey: authorPubkey });
			if (cachedEvents && cachedEvents.length > 0) {
				const docs = cachedEvents;
				const sortedDocs = docs.sort((a, b) => b.created_at - a.created_at);

				if (backgroundRefreshCallback) {
					setTimeout(async () => {
						try {
							const freshData = await fetchDocs(authorPubkey, true);
							backgroundRefreshCallback(freshData);
						} catch (error) {
							console.error('Background refresh failed:', error);
						}
					}, 1000);
				}

				return sortedDocs;
			}
		} catch (error) {
			console.error('Error retrieving docs from cache:', error);
		}
	}

	const ndk = get(ndkStore);
	const events = await ndk.fetchEvents(filter, {
		cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
	});

	for (const event of events) {
		await eventCache?.set(event);
	}

	const docs = Array.from(events);
	return docs.sort((a, b) => b.created_at - a.created_at);
};

// Function to parse a Nostr document event into a more usable format
export const parseDocEvent = (event: NDKEvent): LongFormArticleContent => {
	let title = '';
	let summary = '';
	let image = '';
	let publishedAt: number | undefined;
	const tags: string[] = [];

	// Extract metadata from tags
	event.tags.forEach((tag) => {
		if (tag[0] === 'title' && tag[1]) {
			title = tag[1];
		} else if (tag[0] === 'summary' && tag[1]) {
			summary = tag[1];
		} else if (tag[0] === 'image' && tag[1]) {
			image = tag[1];
		} else if (tag[0] === 'published_at' && tag[1]) {
			publishedAt = parseInt(tag[1], 10);
		} else if (tag[0] === 't' && tag[1]) {
			tags.push(tag[1]);
		}
	});

	return {
		id: event.id,
		title: title || 'Untitled Document',
		content: event.content,
		summary,
		image,
		publishedAt,
		createdAt: event.created_at,
		tags
	};
};

// Create a query hook for fetching documentation
export const createDocsQuery = (authorPubkey: string, options = { forceRefresh: false }) => {
	return createQuery({
		queryKey: [...docKeys.all, authorPubkey],
		queryFn: (context) =>
			fetchDocs(authorPubkey, options.forceRefresh, (freshData) => {
				if (context.client.getQueryState([...docKeys.all, authorPubkey])?.dataUpdateCount! > 4)
					return;
				context.client.setQueryData([...docKeys.all, authorPubkey], freshData);
			})
	});
};
