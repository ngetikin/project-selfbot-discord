export interface CommandModule {
  name: string;
  description?: string;
  run: (client: any, message: any, args: string[]) => Promise<void> | void;
}

export interface EventModule {
  event: string;
  run: (client: any, ...args: any[]) => Promise<void> | void;
}
