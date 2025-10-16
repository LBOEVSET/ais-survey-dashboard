export const LoggerAction = {
  EXCEPTION: (msg: string) => `[EXCEPTION] ${msg}`,
  STARTUP:  (msg: string) => `[STARTUP] ${msg}`,
} as const;

export type LoggerActionType = typeof LoggerAction;
export const LOGGER_ACTION = Symbol('LOGGER_ACTION');
