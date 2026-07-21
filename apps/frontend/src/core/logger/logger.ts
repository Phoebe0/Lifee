import { getEnvConfig } from '../config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function write(level: LogLevel, message: string, extra?: Record<string, unknown>) {
  if (!getEnvConfig().enableLog && level === 'debug') {
    return
  }

  console[level](`[Lifee:${level}] ${message}`, extra ?? {})
}

export const logger = {
  debug(message: string, extra?: Record<string, unknown>) {
    write('debug', message, extra)
  },
  info(message: string, extra?: Record<string, unknown>) {
    write('info', message, extra)
  },
  warn(message: string, extra?: Record<string, unknown>) {
    write('warn', message, extra)
  },
  error(message: string, extra?: Record<string, unknown>) {
    write('error', message, extra)
  }
}
