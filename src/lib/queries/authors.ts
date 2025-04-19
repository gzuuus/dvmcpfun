import { NDKUser } from '@nostr-dev-kit/ndk';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { authorKeys } from './queryKeyFactory';
import { createQuery } from '@tanstack/svelte-query';
import ndkStore, { ndkProfile } from '$lib/stores/nostr';
import { toASCII } from 'punycode';
import { get } from 'svelte/store';
export const fetchAuthor = async (pubkey: string): Promise<NDKUserProfile | null> => {
	const user = new NDKUser({ pubkey });
	user.ndk = ndkProfile;
	const profile = await user.fetchProfile();
	return profile;
};

export const createAuthorQuery = (pubkey: string) => {
	return createQuery({
		queryKey: authorKeys.details(pubkey),
		queryFn: () => fetchAuthor(pubkey),
		enabled: !!pubkey,
		retry: 1
	});
};

export const createUservalidateNip05Query = (profile: NDKUserProfile, pubkey: string) =>
	createQuery<boolean | null>({
		queryKey: authorKeys.nip05(pubkey),
		queryFn: async () => {
			const user = new NDKUser({ pubkey });
			user.ndk = get(ndkStore);
			user.profile = profile;

			if (!user.profile?.nip05) return null;
			const [name, domain] = user.profile.nip05.split('@');
			let punycodeDomain = domain;

			if (!/^[a-z0-9.-]+$/.test(domain)) {
				try {
					punycodeDomain = toASCII(domain);
					console.log(`Punycode domain: ${punycodeDomain}`);
				} catch (err) {
					console.warn(
						`Punycode conversion failed for domain: ${domain}. Using original domain. Error: ${err}`
					);
					punycodeDomain = domain;
				}
			}
			const parsedNip05 = `${name}@${punycodeDomain}`;
			const userNip05 = user.profile?.nip05 == parsedNip05 ? user.profile?.nip05 : parsedNip05;
			return await user.validateNip05(userNip05);
		}
	});
