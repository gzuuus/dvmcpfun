import { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import { nostrService } from '$lib/stores/nostr';
import { authorKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';

export type NostrAuthor = {
	id: string;
	name?: string;
	about?: string;
	picture?: string;
	nip05?: string;
};

const transformEvent = (event: NDKEvent): NostrAuthor => {
	try {
		const content = JSON.parse(event.content);
		console.log('Author event:', { event, content });
		return {
			id: event.pubkey,
			name: content?.name || event.tags.find((t) => t[0] === 'name')?.[1],
			about: content?.about,
			picture: content?.picture,
			nip05: content?.nip05
		};
	} catch (e) {
		console.error('Error parsing author event:', e);
		return {
			id: event.pubkey
		};
	}
};

export const fetchAuthor = async (pubkey: string) => {
	// Wait for connection if not already connected
	if (!nostrService.isConnected) {
		await nostrService.connect();
	}

	console.log('Fetching author:', pubkey);
	const filter: NDKFilter = {
		kinds: [0], // kind 0 is metadata
		authors: [pubkey],
		limit: 1
	};

	const events = await nostrService.ndkInstance.fetchEvents(filter);
	const eventArray = Array.from(events);
	console.log('Author events found:', eventArray.length);

	if (eventArray.length === 0) {
		console.log('No author events found for:', pubkey);
		return { id: pubkey } as NostrAuthor;
	}

	// Get the most recent metadata event
	const latestEvent = eventArray.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0];
	return transformEvent(latestEvent);
};

export const createAuthorQuery = (pubkey: string) => {
	return createQuery({
		queryKey: authorKeys.details(pubkey),
		queryFn: () => fetchAuthor(pubkey),
		enabled: !!pubkey
	});
};
