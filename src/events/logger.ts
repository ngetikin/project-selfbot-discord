import { getLogger } from '../utils/logger';
import { EventModule } from '../types/modules';

const log = getLogger('events:raw');

const loggerEvent: EventModule<'raw'> = {
  event: 'raw',
  run: (_client, packet: unknown, shardId: number) => {
    // raw events are many; log a short summary
    try {
      if (packet && typeof packet === 'object' && 't' in packet) {
        const typedPacket = packet as { t?: unknown };
        log.debug({ event: typedPacket.t, shardId }, 'raw event received');
      }
    } catch (e) {
      log.error({ err: e }, 'Failed to log raw event');
    }
  },
};

export default loggerEvent;
