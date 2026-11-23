// Write stored ZIP32 entries with fixed metadata for reproducible archives.
// The catalog deals in small packages with ASCII file paths and fixed entry order.
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  }
  return value;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

export function zipFiles(files) {
  const data = [];
  const directory = [];
  let dataSize = 0;
  let directorySize = 0;
  for (const [path, bytes] of files) {
    const name = Buffer.from(path, 'ascii');
    const entry = Buffer.alloc(30);
    entry.writeUInt32LE(0x04034b50, 0); // Local file signature
    entry.writeUInt16LE(20, 4); // ZIP 2.0
    entry.writeUInt16LE(0x21, 12); // 1980-01-01 in DOS date format
    entry.writeUInt32LE(crc32(bytes), 14);
    entry.writeUInt32LE(bytes.length, 18);
    entry.writeUInt32LE(bytes.length, 22);
    entry.writeUInt16LE(name.length, 26);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // Central directory signature
    central.writeUInt16LE(20, 4);
    entry.copy(central, 6, 4);
    central.writeUInt32LE(dataSize, 42);
    data.push(entry, name, bytes);
    directory.push(central, name);
    dataSize += entry.length + name.length + bytes.length;
    directorySize += central.length + name.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // End of central directory signature
  end.writeUInt16LE(files.size, 8);
  end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directorySize, 12);
  end.writeUInt32LE(dataSize, 16);
  return Buffer.concat([...data, ...directory, end]);
}
