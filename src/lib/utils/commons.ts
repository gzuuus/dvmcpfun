import type { DVMCPContent } from '$lib/types';

export function parseAnnouncementContent(content: string): DVMCPContent | null {
	try {
		return JSON.parse(content);
	} catch {
		return null;
	}
}
