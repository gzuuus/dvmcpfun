// src/lib/utils/logger.ts

/**
 * A simple logging utility for consistent error reporting.
 */
class Logger {
	/**
	 * Logs an error message with a consistent format.
	 * @param message A descriptive message for the error.
	 * @param error The actual error object or string.
	 * @param context Optional additional context for the error (e.g., component name, function name).
	 */
	public error(message: string, error: unknown, context?: string): void {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const logContext = context ? `[${context}] ` : '';
		console.error(`${logContext}ERROR: ${message} - ${errorMessage}`, error);
	}

	/**
	 * Logs a warning message.
	 * @param message The warning message.
	 * @param context Optional additional context.
	 */
	public warn(message: string, context?: string): void {
		const logContext = context ? `[${context}] ` : '';
		console.warn(`${logContext}WARNING: ${message}`);
	}

	/**
	 * Logs an informational message.
	 * @param message The informational message.
	 * @param context Optional additional context.
	 */
	public info(message: string, context?: string): void {
		const logContext = context ? `[${context}] ` : '';
		console.log(`${logContext}INFO: ${message}`);
	}

	/**
	 * Logs a debug message.
	 * @param message The debug message.
	 * @param data Optional data to log.
	 * @param context Optional additional context.
	 */
	public debug(message: string, data?: unknown, context?: string): void {
		if (import.meta.env.DEV) {
			// Only log debug messages in development
			const logContext = context ? `[${context}] ` : '';
			console.debug(`${logContext}DEBUG: ${message}`, data);
		}
	}
}

export const logger = new Logger();
