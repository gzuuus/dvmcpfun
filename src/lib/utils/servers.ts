import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseContent } from './commons';
import type { ServerWithMeta } from '$lib/types';
import { logger } from '$lib/utils/logger';
import { TAG_SUPPORT_ENCRYPTION, TAG_UNIQUE_IDENTIFIER } from '@dvmcp/commons/core';
import type { Implementation } from '@modelcontextprotocol/sdk/types.js';

/**
 * Parse a server announcement event into a ServerWithMeta object
 * According to the new DVMCP spec, server announcements (kind 31316) contain:
 * - Server metadata in tags (name, about, picture, website, etc.)
 * - Server capabilities in the content (high-level flags like prompts.listChanged)
 * - No direct nesting of tool, resource, or prompt arrays
 *
 * @param event The server announcement event
 * @returns A ServerWithMeta object or null if parsing fails
 */
export const parseServer = async (event: NDKEvent): Promise<ServerWithMeta | null> => {
	try {
		// Parse the server implementation from the content
		// This should contain the capabilities flags but NOT the actual lists
		const parsedContent = parseContent<Implementation>(event.content);
		if (!parsedContent) return null;

		// Extract metadata from tags
		const serverId = event.tags.find((tag) => tag[0] === TAG_UNIQUE_IDENTIFIER)?.[1];

		// Get name from tags first, then from serverInfo if available
		let name = event.tags.find((tag) => tag[0] === 'name')?.[1] || '';

		// If name is not in tags, try to get it from serverInfo
		if (!name && parsedContent.serverInfo) {
			name = parsedContent.name;
		}

		const about = event.tags.find((tag) => tag[0] === 'about')?.[1];
		const picture = event.tags.find((tag) => tag[0] === 'picture')?.[1];
		const website = event.tags.find((tag) => tag[0] === 'website')?.[1];
		const banner = event.tags.find((tag) => tag[0] === 'banner')?.[1];
		const supportEncryption = event.tags.find((tag) => tag[0] === TAG_SUPPORT_ENCRYPTION)?.[1];
		// Return the server with metadata
		return {
			server: parsedContent,
			meta: {
				serverId,
				providerPubkey: event.pubkey,
				name,
				about,
				picture,
				website,
				banner,
				supportEncryption
			}
		};
	} catch (error) {
		logger.error('Error parsing server', error, 'servers:parseServer');
		return null;
	}
};
