<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Header from '$lib/components/Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import RelayWidget from '$lib/components/relayWidget.svelte';

	let { children } = $props();
	const siteTitle = 'DVMCP Fun';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false
			}
		}
	});
</script>

<svelte:head>
	<title>{siteTitle}</title>
</svelte:head>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-background text-primary">
		<Header />

		{@render children()}
		<section class="fixed bottom-0 z-20 flex">
			<RelayWidget />
		</section>
	</div>
</QueryClientProvider>
