<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { nostrService } from '$lib/stores/nostr';
	import Header from '../components/Header.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false
			}
		}
	});

	onMount(() => {
		nostrService.connect();
	});
</script>

<ModeWatcher />

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-background text-primary">
		<Header />

		{@render children()}
	</div>
</QueryClientProvider>
