import { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { authorKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';

export const fetchAuthor = async (pubkey: string): Promise<NDKUserProfile | null> => {
	const user = new NDKUser({ pubkey });
	const profile = await user.fetchProfile();
	return profile;
};

export const createAuthorQuery = (pubkey: string | undefined) => {
	return pubkey
		? createQuery({
				queryKey: authorKeys.details(pubkey),
				queryFn: () => fetchAuthor(pubkey),
				enabled: !!pubkey,
				retry: 0
			})
		: undefined;
};
