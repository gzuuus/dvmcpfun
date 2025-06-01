export const postKeys = {
	all: ['posts'] as const,
	details: (id: string) => [...postKeys.all, id] as const
};

export const authorKeys = {
	all: ['authors'] as const,
	details: (pubkey: string) => [...authorKeys.all, pubkey] as const,
	nip05: (pubkey: string) => [...authorKeys.details(pubkey), 'nip05'] as const
} as const;

export const toolKeys = {
	all: ['tools'] as const,
	details: (name: string) => [...toolKeys.all, name] as const,
	execution: (hash: string) => [...toolKeys.all, 'execution', hash] as const
} as const;

export const serverKeys = {
	all: ['servers'] as const,
	details: (id: string) => [...serverKeys.all, id] as const,
	capabilities: (id: string) => [...serverKeys.details(id), 'capabilities'] as const
} as const;

export const toolsListKeys = {
	all: ['toolsLists'] as const,
	list: (serverId: string) => [...toolsListKeys.all, serverId] as const
} as const;

export const resourcesListKeys = {
	all: ['resourcesLists'] as const,
	list: (serverId: string) => [...resourcesListKeys.all, serverId] as const
} as const;

export const promptsListKeys = {
	all: ['promptsLists'] as const,
	list: (serverId: string) => [...promptsListKeys.all, serverId] as const
} as const;

export const docsKeys = {
	all: ['docs'] as const,
	details: (id: string) => [...docsKeys.all, id] as const
} as const;
