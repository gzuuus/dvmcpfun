<script lang="ts">
	import StatsBase from '$lib/components/stats/statsBase.svelte';
	import { truncatePubkeyToNpub, generateRandomColors } from '$lib/utils';
	import { type ChartData, type ChartOptions } from 'chart.js/auto';
	import {
		kindOptions,
		limitOptions,
		timeFilterOptions,
		type TimeFilterValue
	} from '../../../routes/stats/constants';
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';
	import { executeStatQuery, parseStatResult } from '$lib/utils/stats';

	const TOOL_NAME = 'top_authors';
	let tool: Tool | undefined = $state(undefined);

	interface AuthorData {
		pubkey: string;
		count: number;
	}

	interface TopAuthorsParams extends Record<string, unknown> {
		kind?: number;
		limit?: number;
		time_filter?: TimeFilterValue;
	}

	function renderChartView(result: any[]) {
		const parsedData = parseStatResult<AuthorData>(result);
		const backgroundColors = generateRandomColors(parsedData.length);
		const data: ChartData = {
			labels: parsedData.map((author) => truncatePubkeyToNpub(author.pubkey)),
			datasets: [
				{
					label: 'Event Count',
					data: parsedData.map((author) => author.count),
					backgroundColor: backgroundColors,
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
						text: 'Authors'
					}
				}
			}
		};

		return { data, options };
	}

	let kind = $state<number | null>(null);
	let limit = $state(20);
	let timeFilter = $state<TimeFilterValue>('last_week');

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

	async function executeTopAuthorsQuery() {
		const params: TopAuthorsParams = {
			limit: Number(limit),
			time_filter: timeFilter
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
	title="Top Authors"
	description={tool?.description}
	chartType="bar"
	initialActiveTab="chart"
	executeQuery={executeTopAuthorsQuery}
	chartView={renderChartView}
	tableView={renderTableView}
	rawData={renderRawData}
	filters={renderFilters}
/>

{#snippet renderFilters()}
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div>
			<label for="kind" class="mb-2 block text-sm font-medium text-foreground">Event Kind</label>
			<select
				class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				onchange={handleKindChange}
			>
				{#each kindOptions as option}
					<option
						value={option.value}
						selected={(kind !== null && kind === option.value) ||
							(kind === null && option.value === '')}>{option.label}</option
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
					<option value={option.value} selected={limit === option.value}>{option.label}</option>
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
					<option value={option.value} selected={timeFilter === option.value}>{option.label}</option
					>
				{/each}
			</select>
		</div>
	</div>
{/snippet}

{#snippet renderTableView(result: any[])}
	{@const parsedData = parseStatResult<AuthorData>(result)}
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
				{#each parsedData as author, index}
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
{/snippet}

{#snippet renderRawData(result: any[])}
	{@const parsedData = parseStatResult<AuthorData>(result)}
	<pre class="overflow-auto font-mono text-sm text-primary">{JSON.stringify(
			parsedData,
			null,
			2
		)}</pre>
{/snippet}
