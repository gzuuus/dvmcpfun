<script lang="ts">
	import ndkStore from '$lib/stores/nostr';
	import type { NDKRelay } from '@nostr-dev-kit/ndk';
	import { NDKRelayStatus } from '@nostr-dev-kit/ndk';
	import { CircleX } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let {
		relay,
		expanded = false,
		relayType = 'kind3'
	}: {
		relay: NDKRelay;
		expanded?: boolean;
		relayType?: 'kind3' | 'outbox';
	} = $props();

	let notices = $state<string[]>([]);
	let relayConnectivity = $state(relay.connectivity);

	const noticeHandler = (notice: string) => {
		notices = [...notices, notice];
	};

	onMount(() => {
		relay.on('notice', noticeHandler);
		relay.on('connect', () => (relayConnectivity = relay.connectivity));
		relay.on('disconnect', () => (relayConnectivity = relay.connectivity));
		relay.on('flapping', () => (relayConnectivity = relay.connectivity));

		return () => {
			relay.off('notice', noticeHandler);
			relay.off('connect', () => (relayConnectivity = relay.connectivity));
			relay.off('disconnect', () => (relayConnectivity = relay.connectivity));
			relay.off('flapping', () => (relayConnectivity = relay.connectivity));
		};
	});

	function handleRemoveRelay() {
		const removeRelay =
			relayType == 'kind3'
				? $ndkStore.pool.removeRelay(relay.url)
				: $ndkStore.outboxPool?.removeRelay(relay.url);
		removeRelay && ndkStore.set($ndkStore);
	}
</script>

<li class="flex list-none flex-col">
	<div class="inline-flex items-center gap-2">
		<span
			class="ml-2 h-4 w-2 rounded-full"
			class:bg-orange-400={relayConnectivity.status === NDKRelayStatus.CONNECTING ||
				relayConnectivity.status === NDKRelayStatus.RECONNECTING}
			class:bg-red-500={relayConnectivity.status === NDKRelayStatus.DISCONNECTED}
			class:bg-green-500={relayConnectivity.status === NDKRelayStatus.CONNECTED}
			class:bg-blue-500={relayConnectivity.status === NDKRelayStatus.FLAPPING}
			class:bg-red-600={relayConnectivity.status === NDKRelayStatus.AUTHENTICATING}
		></span>

		<button
			class="font-inherit flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left"
			onclick={() => (expanded = !expanded)}
		>
			<span class="overflow-hidden text-ellipsis whitespace-nowrap font-normal">{relay.url}</span>
			{#if relayConnectivity.openSubs.size > 0}
				<div class="float-right ml-2 cursor-pointer text-sm font-light">
					{relayConnectivity.openSubs.size}{relayConnectivity.openSubs.size === 1 ? '+' : '++'}
				</div>
			{/if}
		</button>
		<button type="button" onclick={handleRemoveRelay}>
			<CircleX class="h-6 w-6" />
		</button>
	</div>

	{#if relay.connectionStats.attempts > 1 && relayConnectivity.status !== NDKRelayStatus.CONNECTED}
		<div class="mt-2 text-sm font-light">
			<small>
				Reconnection attempts: {relay.connectionStats.attempts}
			</small>
		</div>
	{/if}
	{#if expanded}
		<small
			>Connection Attempts: {relay.connectionStats.attempts}, success: {relay.connectionStats
				.success}</small
		>
		{#if notices.length > 0}
			<ul>
				{#each notices as notice, i (i)}
					<li class="rounded bg-red-500 bg-opacity-50 text-sm font-light">{notice}</li>
				{/each}
			</ul>
		{/if}
	{/if}
</li>
