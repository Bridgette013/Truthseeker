

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  
  // In a real production app, this would likely be an endpoint for a service like Datadog or Sentry
  private remoteLogEndpoint = '/api/logs'; 

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };
  }

  private persist(entry: LogEntry) {
    // Local console for dev/debugging
    const style = 
      entry.level === LogLevel.ERROR ? 'color: red; font-weight: bold' :
      entry.level === LogLevel.WARN ? 'color: orange; font-weight: bold' :
      'color: #6246EA; font-weight: bold';

    console.log(`%c[${entry.level}] ${entry.context ? `[${entry.context}] ` : ''}${entry.message}`, style, entry.data || '');
    
    // Store in memory
    this.logs.push(entry);

    // TODO: In production, debounce and flush to remote endpoint
    // if (import.meta.env.PROD) { ... }
  }

  public info(message: string, data?: any, context?: string) {
    this.persist(this.createEntry(LogLevel.INFO, message, data, context));
  }

  public warn(message: string, data?: any, context?: string) {
    this.persist(this.createEntry(LogLevel.WARN, message, data, context));
  }

  public error(message: string, error?: any, context?: string) {
    this.persist(this.createEntry(LogLevel.ERROR, message, error, context));
  }

  public debug(message: string, data?: any, context?: string) {
    // Only log debug in dev mode
    if (import.meta.env.DEV) {
      this.persist(this.createEntry(LogLevel.DEBUG, message, data, context));
    }
  }

  public getLogs() {
    return this.logs;
  }
}

export const logger = Logger.getInstance();