// components/SimulationView.js

import ImageView from './ImageView.js';

export class SimulationView {
  /**
   * @param {HTMLElement} containerElement - The DOM element in which the simulation view will be rendered.
   * @param {ReferenceCollection} referenceCollection - The shared ReferenceCollection instance.
   * @param {Object} [options] - Optional initial configuration.
   * @param {number} [options.focal=24] - Initial focal length.
   * @param {string} [options.sensorKey] - Initial sensor key (the pretty name).
   * @param {string} [options.aspect] - Initial aspect ratio (e.g., "3/2").
   * @param {Function} [options.onShutter] - Callback when shutter is pressed.
   */
  constructor(containerElement, referenceCollection, options = {}) {
    if (!containerElement) {
      throw new Error("A container element is required for SimulationView.");
    }
    if (!referenceCollection) {
      throw new Error("A referenceCollection instance is required for SimulationView.");
    }
    this.container = containerElement;
    this.referenceCollection = referenceCollection;
    
    if (!this.referenceCollection.sensorData) {
      console.warn("ReferenceCollection has no sensorData. Ensure it is attached.");
    }
    
    // Initial settings.
    this.sensorKey = options.sensorKey || Object.keys(this.referenceCollection.sensorData)[0];
    this.sensor = this.referenceCollection.sensorData[this.sensorKey];
    this.focal = options.focal || 24;
    this.aspect = options.aspect || this.referenceCollection.aspect;
    this.vertical = false; // false = horizontal (default)
    this.onShutter = options.onShutter || function(params) {
      console.log("Shutter pressed:", params);
    };

    // Create the simulation container (wraps both controls and image view).
    this.simulationContainer = document.createElement('div');
    this.simulationContainer.id = 'simulation';

    this.createControls();
    this.createImageView();
    this.container.appendChild(this.simulationContainer);

    // Initial update to render the preview and update controls.
    this.updateImageView();
    this.updateControls();
  }

  createControls() {
    // Create controls container.
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'simulation-controls';

    /* --- Row 1: Sensor, Aspect, Orientation Toggle --- */
    const row1 = document.createElement('div');
    row1.className = 'control-row row1';

    this.sensorSelectLabel = document.createElement('label');
    this.sensorSelectLabel.textContent = 'Sensor: ';
    this.sensorSelectLabel.className = 'sensor-select-label';
    row1.appendChild(this.sensorSelectLabel);

    this.sensorSelect = document.createElement('select');
    this.sensorSelect.className = 'sensor-select';
    const sensors = this.referenceCollection.sensorData;
    if (sensors) {
      Object.keys(sensors).forEach(key => {
        const sensorOption = sensors[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = sensorOption.name; // pretty name
        if (key === this.sensorKey) {
          option.selected = true;
        }
        this.sensorSelect.appendChild(option);
      });
    }
    row1.appendChild(this.sensorSelect);
    this.sensorSelect.addEventListener('change', () => {
      const selectedKey = this.sensorSelect.value;
      this.sensorKey = selectedKey;
      this.sensor = sensors[selectedKey];
      this.referenceCollection.updateSettings({ sensor: this.sensor });
      this.updateImageView();
      this.updateQuickSelectButtons();
      this.updateControls();
    });

    // Spacer.
    const spacer = document.createElement('div');
    spacer.className = 'spacer';
    row1.appendChild(spacer);

    // Aspect ratio select.
    this.aspectSelectLabel = document.createElement('label');
    this.aspectSelectLabel.textContent = 'Aspect Ratio: ';
    this.aspectSelectLabel.className = 'aspect-select-label';
    row1.appendChild(this.aspectSelectLabel);

    this.aspectSelect = document.createElement('select');
    this.aspectSelect.className = 'aspect-select';
    const availableRatios = this.referenceCollection.aspectRatios || [];
    availableRatios.forEach(ratio => {
      const option = document.createElement('option');
      option.value = ratio.value;
      option.textContent = ratio.label;
      if (ratio.value === this.aspect) {
        option.selected = true;
      }
      this.aspectSelect.appendChild(option);
    });
    row1.appendChild(this.aspectSelect);
    this.aspectSelect.addEventListener('change', () => {
      this.aspect = this.aspectSelect.value;
      this.referenceCollection.updateSettings({ aspect: this.aspect });
      this.updateImageView();
      this.updateControls();
    });

    // Orientation toggle button.
    this.toggleOrientationBtn = document.createElement('button');
    this.toggleOrientationBtn.className = 'toggle-orientation-btn';
    this.updateToggleButtonText();
    row1.appendChild(this.toggleOrientationBtn);
    this.toggleOrientationBtn.addEventListener('click', () => {
      this.vertical = !this.vertical;
      this.updateToggleButtonText();
      const parts = this.aspect.split('/');
      if (parts.length === 2) {
        this.aspect = `${parts[1]}/${parts[0]}`;
      }
      const optionFound = Array.from(this.aspectSelect.options).find(
        option => option.value === this.aspect
      );
      if (optionFound) {
        this.aspectSelect.value = this.aspect;
      }
      this.referenceCollection.updateSettings({ aspect: this.aspect });
      this.updateImageView();
      this.updateControls();
    });

    /* --- Row 2: Focal Length Slider --- */
    const row2 = document.createElement('div');
    row2.className = 'control-row row2';

    this.focalLabel = document.createElement('label');
    this.focalLabel.textContent = 'Focal Length (mm): ';
    this.focalLabel.className = 'focal-label';
    row2.appendChild(this.focalLabel);

    this.focalSlider = document.createElement('input');
    this.focalSlider.type = 'range';
    this.focalSlider.min = 12;
    this.focalSlider.max = 400;
    this.focalSlider.value = this.focal;
    this.focalSlider.className = 'focal-slider';
    row2.appendChild(this.focalSlider);

    this.focalValueDisplay = document.createElement('span');
    this.focalValueDisplay.textContent = this.focal + 'mm';
    this.focalValueDisplay.className = 'focal-value';
    row2.appendChild(this.focalValueDisplay);

    this.focalSlider.addEventListener('input', () => {
      this.focal = parseFloat(this.focalSlider.value);
      this.focalValueDisplay.textContent = this.focal + 'mm';
      this.updateImageView();
      this.updateQuickSelectButtons();
      this.updateControls();
    });

    /* --- Row 3: Quick-Select Focal Buttons --- */
    const row3 = document.createElement('div');
    row3.className = 'control-row row3';
    this.quickSelectContainer = document.createElement('div');
    this.quickSelectContainer.className = 'quick-select';
    row3.appendChild(this.quickSelectContainer);
    this.updateQuickSelectButtons();

    // Assemble left column (vertical layout).
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-controls';
    leftColumn.appendChild(row1);
    leftColumn.appendChild(row2);
    leftColumn.appendChild(row3);

    /* --- Right Column: Shutter Button --- */
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-controls';
    this.shutterBtn = document.createElement('button');
    this.shutterBtn.className = 'shutter-btn';
    this.shutterBtn.textContent = 'Shutter';
    this.shutterBtn.addEventListener('click', () => {
      const params = {
        sensor: this.sensor,
        focal: this.focal,
        aspect: this.aspect
      };
      if (typeof this.onShutter === 'function') {
        this.onShutter(params);
      }
    });
    rightColumn.appendChild(this.shutterBtn);

    // Main row container for controls (horizontal).
    const mainRow = document.createElement('div');
    mainRow.className = 'control-row main-row';
    mainRow.appendChild(leftColumn);
    mainRow.appendChild(rightColumn);

    this.controlsContainer.appendChild(mainRow);
    this.simulationContainer.appendChild(this.controlsContainer);
  }

  updateToggleButtonText() {
    this.toggleOrientationBtn.textContent = this.vertical ? 'Vertical' : 'Horizontal';
  }

  updateQuickSelectButtons() {
    this.quickSelectContainer.innerHTML = "";
    const sensors = this.referenceCollection.sensorData;
    let commonFocals = [];
    if (sensors) {
      const sensorOption = sensors[this.sensorKey];
      if (sensorOption) {
        commonFocals = sensorOption.commonFocals || [];
      }
    }
    commonFocals.forEach(focalValue => {
      const btn = document.createElement('button');
      btn.textContent = `${focalValue}mm`;
      btn.className = 'quick-select-btn';
      if (parseFloat(this.focal) === focalValue) {
        btn.classList.add('active');
      }
      btn.addEventListener('click', () => {
        this.focal = focalValue;
        this.focalSlider.value = focalValue;
        this.focalValueDisplay.textContent = `${focalValue}mm`;
        this.updateImageView();
        this.updateQuickSelectButtons();
        this.updateControls();
      });
      this.quickSelectContainer.appendChild(btn);
    });
  }

  updateControls() {
    // Update sensor select.
    const sensors = this.referenceCollection.sensorData;
    if (sensors) {
      Array.from(this.sensorSelect.options).forEach(option => {
        option.selected = option.value === this.sensorKey;
      });
    }
    // Update aspect select.
    Array.from(this.aspectSelect.options).forEach(option => {
      option.selected = option.value === this.aspect;
    });
    // Update focal slider and display.
    this.focalSlider.value = this.focal;
    this.focalValueDisplay.textContent = `${this.focal}mm`;
    // Update quick-select buttons.
    this.updateQuickSelectButtons();
  }

  createImageView() {
    this.imageView = new ImageView({
      referenceCollection: this.referenceCollection,
      sensor: this.sensor,
      aspect: this.aspect,
      focal: this.focal
    });
    this.simulationContainer.appendChild(this.imageView.getElement());
  }

  updateImageView() {
    this.imageView.setSensor(this.sensor);
    this.imageView.setAspect(this.aspect);
    this.imageView.setFocal(this.focal);
    this.imageView.update();
  }
}

export default SimulationView;