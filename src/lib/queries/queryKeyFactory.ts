export const postKeys = {
    all: ['posts'] as const,
    details: (id: string) => [...postKeys.all, id] as const,
}

export const authorKeys = {
    all: ['authors'] as const,
    details: (pubkey: string) => [...authorKeys.all, pubkey] as const,
} as const

export const toolKeys = {
    all: ['tools'] as const,
    details: (name: string) => [...toolKeys.all, name] as const,
} as const 