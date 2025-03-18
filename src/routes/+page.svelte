<script lang="ts">
	import { createToolsQuery } from '$lib/queries/tools';
	import DvmcpCard from '../components/dvmcpCard.svelte';

	const toolsQuery = createToolsQuery();
	let searchQuery = '';

	$: filteredTools = $toolsQuery.data?.filter((tool) => {
		if (!searchQuery) return true;
		const search = searchQuery.toLowerCase();
		return (
			tool.name.toLowerCase().includes(search) ||
			tool.description.toLowerCase().includes(search) ||
			tool.capabilities?.some((cap) => cap.toLowerCase().includes(search)) ||
			tool.about?.toLowerCase().includes(search)
		);
	});
</script>

<!-- Main Content -->
<main class="mx-auto max-w-7xl px-6 py-8">
	<div class="mb-6">
		<input
			type="text"
			placeholder="Search tools..."
			bind:value={searchQuery}
			class="w-full rounded-lg border border-primary/20 bg-background px-4 py-2 text-primary/50 placeholder-primary/40 focus:border-primary/50 focus:outline-none"
		/>
	</div>

	{#if $toolsQuery.isLoading}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<div class="group animate-pulse rounded-lg border border-primary/20 bg-background p-6">
					<div class="mb-4 h-6 w-3/4 rounded bg-border/20"></div>
					<div class="h-4 w-1/2 rounded bg-border/20"></div>
				</div>
			{/each}
		</div>
	{:else if $toolsQuery.isError}
		<div class="rounded-lg border border-destructive/20 bg-red-500/10 p-6 text-destructive">
			Error: {$toolsQuery.error.message}
		</div>
	{:else if filteredTools}
		{#if filteredTools.length === 0}
			<div class="text-center text-primary/50">
				No tools found matching "{searchQuery}"
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredTools as tool (tool.eventId)}
					<DvmcpCard {tool} />
				{/each}
			</div>
		{/if}
	{/if}
</main>
