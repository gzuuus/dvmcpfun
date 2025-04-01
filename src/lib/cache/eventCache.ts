import Dexie, { type Table } from 'dexie';
import { deserialize, NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKEventId, NostrEvent } from '@nostr-dev-kit/ndk';

export interface CachedEvent {
	id: string;
	pubkey: string;
	kind: number;
	createdAt: number;
	content: string;
	tags: string[][];
	sig: string;
	serializedEvent: string;
}

export class EventDatabase extends Dexie {
	events!: Table<CachedEvent>;

	constructor() {
		super('dvmcpfun-event-cache');

		this.version(1).stores({
			events: '&id, kind, pubkey, createdAt'
		});
	}
}

const db = new EventDatabase();

export class EventCache {
	/**
	 * Store an event in the cache
	 */
	async set(event: NDKEvent): Promise<void> {
		if (!event.id) return;

		const serializedEvent = event.serialize(true, true);

		const cachedEvent: CachedEvent = {
			id: event.id,
			pubkey: event.pubkey,
			kind: event.kind,
			createdAt: event.created_at || Math.floor(Date.now() / 1000),
			content: event.content,
			tags: event.tags,
			sig: event.sig || '',
			serializedEvent
		};

		try {
			await db.events.put(cachedEvent);
		} catch (error) {
			console.error('Failed to cache event:', error);
		}
	}

	async get(id: NDKEventId): Promise<NostrEvent | undefined> {
		try {
			const cachedEvent = await db.events.get(id);

			if (!cachedEvent) return undefined;

			try {
				return deserialize(cachedEvent.serializedEvent);
			} catch (error) {
				console.error('Failed to parse cached event:', error);
				return undefined;
			}
		} catch (error) {
			console.error('Failed to retrieve event from cache:', error);
			return undefined;
		}
	}

	async delete(id: NDKEventId): Promise<void> {
		try {
			await db.events.delete(id);
		} catch (error) {
			console.error('Failed to delete event from cache:', error);
		}
	}

	async clear(): Promise<void> {
		try {
			await db.events.clear();
		} catch (error) {
			console.error('Failed to clear event cache:', error);
		}
	}

	async query(filter: Partial<CachedEvent>): Promise<NDKEvent[]> {
		try {
			let collection = db.events.toCollection();

			if (filter.kind !== undefined) {
				collection = collection.filter((event) => event.kind === filter.kind);
			}

			if (filter.pubkey !== undefined) {
				collection = collection.filter((event) => event.pubkey === filter.pubkey);
			}

			const cachedEvents = await collection.toArray();

			return cachedEvents
				.map((cachedEvent) => {
					try {
						const events = deserialize(cachedEvent.serializedEvent);
						return events;
					} catch (error) {
						console.error('Failed to parse cached event:', error);
						return null;
					}
				})
				.filter((event): event is NDKEvent => event !== null);
		} catch (error) {
			console.error('Failed to query events from cache:', error);
			return [];
		}
	}
}

const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

export const eventCache = isBrowser ? new EventCache() : undefined;
