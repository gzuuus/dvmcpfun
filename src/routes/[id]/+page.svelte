<script lang="ts">
	import { page } from '$app/stores';
	import dvmcpsData from '$lib/dvmcps.json';

	let processedDvmcp: any;

	// Process the dvmcp data
	$: dvmcp = dvmcpsData.dvmcps.find((d) => d.id === $page.params.id);
	$: if (dvmcp) {
		const content = JSON.parse(dvmcp.content);
		const dTag = dvmcp.tags.find((tag) => tag[0] === 'd')?.[1] || '';
		const capabilitiesTag = dvmcp.tags.find((tag) => tag[0] === 'capabilities')?.[1] || '';
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

<div class="min-h-screen bg-background text-primary/50">
	<!-- Header -->
	<header class="border-b border-primary/20">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-4">
				<a href="/" class="text-2xl font-bold text-primary hover:text-primary/90">DVMCP.fun</a>
				<nav class="flex gap-4">
					<a href="#" class="text-primary/50 hover:text-primary">Docs</a>
				</nav>
			</div>
			<div class="flex gap-4">
				<a
					href="https://github.com/gzuuus/dvmcp"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md bg-border px-4 py-2 text-background transition-colors hover:bg-border/90"
				>
					Build your own
				</a>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-6 py-8">
		{#if processedDvmcp}
			<div class="rounded-lg border border-primary/20 bg-background p-6">
				<div class="mb-4 flex items-start justify-between">
					<h1 class="text-2xl font-semibold text-primary">
						{processedDvmcp.processedContent.name}
					</h1>
					<span class="text-primary/50">{processedDvmcp.createdDate}</span>
				</div>
				<div class="mb-4 flex gap-2">
					<span class="rounded-full bg-border/20 px-3 py-1 text-sm text-primary"
						>{processedDvmcp.dTag}</span
					>
					<span class="rounded-full bg-border/20 px-3 py-1 text-sm text-primary"
						>{processedDvmcp.capabilitiesTag}</span
					>
				</div>
				<p class="mb-6 text-primary/50">{processedDvmcp.processedContent.about}</p>

				<div class="space-y-6">
					<h2 class="text-xl font-semibold text-primary">Raw Data</h2>
					<pre class="overflow-x-auto rounded bg-background p-4 text-sm text-primary/50">
						{JSON.stringify(processedDvmcp, null, 2)}
					</pre>
				</div>
			</div>
		{:else}
			<div class="text-center">
				<h1 class="text-2xl font-semibold text-primary">DVMCP not found</h1>
				<p class="mt-2 text-primary/50">The DVMCP you're looking for doesn't exist.</p>
				<a
					href="/"
					class="mt-4 inline-block rounded-md bg-border px-4 py-2 text-background transition-colors hover:bg-border/90"
				>
					Back to Home
				</a>
			</div>
		{/if}
	</main>
</div>
