import { getLogger } from '../utils/logger';
import { EventModule } from '../types/modules';

const log = getLogger('events:raw');

const loggerEvent: EventModule = {
  event: 'raw',
  run: (client, packet) => {
    // raw events are many; log a short summary
    try {
      if (packet && packet.t) {
        log.debug({ event: packet.t }, 'raw event received');
      }
    } catch (e) {
      log.error({ err: e }, 'Failed to log raw event');
    }
  },
};

export default loggerEvent;
