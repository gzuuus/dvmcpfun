import { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import { docsKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import ndkStore from '$lib/stores/nostr';
import { get } from 'svelte/store';
import { statsDvmcpPubkey } from '../../routes/stats/constants';

export type NostrArticle = {
	id: string;
	title: string;
	summary?: string;
	content: string;
	author: string;
	createdAt: number;
	image?: string;
	publishedAt?: number;
	identifier?: string;
};

const transformEvent = (event: NDKEvent): NostrArticle => {
	// Extract title from tags
	const titleTag = event.tags.find((tag) => tag[0] === 'title');
	const title = titleTag ? titleTag[1] : 'Untitled Article';

	// Extract summary from tags
	const summaryTag = event.tags.find((tag) => tag[0] === 'summary');
	const summary = summaryTag ? summaryTag[1] : undefined;

	// Extract image from tags
	const imageTag = event.tags.find((tag) => tag[0] === 'image');
	const image = imageTag ? imageTag[1] : undefined;

	// Extract published date from tags
	const publishedAt = event.created_at ? event.created_at : undefined;

	return {
		id: event.id,
		title,
		summary,
		content: event.content,
		author: event.pubkey,
		createdAt: event.created_at ?? Math.floor(Date.now() / 1000),
		image,
		publishedAt,
		identifier: event.dTag
	};
};

export const fetchArticles = async () => {
	const filter: NDKFilter = {
		kinds: [30023], // kind 30023 is long-form content
		authors: [statsDvmcpPubkey]
	};

	const events = await get(ndkStore).fetchEvents(filter);
	const articles = Array.from(events).map(transformEvent);

	// Sort by newest first
	return articles.sort((a, b) => b.createdAt - a.createdAt);
};

export const fetchArticle = async (id: string) => {
	const filter: NDKFilter = {
		kinds: [30023],
		'#d': [id]
	};

	const events = await get(ndkStore).fetchEvents(filter);
	const event = Array.from(events)[0];

	if (!event) {
		throw new Error('Article not found');
	}

	return transformEvent(event);
};

// Svelte Query hooks
export const createArticlesQuery = () => {
	return createQuery({
		queryKey: docsKeys.all,
		queryFn: fetchArticles
	});
};

export const createArticleQuery = (id: string) => {
	return createQuery({
		queryKey: docsKeys.details(id),
		queryFn: () => fetchArticle(id)
	});
};
