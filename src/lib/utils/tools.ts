import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseAnnouncementContent } from './commons';
import type { ExtendedDVMCP } from '$lib/types';
import type { JSONSchema7 } from 'json-schema';

export const parseDVMCP = async (event: NDKEvent): Promise<ExtendedDVMCP | null> => {
	try {
		const parsedContent = parseAnnouncementContent(event.content);
		if (!parsedContent?.name || !parsedContent.tools) return null;
		const nostrEvent = await event.toNostrEvent();
		const capabilities = event.tags.filter((tag) => tag[0] === 'capabilities').map((tag) => tag[1]);
		const toolNames = event.tags.filter((tag) => tag[0] == 't').map((tag) => tag[1]);
		return {
			name: parsedContent?.name,
			picture: parsedContent.picture,
			website: parsedContent.website,
			banner: parsedContent.banner,
			about: parsedContent?.about,
			tools: parsedContent?.tools,
			event: nostrEvent,
			capabilities,
			toolNames
		};
	} catch (error) {
		console.error(error);
		return null;
	}
};

export function filterOptionalParameters(
	params: Record<string, unknown> | undefined,
	schema: JSONSchema7
): Record<string, unknown> {
	const requiredParams = (schema.required || []) as string[];

	return Object.entries(params || {}).reduce(
		(acc, [key, value]) => {
			if (requiredParams.includes(key)) {
				acc[key] = value;
				return acc;
			}

			if (Array.isArray(value)) {
				if (value.length > 0) {
					acc[key] = value;
				}
			} else if (value !== undefined && value !== null && value !== '') {
				acc[key] = value;
			}
			return acc;
		},
		{} as Record<string, unknown>
	);
}
