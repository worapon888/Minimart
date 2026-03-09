export const dashKey = {
  dailyRange: (fromISO: string, toISO: string) =>
    `dash:daily:${fromISO}:${toISO}`,
  top: (window: string, asOfISO: string, limit: number) =>
    `dash:top:${window}:${asOfISO}:${limit}`,
};
