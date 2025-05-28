import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseAnnouncementContent } from './commons';
import type { CapPricing, ResourcesList, ResourcesTemplatesList } from '$lib/types';
import { TAG_CAPABILITY } from '@dvmcp/commons/core';
import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';

/**
 * Parse a resources list event (kind 31318)
 * According to the new DVMCP spec, resources list events contain:
 * - A list of resources or resource templates in the content
 * - Pricing information in the cap tags
 *
 * @param event The resources list event
 * @returns A ResourcesList or ResourcesTemplatesList object or null if parsing fails
 */
export const parseResourcesList = (
	event: NDKEvent
): ResourcesList | ResourcesTemplatesList | null => {
	try {
		const parsedContent = parseAnnouncementContent<{
			resources?: Resource[];
			resourceTemplates?: ResourceTemplate[];
		}>(event.content);

		if (!parsedContent) return null;

		// Check if it's a resources list or a resource templates list
		if (!parsedContent.resources && !parsedContent.resourceTemplates) {
			return null;
		}

		// Extract resource pricing information from cap tags
		const pricingMap = new Map<string, CapPricing>();
		event.tags
			.filter((tag) => tag[0] === TAG_CAPABILITY && tag.length >= 4)
			.forEach((tag) => {
				const [_, resourceName, price, unit] = tag;
				if (resourceName && price && unit) {
					pricingMap.set(resourceName, { price, unit });
				}
			});

		// Return the appropriate type based on what's in the content
		if (parsedContent.resources) {
			return {
				resources: parsedContent.resources,
				resourcesPricing: pricingMap
			};
		} else if (parsedContent.resourceTemplates) {
			return {
				resourceTemplates: parsedContent.resourceTemplates,
				resourceTemplatesPricing: pricingMap // Consistent naming (removed the extra 's')
			};
		}

		return null;
	} catch (error) {
		console.error('Error parsing resources list:', error);
		return null;
	}
};
