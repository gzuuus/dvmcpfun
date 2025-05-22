<script lang="ts">
	import { setThemeContext } from '@sjsf/shadcn-theme';
	import { components } from '@sjsf/shadcn-theme/default';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import TopAuthorsStats from '$lib/components/stats/TopAuthorsStats.svelte';
	import EventCountsByKindStats from '$lib/components/stats/EventCountsByKindStats.svelte';
	import EventCountsByTimeStats from '$lib/components/stats/EventCountsByTimeStats.svelte';

	setThemeContext({ components });
</script>

<svelte:head>
	<title>Stats | DVMCP Fun</title>
</svelte:head>

<main class="mx-auto max-w-7xl px-6 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-primary">Nostr Network Stats</h1>
		<p class="mt-2 text-foreground/80">
			Real-time statistics from the Nostr network powered by DVMCP stats server.
		</p>
	</div>

	<div class="rounded-lg border border-primary/20 bg-background p-6">
		<Tabs.Root value="top-authors">
			<Tabs.List>
				<Tabs.Trigger value="top-authors">Top Authors</Tabs.Trigger>
				<Tabs.Trigger value="event-counts-kind">Events by Kind</Tabs.Trigger>
				<Tabs.Trigger value="event-counts-time">Events Over Time</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="top-authors" class="pt-4">
				<TopAuthorsStats />
			</Tabs.Content>
			<Tabs.Content value="event-counts-kind" class="pt-4">
				<EventCountsByKindStats />
			</Tabs.Content>
			<Tabs.Content value="event-counts-time" class="pt-4">
				<EventCountsByTimeStats />
			</Tabs.Content>
		</Tabs.Root>
	</div>
</main>
