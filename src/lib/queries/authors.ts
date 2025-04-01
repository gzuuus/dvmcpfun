import { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { authorKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import { eventCache } from '$lib/cache/eventCache';

export const fetchAuthor = async (
	pubkey: string,
	forceRefresh = false,
	backgroundRefreshCallback?: (data: NDKUserProfile | null) => void
): Promise<NDKUserProfile | null> => {
	if (!forceRefresh) {
		try {
			const cachedEvents = await eventCache?.query({ kind: 0, pubkey });
			if (cachedEvents && cachedEvents.length > 0) {
				try {
					const profileContent = cachedEvents[0].content;
					const profile = JSON.parse(profileContent);

					if (backgroundRefreshCallback && !forceRefresh) {
						setTimeout(async () => {
							try {
								const freshData = await fetchAuthor(pubkey, true);
								backgroundRefreshCallback(freshData);
							} catch (error) {
								console.error('Background refresh failed:', error);
							}
						}, 1000);
					}

					return profile;
				} catch (error) {
					console.error('Failed to parse cached profile content:', error);
				}
			}
		} catch (error) {
			console.error('Error retrieving profile from cache:', error);
		}
	}

	const user = new NDKUser({ pubkey });
	const profile = await user.fetchProfile(undefined, true);

	if (profile?.profileEvent) {
		try {
			await eventCache?.set(JSON.parse(profile.profileEvent));
		} catch (error) {
			console.error('Failed to parse profile event:', error);
		}
	}

	return profile;
};

export const createAuthorQuery = (
	pubkey: string | undefined,
	options = { forceRefresh: false }
) => {
	return pubkey
		? createQuery({
				queryKey: authorKeys.details(pubkey),
				queryFn: (context) =>
					fetchAuthor(pubkey, options.forceRefresh, (freshData) => {
						context.client.setQueryData(authorKeys.details(pubkey), freshData);
					}),
				enabled: !!pubkey
			})
		: undefined;
};
