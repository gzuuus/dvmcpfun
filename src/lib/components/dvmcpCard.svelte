<script lang="ts">
	import { createAuthorQuery } from '$lib/queries/authors';
	import type { ExtendedDVMCP } from '$lib/types';

	export let dvmcp: ExtendedDVMCP;
	const authorQuery = createAuthorQuery(dvmcp.event.pubkey);

	function truncatePubkey(pubkey: string): string {
		return `${pubkey.slice(0, 8)}...${pubkey.slice(-3)}`;
	}
</script>

<a
	href="/dvm/{dvmcp.event.id}"
	class="group rounded-lg border border-primary/20 bg-background p-6 transition-colors hover:border-primary/50"
>
	<div class="space-y-1">
		<div class="flex items-center gap-3">
			{#if dvmcp.picture}
				<img
					src={dvmcp.picture}
					alt=""
					class="h-8 w-8 rounded-lg border border-primary/20 object-cover"
				/>
			{:else}
				<div class="h-8 w-8 rounded-lg border border-primary/20 bg-border/10"></div>
			{/if}
			<h3 class="text-xl font-semibold text-primary group-hover:text-primary/50">
				{dvmcp.name}
			</h3>
		</div>
		<p class="text-sm text-primary/60">
			{#if $authorQuery?.isLoading}
				<span class="animate-pulse">Loading author...</span>
			{:else}
				by {$authorQuery?.data?.name || truncatePubkey(dvmcp.event.pubkey)}
			{/if}
		</p>
	</div>

	<div class="mt-4 flex w-fit flex-col flex-wrap gap-2">
		{#if dvmcp.about}
			<p class="mt-2 line-clamp-2 text-primary/50">{dvmcp.about}</p>
		{/if}
		{#if dvmcp.website}
			<p class="mt-2 line-clamp-2 text-primary/50">{dvmcp.website}</p>
		{/if}
	</div>
	<div class="mt-4 flex flex-wrap gap-2">
		{#if dvmcp.toolNames && dvmcp.toolNames.length > 0}
			{#each dvmcp.toolNames as toolName}
				<span
					class="overflow-hidden overflow-ellipsis whitespace-nowrap rounded-full bg-border/20 px-3 py-1 text-sm text-primary"
				>
					{toolName}
				</span>
			{/each}
		{/if}
	</div>
</a>
