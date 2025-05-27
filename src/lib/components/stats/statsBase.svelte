<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Spinner from '$lib/components/spinner.svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import { Chart, type ChartType } from 'chart.js/auto';
	import { copyToClipboard } from '$lib/utils';

	type ChartViewResult = { data: any; options: any };

	let {
		toolName,
		title,
		description,
		chartType = 'bar',
		initialActiveTab = 'chart',
		executeQuery,
		chartView,
		tableView,
		filters,
		rawData
	} = $props<{
		toolName: string;
		title: string;
		description?: string;
		chartType?: ChartType;
		initialActiveTab?: string;
		executeQuery: () => Promise<void>;
		chartView: (result: any[]) => ChartViewResult;
		tableView?: (result: any[]) => any;
		filters?: (result: any[]) => any;
		rawData?: (result: any[]) => any;
	}>();

	const executionStore = capabilityExecutor.getExecutionStore(toolName, 'tool');
	let activeTab = $state(initialActiveTab);
	let chartCanvas = $state<HTMLCanvasElement | null>(null);
	let chart = $state<Chart | null>(null);

	let isLoading = $derived($executionStore.status === 'loading');
	let hasError = $derived($executionStore.status === 'error' && !!$executionStore.error);
	let hasData = $derived($executionStore.status === 'success' && !!$executionStore.result);

	function createOrUpdateChart() {
		if (!chartCanvas || !chartView || !$executionStore.result) return;

		if (chart) {
			chart.destroy();
			chart = null;
		}

		const { data, options } = chartView($executionStore.result);

		chart = new Chart(chartCanvas, {
			type: chartType,
			data,
			options
		});
	}

	function handleTabChange(value: string) {
		activeTab = value;
	}

	function copyRawData() {
		if ($executionStore.result) {
			const rawData = $executionStore.result[0].text;
			copyToClipboard(rawData);
		}
	}

	$effect(() => {
		if (activeTab === 'chart' && chartCanvas && $executionStore.result) {
			requestAnimationFrame(createOrUpdateChart);
		}
	});

	onMount(() => {
		executeQuery();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}

		capabilityExecutor.resetExecutionState(toolName, 'tool');
	});
</script>

<div class="space-y-6">
	<div class="rounded-lg border border-primary/20 bg-background p-4">
		<div class="pb-2">
			<h2 class="mb-4 text-xl font-semibold text-primary">{title}</h2>
			<span>{description}</span>
		</div>
		{#if filters}
			{@render filters()}
		{:else}
			<p class="text-muted-foreground">No filters configured.</p>
		{/if}
		{#if hasError}
			<Alert.Root
				class="border-red-500/40 bg-red-500/15 shadow-md dark:border-red-400/30 dark:bg-red-900/30"
			>
				<Alert.Title class="font-semibold text-red-700 dark:text-red-300">Error</Alert.Title>
				<Alert.Description class="text-red-600 dark:text-red-200">
					{$executionStore.error}
				</Alert.Description>
			</Alert.Root>
		{:else if isLoading}
			<Alert.Root class="flex flex-col gap-2 border-blue-500/30 bg-blue-500/10">
				<div class="flex items-center gap-2">
					<Spinner size={4} borderThickness={4} />
					<Alert.Title class="m-0 text-blue-400">Fetching Data</Alert.Title>
				</div>
				<Alert.Description class="text-blue-300">
					Please wait while we fetch the data...
				</Alert.Description>
			</Alert.Root>
		{:else if hasData}
			<Tabs.Root value={activeTab} onValueChange={handleTabChange}>
				<Tabs.List>
					<Tabs.Trigger value="chart">Chart View</Tabs.Trigger>
					<Tabs.Trigger value="table">Table View</Tabs.Trigger>
					<Tabs.Trigger value="raw">Raw Data</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="chart" class="pt-4">
					<div class="h-80 w-full">
						<canvas bind:this={chartCanvas}></canvas>
					</div>
				</Tabs.Content>

				<Tabs.Content value="table" class="pt-4">
					{#if tableView}
						{@render tableView($executionStore.result)}
					{:else}
						<p class="text-muted-foreground">No table view configured.</p>
					{/if}
				</Tabs.Content>

				<Tabs.Content value="raw" class="pt-4">
					<div class="flex flex-col gap-2">
						<div class="flex justify-end">
							<button
								class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
								onclick={copyRawData}
							>
								Copy Raw Data
							</button>
						</div>
						{#if rawData}
							{@render rawData($executionStore.result)}
						{:else}
							<pre
								class="max-h-96 overflow-auto rounded-md bg-muted p-4 text-sm text-muted-foreground">{$executionStore.result
									? $executionStore.result[0].text
									: ''}</pre>
						{/if}
					</div>
				</Tabs.Content>
			</Tabs.Root>
		{:else}
			<Alert.Root class="border-yellow-500/30 bg-yellow-500/10">
				<Alert.Title class="font-semibold text-yellow-600 dark:text-yellow-300">No Data</Alert.Title
				>
				<Alert.Description class="text-yellow-500 dark:text-yellow-200">
					No data available. Try adjusting your filters.
				</Alert.Description>
			</Alert.Root>
		{/if}
	</div>
</div>
