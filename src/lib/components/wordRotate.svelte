<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let {
		words = ['DVMCP', 'Fun'],
		duration = 2100,
		class: className = ''
	}: {
		words?: string[];
		duration?: number;
		class?: string;
	} = $props();

	let index = $state(0);
	let chnageIndex = () => {
		index = (index + 1) % words.length;
	};
	onMount(() => {
		let interval = setInterval(chnageIndex, duration);
		return () => clearInterval(interval);
	});
</script>

<div class="overflow-hidden py-2">
	{#key index}
		<h2
			in:fly={{ y: -50, delay: 200 }}
			out:fly={{ y: 40, duration: 200 }}
			class={cn(className, 'text-center')}
		>
			{words[index]}
		</h2>
	{/key}
</div>
