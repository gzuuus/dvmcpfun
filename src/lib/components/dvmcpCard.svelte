<script lang="ts">
	import { createAuthorQuery } from '$lib/queries/authors';
	import type { ExtendedDVMCP } from '$lib/types';
	import { truncatePubkeyToNpub } from '$lib/utils';
	import type { NDKTag } from '@nostr-dev-kit/ndk';
	import AuthorCard from './authorCard.svelte';

	export let dvmcp: ExtendedDVMCP;
	const authorQuery = createAuthorQuery(dvmcp.event.pubkey);

	$: identifier = dvmcp.event.tags?.filter((tag: NDKTag) => tag[0] === 'd')?.[0][1] ?? undefined;
</script>

{#if identifier}
	<a
		href="/dvm/{identifier}"
		class="group grid grid-rows-[auto_1fr_auto] rounded-xl border border-primary/40 bg-background p-4 no-underline transition hover:border-primary/40 hover:shadow-lg"
	>
		<div class="mb-2 flex items-center gap-4">
			{#if dvmcp.picture}
				<img
					src={dvmcp.picture}
					alt=""
					class="h-12 w-12 rounded-lg border border-primary/20 object-cover shadow-sm"
				/>
			{:else}
				<div class="h-12 w-12 rounded-lg border border-primary/20 bg-border/10"></div>
			{/if}
			<div class="flex min-w-0 flex-col">
				<h3 class="mb-1 truncate text-xl font-semibold text-primary group-hover:text-primary/60">
					{dvmcp.name}
				</h3>
				<span class="max-w-60">
					<AuthorCard profile={$authorQuery?.data} variant="minimal" pubkey={dvmcp.event.pubkey} />
				</span>
			</div>
		</div>

		{#if dvmcp.about || dvmcp.website}
			<div class="flex min-h-[2.5rem] flex-col gap-1 border-b border-primary/10 pb-2">
				{#if dvmcp.about}
					<p class="line-clamp-2 text-primary/90">{dvmcp.about}</p>
				{/if}
				{#if dvmcp.website}
					<p class="mt-2 line-clamp-2 text-foreground">{dvmcp.website}</p>
				{/if}
			</div>
		{/if}

		{#if dvmcp.toolNames && dvmcp.toolNames.length > 0}
			<div class="flex flex-wrap gap-2 pt-2">
				{#each dvmcp.toolNames.slice(0, 5) as toolName}
					<span
						class="overflow-hidden overflow-ellipsis whitespace-nowrap rounded-full bg-border/20 px-3 py-1 text-xs font-medium text-primary"
					>
						{toolName}
					</span>
				{/each}
				{#if dvmcp.toolNames.length > 5}
					<span class="rounded-full bg-border/30 px-3 py-1 text-xs font-semibold text-primary/40">
						...
					</span>
				{/if}
			</div>
		{/if}
	</a>
{/if}
