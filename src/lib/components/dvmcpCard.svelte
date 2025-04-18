<script lang="ts">
	import { createAuthorQuery } from '$lib/queries/authors';
	import type { ExtendedDVMCP } from '$lib/types';
	import type { NDKTag } from '@nostr-dev-kit/ndk';

	export let dvmcp: ExtendedDVMCP;
	const authorQuery = createAuthorQuery(dvmcp.event.pubkey);

	function truncatePubkey(pubkey: string): string {
		return `${pubkey.slice(0, 8)}...${pubkey.slice(-3)}`;
	}

	$: identifier = dvmcp.event.tags?.filter((tag: NDKTag) => tag[0] === 'd')?.[0][1] ?? undefined;
</script>

{#if identifier}
	<a
		href="/dvm/{identifier}"
		class="group flex flex-col gap-4 rounded-xl border border-primary/20 bg-background p-4 no-underline transition hover:border-primary/40 hover:shadow-lg"
	>
		<div class="flex items-center gap-4">
			{#if dvmcp.picture}
				<img
					src={dvmcp.picture}
					alt=""
					class="h-12 w-12 rounded-lg border border-primary/20 object-cover shadow-sm"
				/>
			{:else}
				<div class="h-12 w-12 rounded-lg border border-primary/20 bg-border/10"></div>
			{/if}
			<div class="flex flex-col">
				<h3 class="mb-1 text-xl font-semibold text-primary group-hover:text-primary/60">
					{dvmcp.name}
				</h3>
				<p class="text-xs text-muted-foreground">
					{#if $authorQuery?.isLoading}
						<span class="animate-pulse">Loading author...</span>
					{:else}
						by {$authorQuery?.data?.name || truncatePubkey(dvmcp.event.pubkey)}
					{/if}
				</p>
			</div>
		</div>

		{#if dvmcp.about || dvmcp.website}
			<div class="flex flex-col gap-1 border-b border-primary/10 pb-2">
				{#if dvmcp.about}
					<p class=" line-clamp-2 text-primary/50">{dvmcp.about}</p>
				{/if}
				{#if dvmcp.website}
					<p class="mt-2 line-clamp-2 text-primary/50">{dvmcp.website}</p>
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
