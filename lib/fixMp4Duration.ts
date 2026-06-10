/**
 * Fix MP4 duration metadata produced by Chrome's MediaRecorder.
 * Chrome often writes incorrect/missing duration in mvhd, tkhd, and mdhd atoms.
 * This patches the binary directly with the correct duration.
 */
export default async function fixMp4Duration(blob: Blob, durationMs: number): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const data = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // Movie-level timescale (from mvhd), used by tkhd
  let movieTimescale = 1000;

  const readStr = (offset: number): string => {
    return String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
  };

  const writeDuration = (offset: number, size: number, duration: number): void => {
    if (size === 4) {
      view.setUint32(offset, duration >>> 0);
    } else {
      // 8-byte duration: write as two 32-bit values
      const high = Math.floor(duration / 0x100000000);
      const low = duration >>> 0;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
  };

  const fixFullBox = (bodyOffset: number, type: string): void => {
    const version = data[bodyOffset];
    // version(1) + flags(3)
    const base = bodyOffset + 4;

    if (type === 'mvhd') {
      // version 0: creation(4) + modification(4) + timescale(4) + duration(4)
      // version 1: creation(8) + modification(8) + timescale(4) + duration(8)
      const tsOff = version === 0 ? base + 8 : base + 16;
      const durOff = tsOff + 4;
      const durSize = version === 0 ? 4 : 8;
      movieTimescale = view.getUint32(tsOff);
      const correctDuration = Math.round((durationMs / 1000) * movieTimescale);
      writeDuration(durOff, durSize, correctDuration);
    } else if (type === 'tkhd') {
      // version 0: creation(4) + modification(4) + trackId(4) + reserved(4) + duration(4)
      // version 1: creation(8) + modification(8) + trackId(4) + reserved(4) + duration(8)
      const durOff = version === 0 ? base + 16 : base + 24;
      const durSize = version === 0 ? 4 : 8;
      // tkhd uses movie timescale
      const correctDuration = Math.round((durationMs / 1000) * movieTimescale);
      writeDuration(durOff, durSize, correctDuration);
    } else if (type === 'mdhd') {
      // version 0: creation(4) + modification(4) + timescale(4) + duration(4)
      // version 1: creation(8) + modification(8) + timescale(4) + duration(8)
      const tsOff = version === 0 ? base + 8 : base + 16;
      const durOff = tsOff + 4;
      const durSize = version === 0 ? 4 : 8;
      const mediaTimescale = view.getUint32(tsOff);
      const correctDuration = Math.round((durationMs / 1000) * mediaTimescale);
      writeDuration(durOff, durSize, correctDuration);
    }
  };

  // Container atom types that we need to recurse into
  const containers = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'udta', 'edts']);
  // Full-box atom types that contain duration to fix
  const durationBoxes = new Set(['mvhd', 'tkhd', 'mdhd']);

  const parseAtoms = (start: number, end: number): void => {
    let offset = start;
    while (offset + 8 <= end) {
      let size = view.getUint32(offset);
      const type = readStr(offset + 4);

      // Handle size == 0 (extends to end of file) and size == 1 (64-bit extended size)
      if (size === 0) {
        size = end - offset;
      } else if (size === 1 && offset + 16 <= end) {
        // 64-bit extended size
        const hi = view.getUint32(offset + 8);
        const lo = view.getUint32(offset + 12);
        size = hi * 0x100000000 + lo;
      }

      if (size < 8 || offset + size > end) break;

      const headerSize = (view.getUint32(offset) === 1) ? 16 : 8;
      const bodyOffset = offset + headerSize;

      if (durationBoxes.has(type)) {
        fixFullBox(bodyOffset, type);
      } else if (containers.has(type)) {
        parseAtoms(bodyOffset, offset + size);
      }

      offset += size;
    }
  };

  parseAtoms(0, data.length);

  return new Blob([data], { type: blob.type });
}
