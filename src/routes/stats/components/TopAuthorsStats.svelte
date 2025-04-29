<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Spinner from '$lib/components/spinner.svelte';
	import { toolExecutor } from '$lib/services/toolExecutor';
	import { fetchToolById } from '$lib/queries/tools';
	import { truncatePubkeyToNpub } from '$lib/utils';
	import { copyToClipboard } from '$lib/utils';
	import { Chart, type ChartData, type ChartOptions } from 'chart.js/auto';
	import { STATS_SERVER_ID } from '$lib/constants';

	const TOOL_NAME = 'top_authors';

	// Get the execution store from toolExecutor
	const executionStore = toolExecutor.getExecutionStore(TOOL_NAME);

	// Define type for time filter values
	type TimeFilterValue = 'last_24_hours' | 'last_week' | 'last_month' | 'all_time';

	// Define interface for input parameters based on JSON schema
	interface TopAuthorsParams extends Record<string, unknown> {
		kind?: number; // Optional event kind to filter by
		limit: number; // Maximum number of authors to return
		time_filter: TimeFilterValue; // Time filter to apply
	}

	let kind: number | null = $state(null);
	let limit = $state(10);
	let timeFilter = $state<TimeFilterValue>('last_week');

	const timeFilterOptions: { value: TimeFilterValue; label: string }[] = [
		{ value: 'last_24_hours', label: 'Last 24 Hours' },
		{ value: 'last_week', label: 'Last Week' },
		{ value: 'last_month', label: 'Last Month' },
		{ value: 'all_time', label: 'All Time' }
	];

	const limitOptions: { value: string; label: string }[] = [
		{ value: '5', label: '5 Authors' },
		{ value: '10', label: '10 Authors' },
		{ value: '20', label: '20 Authors' },
		{ value: '50', label: '50 Authors' }
	];

	const kindOptions: { value: string; label: string }[] = [
		{ value: '', label: 'All Kinds' },
		{ value: '6910', label: 'Kind 6910' },
		{ value: '5910', label: 'Kind 5910' },
		{ value: '7000', label: 'Kind 7000' }
	];

	// Execute the top_authors tool
	async function executeTopAuthorsQuery() {
		try {
			const server = await fetchToolById(STATS_SERVER_ID);
			if (!server) throw new Error('Stats server not found');

			const tool = server.tools.find((t) => t.name === TOOL_NAME);
			if (!tool) throw new Error('Top authors tool not found');

			// Create params object with proper typing
			const params: TopAuthorsParams = {
				limit: Number(limit),
				time_filter: timeFilter
			};

			// Only add kind if it's not null
			if (kind !== null) params.kind = kind;

			await toolExecutor.executeTool(tool, params, server.event.pubkey);
		} catch (err) {
			console.error('Error executing top authors tool:', err);
		}
	}

	function handleKindChange(event: Event) {
		kind = (event.target as HTMLSelectElement).value
			? Number((event.target as HTMLSelectElement).value)
			: null;
		executeTopAuthorsQuery();
	}

	function handleLimitChange(event: Event) {
		limit = Number((event.target as HTMLSelectElement).value || '10');
		executeTopAuthorsQuery();
	}

	function handleTimeFilterChange(event: Event) {
		timeFilter = ((event.target as HTMLSelectElement).value || 'last_week') as TimeFilterValue;
		executeTopAuthorsQuery();
	}

	onMount(() => {
		executeTopAuthorsQuery();
	});

	onDestroy(() => {
		toolExecutor.resetExecutionState(TOOL_NAME);
	});

	interface AuthorData {
		pubkey: string;
		count: number;
	}

	let parsedResult = $derived(
		$executionStore.status === 'success' && $executionStore.result
			? (JSON.parse($executionStore.result[0].text) as AuthorData[])
			: ([] as AuthorData[])
	);

	let isLoading = $derived($executionStore.status === 'loading');
	let chartCanvas: HTMLCanvasElement | null = $state(null);
	let chart: Chart | null = $state(null);
	let activeTab = $state('chart');

	let chartData = $derived({
		labels: parsedResult.map((author) => truncatePubkeyToNpub(author.pubkey)),
		datasets: [
			{
				label: 'Event Count',
				data: parsedResult.map((author) => author.count),
				backgroundColor: [
					'rgba(54, 162, 235, 0.6)',
					'rgba(255, 99, 132, 0.6)',
					'rgba(75, 192, 192, 0.6)',
					'rgba(255, 206, 86, 0.6)',
					'rgba(153, 102, 255, 0.6)',
					'rgba(255, 159, 64, 0.6)',
					'rgba(199, 199, 199, 0.6)'
				],
				borderColor: [
					'rgba(54, 162, 235, 1)',
					'rgba(255, 99, 132, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
					'rgba(199, 199, 199, 1)'
				],
				borderWidth: 1
			}
		]
	} as ChartData);

	const chartOptions: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						return `Events: ${context.raw}`;
					}
				}
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Event Count'
				}
			},
			x: {
				title: {
					display: true,
					text: 'Authors'
				}
			}
		}
	};

	function initOrUpdateChart() {
		// Only proceed if we have a canvas and data
		if (!chartCanvas || parsedResult.length === 0) return;

		// If chart exists, destroy it first to prevent memory leaks
		if (chart) {
			chart.destroy();
			chart = null;
		}

		// Create a new chart
		chart = new Chart(chartCanvas, {
			type: 'bar',
			data: chartData,
			options: chartOptions
		});
	}

	$effect(() => {
		// When parsedResult or chartCanvas changes, and we're on the chart tab
		if (activeTab === 'chart' && chartCanvas && parsedResult && parsedResult.length > 0) {
			// Use setTimeout to ensure DOM is fully updated
			setTimeout(() => initOrUpdateChart(), 0);
		}
	});

	$effect(() => {
		if (activeTab === 'chart' && chartCanvas && parsedResult && parsedResult.length > 0 && !chart) {
			setTimeout(() => initOrUpdateChart(), 0);
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
		toolExecutor.resetExecutionState(TOOL_NAME);
	});

	function handleTabChange(value: string) {
		activeTab = value;
	}

	$effect(() => {
		console.log($executionStore);
	});
</script>

<div class="space-y-6">
	<div class="rounded-lg border border-primary/20 bg-background p-4">
		<h2 class="mb-4 text-xl font-semibold text-primary">Top Authors</h2>

		<!-- Filters -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<label for="kind" class="mb-2 block text-sm font-medium text-foreground">Event Kind</label>
				<select
					class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					onchange={handleKindChange}
				>
					{#each kindOptions as option}
						<option value={option.value} selected={kind?.toString() === option.value}
							>{option.label}</option
						>
					{/each}
				</select>
			</div>

			<div>
				<label for="limit" class="mb-2 block text-sm font-medium text-foreground">Limit</label>
				<select
					class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					onchange={handleLimitChange}
				>
					{#each limitOptions as option}
						<option value={option.value} selected={limit.toString() === option.value}
							>{option.label}</option
						>
					{/each}
				</select>
			</div>

			<div>
				<label for="timeFilter" class="mb-2 block text-sm font-medium text-foreground"
					>Time Period</label
				>
				<select
					class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					onchange={handleTimeFilterChange}
				>
					{#each timeFilterOptions as option}
						<option value={option.value} selected={timeFilter === option.value}
							>{option.label}</option
						>
					{/each}
				</select>
			</div>
		</div>

		<!-- Results -->
		{#if $executionStore.status === 'error' && $executionStore.error}
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
					Please wait while we fetch the top authors data...
				</Alert.Description>
			</Alert.Root>
		{:else if $executionStore.status === 'success' && $executionStore.result}
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
					<div class="overflow-x-auto">
						<table class="w-full border-collapse">
							<thead>
								<tr class="border-b border-primary/20">
									<th class="px-4 py-2 text-left text-sm font-medium text-primary">Rank</th>
									<th class="px-4 py-2 text-left text-sm font-medium text-primary">Author</th>
									<th class="px-4 py-2 text-left text-sm font-medium text-primary">Event Count</th>
								</tr>
							</thead>
							<tbody>
								{#each parsedResult as author, index}
									<tr class="border-b border-primary/10 hover:bg-primary/5">
										<td class="px-4 py-3 text-sm text-foreground">{index + 1}</td>
										<td class="px-4 py-3 text-sm text-foreground">
											<span class="font-mono">{truncatePubkeyToNpub(author.pubkey)}</span>
										</td>
										<td class="px-4 py-3 text-sm text-foreground">{author.count}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Tabs.Content>

				<Tabs.Content value="raw" class="pt-4">
					<div class="rounded-lg border border-primary/20 bg-background p-4">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm text-primary">Raw Result</span>
							<button
								class="text-sm text-primary hover:text-primary/80"
								onclick={() => {
									copyToClipboard(JSON.stringify($executionStore.result, null, 2));
								}}
							>
								Copy
							</button>
						</div>
						<pre class="overflow-auto font-mono text-sm text-primary">{JSON.stringify(
								parsedResult,
								null,
								2
							)}</pre>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		{:else}
			<div class="rounded-lg border border-primary/20 bg-background p-4 text-center">
				<p class="text-foreground/80">No data available. Try adjusting your filters.</p>
			</div>
		{/if}
	</div>
</div>
