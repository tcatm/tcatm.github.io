export const sensorData = [
  {
    name: "Full Frame (35mm)",
    width: 36,
    height: 24,
    commonFocals: [16, 24, 28, 35, 50, 85, 135, 200]
  },
  {
    name: "Canon APS-C",
    width: 22.2,
    height: 14.8,
    commonFocals: [16, 24, 35, 50, 85]
  },
  {
    name: "Fuji X (APS-C)",
    width: 23.6,
    height: 15.6,
    commonFocals: [14, 16, 18, 23, 27, 33, 50, 56, 80, 90, 200]
  },
  {
    name: "Fuji GFX (Medium Format)",
    width: 43.8,
    height: 32.9,
    commonFocals: [23, 35, 45, 55, 63, 80, 110, 250, 500]
  },
  {
    name: "Micro Four Thirds",
    width: 17.3,
    height: 13,
    commonFocals: [8, 12, 17, 25, 40, 75]
  },
  {
    name: "Phase One",
    width: 53.7,
    height: 40.4,
    commonFocals: [40, 60, 90, 120, 180, 250]
  }
];

export const aspectRatios = [
  { label: '3:2 (Standard)', value: '3/2' },
  { label: '1:1 (Square)', value: '1/1' },
  { label: '16:9 (Widescreen)', value: '16/9' },
  { label: 'XPan', value: '65/24' },
  { label: '5:4', value: '5/4' },
  { label: '4:3', value: '4/3' }
];

export const defaultSensor = sensorData[0];
export const defaultAspect = "3/2";
export const defaultReferences = [
  { focal: 14, src: 'photos/14mm.jpg' },
  { focal: 28, src: 'photos/28mm.jpg' },
  { focal: 56, src: 'photos/56mm.jpg' },
  { focal: 112, src: 'photos/112mm.jpg' }
];
// Fallback common focal lengths (if needed) – using Full Frame values.
export const commonFocals = [16, 24, 35, 50, 85, 200];
