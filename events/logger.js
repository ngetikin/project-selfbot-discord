module.exports = {
  event: "raw",
  run: (client, packet) => {
    // raw events are many; log a short summary
    try {
      if (packet && packet.t) {
        console.log(`[EVENT] ${packet.t}`);
      }
    } catch (e) {
      // ignore
      console.error(`[ERROR] ${e}`)
    }
  }
};
