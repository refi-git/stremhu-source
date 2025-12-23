export function parseHdrTypes(torrentName: string) {
  const hdrTypes: string[] = [];

  // Dolby Vision
  const isDolbyVision = [
    '.Dolby.Vision.',
    '.DoVi.',
    '.DoVi-',
    '-DoVi.',
    '.DV.',
  ].some((dolbyVision) => torrentName.includes(dolbyVision));

  if (isDolbyVision) hdrTypes.push('Dolby Vision');

  // HDR
  const isHDR = ['.HDR.', '-HDR.', '.HDR-'].some((hdr) =>
    torrentName.includes(hdr),
  );

  if (isHDR) hdrTypes.push('HDR');

  // HDR10
  const isHDR10 = ['.HDR10.', '-HDR10.', '.HDR10-'].some((hdr) =>
    torrentName.includes(hdr),
  );

  if (isHDR10) hdrTypes.push('HDR10');

  // HDR10+
  const isHDRPlus = [
    '.HDR10Plus.',
    '-HDR10Plus.',
    '.HDR10Plus-',
    '.HDR10+.',
    '-HDR10+.',
    '.HDR10+-',
    '.HDR10P.',
    '-HDR10P.',
    '.HDR10P-',
  ].some((hdr) => torrentName.includes(hdr));

  if (isHDRPlus) hdrTypes.push('HDR10+');

  // HLG
  const isHLG = torrentName.includes('.HLG.');

  if (isHLG) hdrTypes.push('HLG');

  return hdrTypes;
}
