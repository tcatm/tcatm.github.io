// components/ImageView.js

export class ImageView {
  /**
   * @param {Object} options - Initialization options.
   * @param {ReferenceCollection} options.referenceCollection - The reference collection instance,
   *        which holds reference images and the reference sensor (with its aspect ratio).
   * @param {Object} [options.sensor] - The desired sensor to simulate.
   * @param {string} [options.aspect] - The aspect ratio for the simulation (can be different from the reference's).
   * @param {number} [options.focal] - The focal length.
   */
  constructor({ referenceCollection, sensor, aspect, focal } = {}) {
    if (!referenceCollection) {
      throw new Error("A referenceCollection is required");
    }
    this.refCollection = referenceCollection;
    // The desired sensor to simulate.
    this.sensor = sensor || this.refCollection.sensor;
    // Use the passed aspect or default to the reference's aspect.
    this.aspect = aspect || this.refCollection.aspect;
    this.focal = focal || 24; // default focal length if not provided

    // Create the wrapper element.
    this.wrapper = document.createElement("div");
    this.wrapper.className = "canvas-wrapper";
    this.wrapper.style.position = "relative";
    this.wrapper.style.width = "100%";
    this.wrapper.style.aspectRatio = this.aspect.replace("/", " / ");
    this.wrapper.style.overflow = "hidden";

    // Create the canvas element.
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.canvas.style.width = "100%";
    this.wrapper.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Checkerboard pattern (lazy creation).
    this.checkerPattern = null;

    // Use ResizeObserver on the wrapper.
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.update());
      this.resizeObserver.observe(this.wrapper);
    } else {
      window.addEventListener("resize", () => this.update());
    }
  }

  /**
   * Returns the wrapper element for insertion into the DOM.
   */
  getElement() {
    return this.wrapper;
  }

  /**
   * Creates and returns a checkerboard pattern.
   */
  getCheckerPattern() {
    if (this.checkerPattern) return this.checkerPattern;
    
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = patternCanvas.height = 20;
    const pctx = patternCanvas.getContext("2d");

    pctx.fillStyle = "#ccc";
    pctx.fillRect(0, 0, 20, 20);
    pctx.fillStyle = "#fff";
    pctx.fillRect(0, 0, 10, 10);
    pctx.fillRect(10, 10, 10, 10);

    this.checkerPattern = this.ctx.createPattern(patternCanvas, "repeat");
    return this.checkerPattern;
  }

  /**
   * Updates the canvas size based on the wrapper’s available space and the desired aspect ratio.
   * Uses the device pixel ratio for crisp rendering.
   */
  update() {
    const rect = this.wrapper.getBoundingClientRect();
    let availableWidth = rect.width;
    let availableHeight = rect.height;

    if (!availableHeight || availableHeight === 0) {
      const computed = window.getComputedStyle(this.wrapper);
      availableHeight = parseFloat(computed.height) || rect.height;
    }

    const [num, den] = this.aspect.split("/").map(Number);
    const desiredRatio = num / den;
    
    let layoutWidth = availableWidth;
    let layoutHeight = availableWidth / desiredRatio;

    if (layoutHeight > availableHeight) {
      layoutHeight = availableHeight;
      layoutWidth = availableHeight * desiredRatio;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = layoutWidth * pixelRatio;
    this.canvas.height = layoutHeight * pixelRatio;
    this.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    this.canvas.style.width = layoutWidth + "px";
    this.canvas.style.height = layoutHeight + "px";

    this.refCollection.preloadPromise
      .then(() => {
        this.drawImage();
      })
      .catch(err => {
        console.error("Error preloading images:", err);
      });
  }

  /**
   * Draws a background checkerboard and then the preloaded image.
   */
  drawImage() {
    const ctx = this.ctx;
    const pixelRatio = window.devicePixelRatio || 1;
    const cssWidth = this.canvas.width / pixelRatio;
    const cssHeight = this.canvas.height / pixelRatio;
    
    ctx.fillStyle = this.getCheckerPattern();
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const sensorFactor = this.getSensorFactor();
    const effectiveFocal = this.focal * sensorFactor;
    const refImage = this.refCollection.getReferenceForFocal(this.focal, this.sensor);
    const img = this.refCollection.getPreloadedImage(refImage.src);

    if (img && img.complete) {
      this.renderImage(img, refImage, cssWidth, cssHeight);
    } else {
      console.warn("Image still not loaded:", refImage.src);
    }
  }

  /**
   * Renders the image with scaling based on the effective focal length.
   */
  renderImage(img, refImage, layoutWidth, layoutHeight) {
    const ctx = this.ctx;
    // The scale factor is computed based on the effective focal length
    // relative to the reference image's focal length.
    const effectiveFocal = this.focal * this.getSensorFactor();
    const scaleFactor = effectiveFocal / refImage.focal;
    
    const coverScale = Math.max(
      layoutWidth / img.naturalWidth,
      layoutHeight / img.naturalHeight
    );
    const finalScale = coverScale * scaleFactor;
    
    const drawWidth = img.naturalWidth * finalScale;
    const drawHeight = img.naturalHeight * finalScale;
    const dx = (layoutWidth - drawWidth) / 2;
    const dy = (layoutHeight - drawHeight) / 2;
    
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  }

  /**
   * Computes the sensor factor using both the reference sensor and the simulated sensor.
   * This factor is defined as: (reference sensor width) / (desired sensor width).
   */
  getSensorFactor() {
    // Use the reference sensor stored in the ReferenceCollection as the baseline.
    const refWidth = this.refCollection.defaultSensor?.width;
    // Use the desired sensor's width.
    const desiredWidth = this.sensor?.width || refWidth;
    if (!refWidth || !desiredWidth) return 1;
    return refWidth / desiredWidth;
  }

  // Setter methods.

  setSensor(sensor) {
    if (!sensor) {
      console.error("setSensor: sensor is undefined");
      return;
    }
    this.sensor = sensor;
    this.refCollection.updateSettings({ sensor });
    this.update();
  }

  setAspect(aspect) {
    this.aspect = aspect;
    this.refCollection.updateSettings({ aspect });
    this.wrapper.style.aspectRatio = aspect.replace("/", " / ");
    this.update();
  }

  setFocal(focal) {
    this.focal = focal;
    this.update();
  }
}

export default ImageView;
