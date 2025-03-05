<script lang="ts">
	import dvmcpsData from '$lib/dvmcps.json';

	let searchQuery = '';

	// Process the dvmcps data
	$: processedDvmcps = dvmcpsData.dvmcps.map(dvmcp => {
		const content = JSON.parse(dvmcp.content);
		const dTag = dvmcp.tags.find(tag => tag[0] === 'd')?.[1] || '';
		const capabilitiesTag = dvmcp.tags.find(tag => tag[0] === 'capabilities')?.[1] || '';
		const createdDate = new Date(dvmcp.created_at * 1000).toLocaleString();

		return {
			...dvmcp,
			processedContent: content,
			dTag,
			capabilitiesTag,
			createdDate
		};
	});

	$: filteredDvmcps = processedDvmcps.filter(
		(dvmcp) =>
			dvmcp.processedContent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			dvmcp.processedContent.about.toLowerCase().includes(searchQuery.toLowerCase()) ||
			dvmcp.dTag.toLowerCase().includes(searchQuery.toLowerCase())
	);
</script>

<div class="min-h-screen bg-[#000100] text-[#B4D2E7]/90">
	<!-- Header -->
	<header class="border-b border-[#C8E9A0]/20">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-4">
				<h1 class="text-2xl font-bold text-[#C8E9A0]">DVMCP.fun</h1>
				<nav class="flex gap-4">
					<a href="#" class="text-[#B4D2E7]/90 hover:text-[#C8E9A0]">Docs</a>
				</nav>
			</div>
			<div class="flex gap-4">
				<a
					href="https://github.com/gzuuus/dvmcp"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md bg-[#C8E9A0] px-4 py-2 text-[#000100] transition-colors hover:bg-[#C8E9A0]/90"
				>
					Build your own
				</a>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-6 py-8">
		<!-- Search -->
		<div class="mb-8">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search DVMCPs..."
					class="w-full rounded-lg border border-[#C8E9A0]/20 bg-[#000100] px-4 py-3 text-[#B4D2E7]/90 placeholder-[#B4D2E7]/40 focus:border-[#C8E9A0] focus:ring-1 focus:ring-[#C8E9A0]/50 focus:outline-none"
				/>
				<button class="absolute top-1/2 right-3 -translate-y-1/2 transform text-[#B4D2E7]/40">
					🔍
				</button>
			</div>
		</div>

		<!-- DVMCP Grid -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredDvmcps as dvmcp}
				<a
					href="/{dvmcp.id}"
					class="group rounded-lg border border-[#C8E9A0]/20 bg-[#000100] p-6 transition-colors hover:border-[#C8E9A0]/50"
				>
					<div class="mb-4 flex items-start justify-between">
						<h3 class="text-xl font-semibold text-[#C8E9A0] group-hover:text-[#C8E9A0]">
							{dvmcp.processedContent.name}
						</h3>
						<span class="text-[#B4D2E7]/60">{dvmcp.createdDate}</span>
					</div>
					<div class="mb-4 flex gap-2">
						<span class="rounded-full bg-[#C8E9A0]/20 px-3 py-1 text-sm text-[#C8E9A0]">{dvmcp.dTag}</span>
						<span class="rounded-full bg-[#C8E9A0]/20 px-3 py-1 text-sm text-[#C8E9A0]">{dvmcp.capabilitiesTag}</span>
					</div>
					<p class="text-[#B4D2E7]/90">{dvmcp.processedContent.about}</p>
				</a>
			{/each}
		</div>
	</main>
</div>
