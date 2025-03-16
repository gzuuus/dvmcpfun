export interface Tool {
	name: string;
	inputSchema: {
		properties?: Record<string, any>;
		[key: string]: any;
	};
	[key: string]: any;
}
