<script lang="ts">
	import StatsBase from '$lib/components/stats/statsBase.svelte';
	import { type ChartData, type ChartOptions } from 'chart.js/auto';
	import { intervalOptions, kindOptions, limitOptions } from '../../../routes/stats/constants';
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';
	import { executeStatQuery, parseStatResult } from '$lib/utils/stats';

	const TOOL_NAME = 'event_count_by_time';
	let tool: Tool | undefined = $state(undefined);

	interface TimeData {
		time: string;
		count: number;
	}

	interface EventCountsByTimeParams extends Record<string, unknown> {
		interval: string;
		kind?: number;
		limit?: number;
	}

	let kind = $state<number | null>(null);
	let interval = $state<string>('day');
	let limit = $state<number>(50);

	function mapAndSortData(
		parsedData: TimeData[],
		reverse = false
	): { time_period: string; count: number }[] {
		const mappedData = parsedData.map((item) => ({
			time_period: item.time,
			count: item.count
		}));

		return [...mappedData].sort((a, b) => {
			const timeA = new Date(a.time_period.replace('W', '-')).getTime(); // Attempt to parse various formats
			const timeB = new Date(b.time_period.replace('W', '-')).getTime();

			if (!isNaN(timeA) && !isNaN(timeB)) {
				return reverse ? timeB - timeA : timeA - timeB;
			}

			// Fallback to string comparison if date parsing fails
			const comparison = a.time_period.localeCompare(b.time_period);
			return reverse ? -comparison : comparison;
		});
	}

	// --- Prop Functions for StatsBase ---
	function renderChartView(result: any[]) {
		const parsedData = parseStatResult<TimeData>(result);
		const sortedData = mapAndSortData(parsedData, false); // Chronological order for chart

		const data: ChartData = {
			labels: sortedData.map((item) => item.time_period),
			datasets: [
				{
					label: 'Event Count',
					data: sortedData.map((item) => item.count),
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 2,
					tension: 0.3,
					fill: true
				}
			]
		};

		const options: ChartOptions<'line'> = {
			// Specify 'line' type for options
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: 300
			},
			plugins: {
				legend: {
					display: false // Usually hide legend for single dataset line charts
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
						display: false, // Title might be redundant if labels are clear time periods
						text: 'Time Period'
					},
					ticks: {
						autoSkip: true,
						maxTicksLimit: 15 // Limit ticks to avoid overlap
					}
				}
			}
		};

		return { data, options };
	}

	// --- Event Handlers ---
	function handleKindChange(event: Event) {
		kind = (event.target as HTMLSelectElement).value
			? Number((event.target as HTMLSelectElement).value)
			: null;
		executeEventCountsByTimeQuery();
	}

	function handleIntervalChange(event: Event) {
		interval = (event.target as HTMLSelectElement).value || 'day';
		executeEventCountsByTimeQuery();
	}

	function handleLimitChange(event: Event) {
		limit = Number((event.target as HTMLSelectElement).value || '30');
		executeEventCountsByTimeQuery();
	}

	// --- Query Execution ---
	async function executeEventCountsByTimeQuery() {
		const params: EventCountsByTimeParams = {
			interval: interval,
			limit: limit
		};

		if (kind !== null) params.kind = kind;

		const fetchedTool = await executeStatQuery(TOOL_NAME, params);
		if (fetchedTool) {
			tool = fetchedTool;
		}
	}
</script>

<StatsBase
	toolName={TOOL_NAME}
	title="Event Counts Over Time"
	description={tool?.description}
	chartType="line"
	initialActiveTab="chart"
	executeQuery={executeEventCountsByTimeQuery}
	chartView={renderChartView}
	tableView={renderTableView}
	rawData={renderRawData}
	filters={renderFilters}
/>

{#snippet renderFilters()}
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
		<!-- Kind Filter -->
		<div>
			<label for="event-kind" class="mb-2 block text-sm font-medium text-foreground"
				>Event Kind</label
			>
			<select
				id="event-kind"
				class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				value={kind ?? ''}
				onchange={handleKindChange}
			>
				{#each kindOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Interval Filter -->
		<div>
			<label for="interval" class="mb-2 block text-sm font-medium text-foreground">Interval</label>
			<select
				id="interval"
				class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={interval}
				onchange={handleIntervalChange}
			>
				{#each intervalOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Limit Filter -->
		<div>
			<label for="limit-periods" class="mb-2 block text-sm font-medium text-foreground">Limit</label
			>
			<select
				id="limit-periods"
				class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				bind:value={limit}
				onchange={handleLimitChange}
			>
				{#each limitOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
{/snippet}

{#snippet renderTableView(result: any[])}
	{@const parsedData = parseStatResult<TimeData>(result)}
	{@const sortedData = mapAndSortData(parsedData, true)}
	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b border-primary/20">
					<th class="px-4 py-2 text-left text-sm font-medium text-primary">Time Period</th>
					<th class="px-4 py-2 text-left text-sm font-medium text-primary">Event Count</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedData as item}
					<tr class="border-b border-primary/10 hover:bg-primary/5">
						<td class="px-4 py-3 text-sm text-foreground">{item.time_period}</td>
						<td class="px-4 py-3 text-sm text-foreground">{item.count}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="2" class="px-4 py-3 text-center text-sm text-muted-foreground"
							>No data available for selected filters.</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

{#snippet renderRawData(result: any[])}
	{@const parsedData = parseStatResult<TimeData>(result)}
	<pre
		class="max-h-96 overflow-auto rounded-md bg-muted p-4 font-mono text-sm text-muted-foreground">{JSON.stringify(
			parsedData,
			null,
			2
		)}</pre>
{/snippet}
