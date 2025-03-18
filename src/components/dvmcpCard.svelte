<script lang="ts">
	import { createAuthorQuery } from '$lib/queries/authors';
	import type { McpTool } from '$lib/queries/tools';

	export let tool: McpTool;
	const authorQuery = createAuthorQuery(tool.author);

	function truncatePubkey(pubkey: string): string {
		return `${pubkey.slice(0, 8)}...${pubkey.slice(-3)}`;
	}

	$: console.log(tool);
</script>

<a
	href="/s/{tool.eventId}"
	class="group rounded-lg border border-primary/20 bg-background p-6 transition-colors hover:border-primary/50"
>
	<div class="space-y-1">
		<div class="flex items-center gap-3">
			{#if $authorQuery.isLoading}
				<div class="h-8 w-8 animate-pulse rounded-lg border border-primary/20 bg-border/10"></div>
			{:else if $authorQuery.data?.picture}
				<img
					src={$authorQuery.data.picture}
					alt=""
					class="h-8 w-8 rounded-lg border border-primary/20 object-cover"
				/>
			{:else}
				<div class="h-8 w-8 rounded-lg border border-primary/20 bg-border/10"></div>
			{/if}
			<h3 class="text-xl font-semibold text-primary group-hover:text-primary/50">
				{tool.name}
			</h3>
		</div>
		<p class="text-sm text-primary/60">
			{#if $authorQuery.isLoading}
				<span class="animate-pulse">Loading author...</span>
			{:else}
				by {$authorQuery.data?.name || truncatePubkey(tool.author)}
			{/if}
		</p>
	</div>

	<div class="mt-4 flex w-fit flex-col flex-wrap gap-2">
		{#if tool.about}
			<p class="mt-2 line-clamp-2 text-primary/50">{tool.about}</p>
		{/if}

		<p class="mt-4 line-clamp-2 text-primary/50">{tool.description}</p>

		{#if tool.parameters}
			<span class="rounded-full bg-border/20 px-3 py-1 text-sm text-primary">
				{Object.keys(tool.parameters).length} parameter{Object.keys(tool.parameters).length === 1
					? ''
					: 's'}
			</span>
		{/if}
		{#if tool.capabilities && tool.capabilities.length > 0}
			{#each tool.capabilities as capability}
				<span class="w-fit rounded-full bg-border/20 px-3 py-1 text-sm text-primary/50">
					{capability}
				</span>
			{/each}
		{/if}
	</div>
	<div class="mt-4 flex flex-wrap gap-2">
		{#if tool.toolNames && tool.toolNames.length > 0}
			{#each tool.toolNames as toolName}
				<span
					class="overflow-hidden overflow-ellipsis whitespace-nowrap rounded-full bg-border/20 px-3 py-1 text-sm text-primary/50"
				>
					{toolName}
				</span>
			{/each}
		{/if}
	</div>
</a>
