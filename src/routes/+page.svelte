<script lang="ts">
	import DvmcpCard from '$lib/components/serverCard.svelte';
	import WordRotate from '$lib/components/wordRotate.svelte';
	import { createServersQuery } from '$lib/queries/servers';
	import ndkStore from '$lib/stores/nostr';

	const pageTitle = 'Home | DVMCP Fun';

	const serversQuery = createServersQuery();
	let searchQuery = $state('');

	let previousRelayCount = $state(0);

	let filteredServers = $derived(
		$serversQuery.data?.filter((server) => {
			if (!searchQuery) return true;
			const search = searchQuery.toLowerCase();
			return (
				server.meta.name?.toLowerCase().includes(search) ||
				server.meta.about?.toLowerCase().includes(search)
			);
		})
	);

	$effect(() => {
		if ($ndkStore.pool) {
			const currentRelayCount = $ndkStore.pool.relays.size;
			if (currentRelayCount !== previousRelayCount) {
				previousRelayCount = currentRelayCount;
				$serversQuery.refetch();
			}
		}
	});

	let phrases = [
		'is fun',
		'is for everyone',
		'is open source',
		'is decentralized computing',
		'DVM♥️MCP'
	];
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<!-- Main Content -->
<main class="mx-auto max-w-7xl px-6 py-8">
	<div class="my-2 h-52 text-center">
		<div class="flex flex-col items-center">
			<h1 class="text-[4rem] text-black dark:text-white">DVMCP</h1>
			<WordRotate class=" font-thin text-black dark:text-white" words={phrases} duration={3250} />
		</div>
	</div>
	<div class="mb-6 flex gap-2">
		<input
			type="text"
			placeholder="Search tools..."
			bind:value={searchQuery}
			class="flex-1 rounded-lg border border-primary/20 bg-background px-4 py-2 text-primary/50 placeholder-primary/40 focus:border-primary/50 focus:outline-none"
		/>
	</div>
	{#if $serversQuery.isLoading}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<div class="group animate-pulse rounded-lg border border-primary/20 bg-background p-6">
					<div class="mb-4 h-6 w-3/4 rounded bg-border/20"></div>
					<div class="h-4 w-1/2 rounded bg-border/20"></div>
				</div>
			{/each}
		</div>
	{:else if $serversQuery.isError}
		<div class="rounded-lg border border-destructive/20 bg-red-500/10 p-6 text-destructive">
			Error: {$serversQuery.error.message}
		</div>
	{:else if filteredServers}
		{#if filteredServers.length === 0}
			<div class="text-center text-primary/50">
				No tools found matching "{searchQuery}"
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredServers as server (server.meta.serverId)}
					<DvmcpCard {server} />
				{/each}
			</div>
		{/if}
	{/if}
</main>
