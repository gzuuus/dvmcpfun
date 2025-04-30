export const statsDvmcpPubkey = '6b3780ef2972e73d370b84a3e51e7aa9ae34bf412938dcfbd9c5f63b221416c8';
export const statsServerId = 'dvm-announcement-dvmcp-relay-monitor';
export type TimeFilterValue = 'last_24_hours' | 'last_week' | 'last_month' | 'all_time';

// Filter options
export const timeFilterOptions: { value: TimeFilterValue; label: string }[] = [
	{ value: 'last_24_hours', label: 'Last 24 Hours' },
	{ value: 'last_week', label: 'Last Week' },
	{ value: 'last_month', label: 'Last Month' },
	{ value: 'all_time', label: 'All Time' }
];

export const limitOptions: { value: string; label: string }[] = [
	{ value: '5', label: '5 Authors' },
	{ value: '10', label: '10 Authors' },
	{ value: '20', label: '20 Authors' },
	{ value: '50', label: '50 Authors' }
];

export const kindOptions: { value: string; label: string }[] = [
	{ value: '', label: 'All Kinds' },
	{ value: '6910', label: 'Kind 6910' },
	{ value: '5910', label: 'Kind 5910' },
	{ value: '7000', label: 'Kind 7000' }
];
