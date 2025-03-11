<script lang="ts">
	import { createToolsQuery } from '$lib/queries/tools';
	import type { McpTool } from '$lib/queries/tools';
	import Header from '../components/Header.svelte';
	import ToolCard from '../components/ToolCard.svelte';

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

<div class="min-h-screen bg-[#000100] text-[#B4D2E7]/90">
	<Header />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-6 py-8">
		<div class="mb-6">
			<input
				type="text"
				placeholder="Search tools..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-[#C8E9A0]/20 bg-[#000100] px-4 py-2 text-[#B4D2E7]/90 placeholder-[#B4D2E7]/40 focus:border-[#C8E9A0]/50 focus:outline-none"
			/>
		</div>

		{#if $toolsQuery.isLoading}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<div class="group rounded-lg border border-[#C8E9A0]/20 bg-[#000100] p-6 animate-pulse">
						<div class="h-6 bg-[#C8E9A0]/20 rounded w-3/4 mb-4"></div>
						<div class="h-4 bg-[#C8E9A0]/20 rounded w-1/2"></div>
					</div>
				{/each}
			</div>
		{:else if $toolsQuery.isError}
			<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-400">
				Error: {$toolsQuery.error.message}
			</div>
		{:else if filteredTools}
			{#if filteredTools.length === 0}
				<div class="text-center text-[#B4D2E7]/60">
					No tools found matching "{searchQuery}"
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredTools as tool (tool.eventId)}
						<ToolCard {tool} />
					{/each}
				</div>
			{/if}
		{/if}
	</main>
</div>
