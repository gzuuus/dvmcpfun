<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Header from '$lib/components/Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false
			}
		}
	});
</script>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-background text-primary">
		<Header />

		{@render children()}
	</div>
</QueryClientProvider>
