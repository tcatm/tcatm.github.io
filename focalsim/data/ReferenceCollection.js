// data/ReferenceCollection.js

import {
  sensorData,
  aspectRatios,
  defaultSensor,
  defaultAspect,
  defaultReferences,
  commonFocals
} from '../data/references.js';

export class ReferenceCollection {
  constructor(options = {}) {
    this.sensor = options.sensor || defaultSensor;
    this.aspect = options.aspect || defaultAspect;
    this.references = options.references || defaultReferences;
    this.commonFocals = options.commonFocals || commonFocals;
    this.aspectRatios = options.aspectRatios || aspectRatios;
    // Attach sensorData and defaultSensor to the instance
    this.sensorData = sensorData;
    this.defaultSensor = defaultSensor;
    // Image caching and preloading.
    this.imageCache = {};
    this.preloadPromise = this.preloadImages();
  }

  /**
   * Preloads each reference image and stores it in the imageCache.
   * Returns a promise that resolves when all images are loaded.
   */
  preloadImages() {
    const promises = this.references.map(ref => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.imageCache[ref.src] = img;
          console.log(`Image preloaded: ${ref.src}`);
          resolve(img);
        };
        img.onerror = (err) => {
          console.error(`Error preloading image: ${ref.src}`, err);
          reject(err);
        };
        img.src = ref.src;
      });
    });
    return Promise.all(promises);
  }

  /**
   * Returns the preloaded image for a given src.
   * @param {string} src - The source of the image.
   * @returns {HTMLImageElement} The preloaded image.
   */
  getPreloadedImage(src) {
    return this.imageCache[src];
  }

  /**
   * Returns the best matching reference image for a given simulation focal length and simulated sensor.
   * The effective focal length is computed as:
   *    effectiveFocal = simulationFocal * (defaultSensor.width / simulatedSensor.width)
   * This allows the simulation to choose the reference image that best matches the zoom level.
   * @param {number} simulationFocal - The focal length from the simulation.
   * @param {Object} simulatedSensor - The desired sensor (to simulate).
   * @returns {Object} The reference image object.
   */
  getReferenceForFocal(simulationFocal, simulatedSensor) {
    // Use the default sensor from which the reference images were derived.
    const refWidth = this.defaultSensor?.width;
    // Use the desired sensor's width (falling back to the reference if needed).
    const simWidth = simulatedSensor?.width || refWidth;
    // Compute effective focal length.
    const effectiveFocal = simulationFocal * (refWidth / simWidth);
    console.log("Computed effective focal:", effectiveFocal, "for simulation focal:", simulationFocal, "and simulated sensor width:", simWidth);
    let selected = this.references[0];
    for (const ref of this.references) {
      if (ref.focal <= effectiveFocal) {
        selected = ref;
      } else {
        break;
      }
    }
    return selected;
  }

  /**
   * Computes the Field-of-View (FOV) in degrees for a given focal length.
   * Note: If you want this method to be sensor-aware too, you could compute the effective focal length first.
   * For now, it uses the current sensor's width.
   */
  computeFOV(focalLength) {
    const sensorWidth = this.sensor.width;
    return Math.round(2 * Math.atan(sensorWidth / (2 * focalLength)) * (180 / Math.PI));
  }

  /**
   * Updates the global sensor and/or aspect ratio settings.
   */
  updateSettings({ sensor, aspect } = {}) {
    if (sensor) this.sensor = sensor;
    if (aspect) this.aspect = aspect;
  }
}

export default ReferenceCollection;
