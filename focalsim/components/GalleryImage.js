// components/GalleryImage.js

import ImageView from './ImageView.js';

export class GalleryImage {
  /**
   * @param {Object} params - The parameters for the gallery image.
   * @param {Object} params.sensor - The sensor used in the simulation.
   * @param {number} params.focal - The focal length used in the simulation.
   * @param {string} params.aspect - The aspect ratio.
   * @param {ReferenceCollection} params.referenceCollection - Shared reference collection.
   */
  constructor(params) {
    this.sensor = params.sensor;
    this.focal = params.focal;
    this.aspect = params.aspect;
    this.referenceCollection = params.referenceCollection;
    
    // Create container for the gallery image.
    this.container = document.createElement('div');
    this.container.className = 'gallery-image';
    
    // Create an ImageView instance for the thumbnail.
    this.imageView = new ImageView({
      referenceCollection: this.referenceCollection,
      sensor: this.sensor,
      aspect: this.aspect,
      focal: this.focal
    });
    this.container.appendChild(this.imageView.getElement());
    
    // Create a caption container that includes the caption text and delete button.
    this.captionContainer = document.createElement('div');
    this.captionContainer.className = 'gallery-caption-container';
    
    // Caption text.
    this.captionText = document.createElement('span');
    this.captionText.className = 'gallery-caption-text';
    this.captionText.textContent = `${this.focal}mm, ${this.sensor.name}`;
    this.captionContainer.appendChild(this.captionText);
    
    // Delete button styled as an "X".
    this.deleteBtn = document.createElement('button');
    this.deleteBtn.className = 'gallery-delete-btn';
    this.deleteBtn.textContent = 'X';
    this.captionContainer.appendChild(this.deleteBtn);
    
    this.container.appendChild(this.captionContainer);

    // For select handling: clicking on the container (but not the delete button)
    // should trigger the select callback.
    this.container.addEventListener('click', (event) => {
      // Prevent click events on the delete button from triggering select.
      if (event.target === this.deleteBtn) return;
      if (this.selectHandler) {
        this.selectHandler();
      }
    });
  }
  
  /**
   * Returns the container element for this gallery image.
   */
  getElement() {
    return this.container;
  }
  
  /**
   * Sets a callback function to be called when the delete button is pressed.
   * @param {Function} handler - The delete handler.
   */
  setDeleteHandler(handler) {
    this.deleteBtn.addEventListener('click', (event) => {
      // Stop propagation so the container click (select) isn't triggered.
      event.stopPropagation();
      handler();
    });
  }
  
  /**
   * Sets a callback function to be called when the gallery image is selected (clicked).
   * @param {Function} handler - The select handler.
   */
  setSelectHandler(handler) {
    this.selectHandler = handler;
  }
}

export default GalleryImage;