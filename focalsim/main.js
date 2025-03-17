// main.js

import SimulationView from './components/SimulationView.js';
import GalleryView from './components/GalleryView.js';
import ReferenceCollection from './data/ReferenceCollection.js';

// Wait until the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  // Get the main container element (the only element required by the app).
  const appContainer = document.getElementById('app');

  // Instantiate a shared ReferenceCollection with default values.
  const referenceCollection = new ReferenceCollection();

  // Declare galleryView so it can be referenced in the onShutter callback.
  let galleryView;

  // Create the SimulationView first. It will create its own "#simulation" div.
  let simulationView = new SimulationView(appContainer, referenceCollection, {
    focal: 24,
    // When the shutter is pressed, add a new image to the gallery.
    onShutter: (params) => {
      galleryView.addImage(params);
    }
  });

  // Now create the GalleryView. It will automatically create its own "#gallery" div.
  galleryView = new GalleryView(appContainer, referenceCollection);

  galleryView.setSelectHandler((params) => {
    // Find the sensor key that matches the selected sensor.
    const sensors = referenceCollection.sensorData;
    let foundKey = simulationView.sensorKey; // default to current key
    for (const key in sensors) {
      if (sensors[key].width === params.sensor.width && sensors[key].height === params.sensor.height) {
        foundKey = key;
        break;
      }
    }
    simulationView.sensorKey = foundKey;
    simulationView.sensor = sensors[foundKey];
    simulationView.focal = params.focal;
    simulationView.aspect = params.aspect;
    simulationView.updateControls();
    simulationView.updateImageView();
  });
});
