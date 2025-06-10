import { NOTIFICATION_KIND, REQUEST_KIND, RESPONSE_KIND } from '@dvmcp/commons/core';

export const statsDvmcpPubkey = '6b3780ef2972e73d370b84a3e51e7aa9ae34bf412938dcfbd9c5f63b221416c8';
export const statsServerId = 'dvmcp-analay';
export type TimeFilterValue = 'last_24_hours' | 'last_week' | 'last_month' | 'all_time';

// Filter options
export const timeFilterOptions: { value: TimeFilterValue; label: string }[] = [
	{ value: 'last_24_hours', label: 'Last 24 Hours' },
	{ value: 'last_week', label: 'Last Week' },
	{ value: 'last_month', label: 'Last Month' },
	{ value: 'all_time', label: 'All Time' }
] as const;

export const intervalOptions = [
	{ value: 'hour', label: 'Hourly' },
	{ value: 'day', label: 'Daily' },
	{ value: 'week', label: 'Weekly' },
	{ value: 'month', label: 'Monthly' }
] as const;

export const limitOptions: { value: number; label: string }[] = [
	{ value: 5, label: '5' },
	{ value: 10, label: '10' },
	{ value: 20, label: '20' },
	{ value: 50, label: '50' }
] as const;

export const kindOptions: { value: number | string; label: string }[] = [
	// value can be number or string ('')
	{ value: '', label: 'All Kinds' },
	{ value: RESPONSE_KIND, label: `Responses (${RESPONSE_KIND})` },
	{ value: REQUEST_KIND, label: `Requests (${REQUEST_KIND})` },
	{ value: NOTIFICATION_KIND, label: `Notifications (${NOTIFICATION_KIND})` }
] as const;
