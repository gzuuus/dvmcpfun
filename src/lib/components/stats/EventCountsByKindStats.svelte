<script lang="ts">
	import StatsBase from '$lib/components/stats/statsBase.svelte';
	import { generateRandomColors } from '$lib/utils';
	import { type ChartData, type ChartOptions } from 'chart.js/auto';
	import { timeFilterOptions, type TimeFilterValue } from '../../../routes/stats/constants';
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';
	import { executeStatQuery, parseStatResult } from '$lib/utils/stats';

	const TOOL_NAME = 'event_count_by_kind';
	let tool: Tool | undefined = $state(undefined);
	interface KindData {
		kind: number;
		count: number;
	}

	interface EventCountsByKindParams extends Record<string, unknown> {
		time_filter: TimeFilterValue;
	}

	let timeFilter = $state<TimeFilterValue>('last_week');

	function formatKindLabel(kind: number): string {
		return `Kind ${kind}`;
	}

	function renderChartView(result: any[]) {
		const parsedData = parseStatResult<KindData>(result);

		const data: ChartData = {
			labels: parsedData.map((item) => formatKindLabel(item.kind)),
			datasets: [
				{
					label: 'Event Count',
					data: parsedData.map((item) => item.count),
					backgroundColor: generateRandomColors(parsedData.length),
					borderWidth: 1
				}
			]
		};

		const options: ChartOptions = {
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: 300
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					callbacks: {
						label: function (context: any) {
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
						text: 'Event Kind'
					}
				}
			}
		};

		return { data, options };
	}

	function handleTimeFilterChange(event: Event) {
		timeFilter = ((event.target as HTMLSelectElement).value || 'last_week') as TimeFilterValue;
		executeEventCountsByKindQuery();
	}

	async function executeEventCountsByKindQuery() {
		const params: EventCountsByKindParams = {
			time_filter: timeFilter
		};
		const fetchedTool = await executeStatQuery(TOOL_NAME, params);
		// Update the local tool state if the query was successful
		// executeStatQuery handles console logging errors internally
		if (fetchedTool) {
			tool = fetchedTool;
		}
	}
</script>

{#snippet renderTableView(result: any[])}
	{@const parsedData = parseStatResult<KindData>(result)}
	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b border-primary/20">
					<th class="px-4 py-2 text-left text-sm font-medium text-primary">Kind</th>
					<th class="px-4 py-2 text-left text-sm font-medium text-primary">Event Count</th>
				</tr>
			</thead>
			<tbody>
				{#each parsedData as item}
					<tr class="border-b border-primary/10 hover:bg-primary/5">
						<td class="px-4 py-3 text-sm text-foreground">{formatKindLabel(item.kind)}</td>
						<td class="px-4 py-3 text-sm text-foreground">{item.count}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="2" class="px-4 py-3 text-center text-sm text-muted-foreground"
							>No data available.</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

{#snippet renderRawData(result: any[])}
	{@const parsedData = parseStatResult<KindData>(result)}
	<pre
		class="max-h-96 overflow-auto rounded-md bg-muted p-4 font-mono text-sm text-muted-foreground">{JSON.stringify(
			parsedData,
			null,
			2
		)}</pre>
{/snippet}

<StatsBase
	toolName={TOOL_NAME}
	title="Event Counts by Kind"
	description={tool?.description}
	chartType="bar"
	initialActiveTab="chart"
	executeQuery={executeEventCountsByKindQuery}
	chartView={renderChartView}
	tableView={renderTableView}
	rawData={renderRawData}
	filters={renderFilters}
/>

{#snippet renderFilters()}
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div>
			<label for="timeFilter" class="mb-2 block text-sm font-medium text-foreground"
				>Time Period</label
			>
			<select
				class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				onchange={handleTimeFilterChange}
			>
				{#each timeFilterOptions as option}
					<option value={option.value} selected={timeFilter === option.value}>{option.label}</option
					>
				{/each}
			</select>
		</div>
	</div>
{/snippet}
