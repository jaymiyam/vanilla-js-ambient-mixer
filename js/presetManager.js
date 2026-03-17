import { defaultPresets } from './data.js';

export default class PresetManager {
  constructor() {
    this.customPresets = null;
  }

  init() {
    this.customPresets = this.loadCustomPresets();
  }

  loadCustomPresets() {
    const storedPresets = localStorage.getItem('ambientMixerPresets');
    return storedPresets ? JSON.parse(storedPresets) : {};
  }

  saveCustomPreset(name, sounds) {
    if (this.customPresets[name] || defaultPresets[name]) {
      alert('A preset with the same name already exists');
      return;
    }

    const newPreset = {
      name: name,
      icon: 'fa-star',
      sounds: sounds,
    };

    this.customPresets[name] = newPreset;
    localStorage.setItem(
      'ambientMixerPresets',
      JSON.stringify(this.customPresets),
    );

    console.log(this.loadCustomPresets());
  }

  deletePreset(name) {
    if (this.customPresets[name]) {
      // delete method of a javasript object
      delete this.customPresets[name];
      localStorage.setItem(
        'ambientMixerPresets',
        JSON.stringify(this.customPresets),
      );
      //   return true if the target preset exists and was deleted
      return true;
    }
    // otherwise return false
    return false;
  }
}
