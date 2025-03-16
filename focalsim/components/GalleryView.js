// components/GalleryView.js

import GalleryImage from './GalleryImage.js';

export class GalleryView {
  /**
   * @param {HTMLElement} containerElement - The DOM element where the gallery will be rendered.
   * @param {ReferenceCollection} referenceCollection - The shared ReferenceCollection instance.
   */
  constructor(containerElement, referenceCollection) {
    if (!containerElement) {
      throw new Error("A container element is required for GalleryView.");
    }
    if (!referenceCollection) {
      throw new Error("A referenceCollection instance is required for GalleryView.");
    }
    this.container = containerElement;
    this.referenceCollection = referenceCollection;
    this.images = []; // stores GalleryImage instances

    // Create a gallery container div and append it.
    this.galleryContainer = document.createElement('div');
    this.galleryContainer.id = 'gallery';
    this.galleryContainer.className = 'gallery';
    this.container.appendChild(this.galleryContainer);
  }
  
  /**
   * Adds a new GalleryImage to the gallery.
   * @param {Object} params - The simulation parameters: sensor, focal, and aspect.
   */
  addImage(params) {
    const galleryImage = new GalleryImage({
      sensor: params.sensor,
      focal: params.focal,
      aspect: params.aspect,
      referenceCollection: this.referenceCollection
    });
    // Set the delete handler.
    galleryImage.setDeleteHandler(() => {
      this.removeImage(galleryImage);
    });
    // Set the select handler so that when this image is clicked,
    // the simulation parameters update accordingly.
    if (this.selectHandler) {
      galleryImage.setSelectHandler(() => {
        this.selectHandler({
          sensor: params.sensor,
          focal: params.focal,
          aspect: params.aspect
        });
      });
    }
    this.images.push(galleryImage);
    this.galleryContainer.appendChild(galleryImage.getElement());
  }
  
  /**
   * Sets a callback function that is invoked when any gallery image is selected.
   * The callback receives an object with sensor, focal, and aspect.
   * @param {Function} handler - The select handler.
   */
  setSelectHandler(handler) {
    this.selectHandler = handler;
    // Also update existing images.
    this.images.forEach(image => {
      image.setSelectHandler(() => {
        handler({
          sensor: image.sensor,
          focal: image.focal,
          aspect: image.aspect
        });
      });
    });
  }
  
  /**
   * Removes a GalleryImage from the gallery.
   * @param {GalleryImage} galleryImage - The GalleryImage instance to remove.
   */
  removeImage(galleryImage) {
    const element = galleryImage.getElement();
    if (this.galleryContainer.contains(element)) {
      this.galleryContainer.removeChild(element);
    }
    this.images = this.images.filter(img => img !== galleryImage);
  }
  
  /**
   * Clears all GalleryImages from the gallery.
   */
  clear() {
    this.images.forEach(img => {
      const element = img.getElement();
      if (this.galleryContainer.contains(element)) {
        this.galleryContainer.removeChild(element);
      }
    });
    this.images = [];
  }
}

export default GalleryView;