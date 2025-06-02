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
	let currentConnectivityStatus = $state(relay.connectivity.status);
	let currentOpenSubsSize = $state(relay.connectivity.openSubs.size);

	const noticeHandler = (notice: string) => {
		notices = [...notices, notice];
	};

	const updateConnectivityState = () => {
		currentConnectivityStatus = relay.connectivity.status;
		currentOpenSubsSize = relay.connectivity.openSubs.size;
	};

	onMount(() => {
		relay.on('notice', noticeHandler);
		relay.on('connect', updateConnectivityState);
		relay.on('disconnect', updateConnectivityState);
		relay.on('flapping', updateConnectivityState);
		relay.on('ready', updateConnectivityState);

		return () => {
			relay.off('notice', noticeHandler);
			relay.off('connect', updateConnectivityState);
			relay.off('disconnect', updateConnectivityState);
			relay.off('flapping', updateConnectivityState);
			relay.off('ready', updateConnectivityState);
		};
	});

	function handleRemoveRelay() {
		const success =
			relayType == 'kind3'
				? $ndkStore.pool.removeRelay(relay.url)
				: $ndkStore.outboxPool?.removeRelay(relay.url);
		if (success) {
			ndkStore.set($ndkStore);
		}
	}
</script>

<li class="flex list-none flex-col">
	<div class="inline-flex items-center gap-2">
		<span
			class="ml-2 h-4 w-2 rounded-full"
			class:bg-orange-400={currentConnectivityStatus === NDKRelayStatus.CONNECTING ||
				currentConnectivityStatus === NDKRelayStatus.RECONNECTING}
			class:bg-red-500={currentConnectivityStatus === NDKRelayStatus.DISCONNECTED}
			class:bg-green-500={currentConnectivityStatus === NDKRelayStatus.CONNECTED}
			class:bg-blue-500={currentConnectivityStatus === NDKRelayStatus.FLAPPING}
			class:bg-red-600={currentConnectivityStatus === NDKRelayStatus.AUTHENTICATING}
		></span>

		<button
			class="font-inherit flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left"
			onclick={() => (expanded = !expanded)}
		>
			<span class="overflow-hidden text-ellipsis whitespace-nowrap font-normal">{relay.url}</span>
			{#if currentOpenSubsSize > 0}
				<div class="float-right ml-2 cursor-pointer text-sm font-light">
					{currentOpenSubsSize}{currentOpenSubsSize === 1 ? '+' : '++'}
				</div>
			{/if}
		</button>
		<button type="button" onclick={handleRemoveRelay}>
			<CircleX class="h-6 w-6" />
		</button>
	</div>

	{#if relay.connectionStats.attempts > 1 && currentConnectivityStatus !== NDKRelayStatus.CONNECTED}
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
