import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseAnnouncementContent } from './commons';
import type { ExtendedDVMCP } from '$lib/types';

export const parseDVMCP = async (event: NDKEvent): Promise<ExtendedDVMCP | null> => {
	try {
		const parsedContent = parseAnnouncementContent(event.content);
		if (!parsedContent?.name || !parsedContent.tools) return null;
		const nostrEvent = await event.toNostrEvent();
		const capabilities = event.tags.filter((tag) => tag[0] === 'capabilities').map((tag) => tag[1]);
		const toolNames = event.tags.filter((tag) => tag[0] == 't').map((tag) => tag[1]);
		return {
			name: parsedContent?.name,
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
