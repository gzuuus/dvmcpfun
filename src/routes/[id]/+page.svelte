<script lang="ts">
	import { page } from '$app/stores';
	import dvmcpsData from '$lib/dvmcps.json';

	let processedDvmcp: any;

	// Process the dvmcp data
	$: dvmcp = dvmcpsData.dvmcps.find(d => d.id === $page.params.id);
	$: if (dvmcp) {
		const content = JSON.parse(dvmcp.content);
		const dTag = dvmcp.tags.find(tag => tag[0] === 'd')?.[1] || '';
		const capabilitiesTag = dvmcp.tags.find(tag => tag[0] === 'capabilities')?.[1] || '';
		const createdDate = new Date(dvmcp.created_at * 1000).toLocaleString();

		processedDvmcp = {
			...dvmcp,
			processedContent: content,
			dTag,
			capabilitiesTag,
			createdDate
		};
	}
</script>

<div class="min-h-screen bg-[#000100] text-[#B4D2E7]/90">
	<!-- Header -->
	<header class="border-b border-[#C8E9A0]/20">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-4">
				<a href="/" class="text-2xl font-bold text-[#C8E9A0] hover:text-[#C8E9A0]/90">DVMCP.fun</a>
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
		{#if processedDvmcp}
			<div class="rounded-lg border border-[#C8E9A0]/20 bg-[#000100] p-6">
				<div class="mb-4 flex items-start justify-between">
					<h1 class="text-2xl font-semibold text-[#C8E9A0]">
						{processedDvmcp.processedContent.name}
					</h1>
					<span class="text-[#B4D2E7]/60">{processedDvmcp.createdDate}</span>
				</div>
				<div class="mb-4 flex gap-2">
					<span class="rounded-full bg-[#C8E9A0]/20 px-3 py-1 text-sm text-[#C8E9A0]">{processedDvmcp.dTag}</span>
					<span class="rounded-full bg-[#C8E9A0]/20 px-3 py-1 text-sm text-[#C8E9A0]">{processedDvmcp.capabilitiesTag}</span>
				</div>
				<p class="mb-6 text-[#B4D2E7]/90">{processedDvmcp.processedContent.about}</p>
				
				<div class="space-y-6">
					<h2 class="text-xl font-semibold text-[#C8E9A0]">Raw Data</h2>
					<pre class="overflow-x-auto rounded bg-[#000100] p-4 text-sm text-[#B4D2E7]/60">
						{JSON.stringify(processedDvmcp, null, 2)}
					</pre>
				</div>
			</div>
		{:else}
			<div class="text-center">
				<h1 class="text-2xl font-semibold text-[#C8E9A0]">DVMCP not found</h1>
				<p class="mt-2 text-[#B4D2E7]/90">The DVMCP you're looking for doesn't exist.</p>
				<a href="/" class="mt-4 inline-block rounded-md bg-[#C8E9A0] px-4 py-2 text-[#000100] transition-colors hover:bg-[#C8E9A0]/90">
					Back to Home
				</a>
			</div>
		{/if}
	</main>
</div> 