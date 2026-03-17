import { defaultPresets, sounds } from './data.js';
import UIManager from './uiManager.js';
import SoundManager from './soundManager.js';
import Timer from './timer.js';
import PresetManager from './presetManager.js';

class AmbientMixer {
  constructor() {
    this.uiManager = new UIManager();
    this.soundManager = new SoundManager();
    this.presetManager = new PresetManager();
    this.timer = new Timer(
      () => this.onTimerComplete(),
      (minutes, seconds) => this.uiManager.updateTimerDisplay(minutes, seconds),
    );

    this.masterVolume = 50;
    this.currentSoundState = {};
  }

  init() {
    // UI
    this.uiManager.init();
    this.soundManager.init();
    this.presetManager.init();
    this.loadCustomPresetsUI();

    // initialize default sound state
    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // event delegations for various clicks
    document.addEventListener('click', (e) => {
      // individual audio play buttons
      if (e.target.closest('.play-btn')) {
        const soundId = e.target.closest('.play-btn').dataset.sound;
        this.toggleAudio(soundId);
      }

      //   default preset buttons
      if (e.target.closest('.preset-btn')) {
        const presetId = e.target.closest('.preset-btn').dataset.preset;
        this.playPreset(presetId);
      }

      //   delete preset buttons
      if (e.target.closest('.delete-preset')) {
        e.stopPropagation();
        const name = e.target.closest('.delete-preset').dataset.preset;
        this.deleteCustomPreset(name);
      }
    });

    // event delegations for volume sliders
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('volume-slider')) {
        const soundId = e.target.dataset.sound;
        const volume = parseInt(e.target.value);
        this.setIndividualVolume(soundId, volume);
      }
    });

    // master play button
    this.uiManager.masterPlayBtn.addEventListener('click', () => {
      this.masterPlay();
    });

    // master volumen slider
    const masterVolumeSlider = document.querySelector('#master-volume');
    masterVolumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value);
      this.setMasterVolume(volume);
    });

    // reset all button
    const resetAllBtn = document.querySelector('#reset-all');
    resetAllBtn.addEventListener('click', () => {
      this.reset();
    });

    // timer select
    const timerSelect = document.querySelector('#timer-select');
    timerSelect.addEventListener('change', (e) => {
      this.timer.start(parseInt(e.target.value));
    });

    // save preset btn
    const confirmSaveBtn = document.querySelector('#confirm-save');
    confirmSaveBtn.addEventListener('click', this.saveNewPreset.bind(this));
  }

  async toggleAudio(soundId) {
    let currentVolume = parseInt(
      document
        .querySelector(`[data-sound="${soundId}"]`)
        .querySelector('.volume-slider').value,
    );
    if (currentVolume === 0) {
      this.setIndividualVolume(soundId, 50);
    }
    this.soundManager.toggleAudio(soundId);
    this.uiManager.togglePlayPauseIcon(soundId);
  }

  setIndividualVolume(soundId, volume) {
    this.soundManager.setVolume(soundId, volume, this.masterVolume);
    this.uiManager.setVolumeDisplay(soundId, volume);
    this.currentSoundState[soundId] = volume;
  }

  setMasterVolume(volume) {
    this.masterVolume = volume;

    for (const [soundId, audio] of this.soundManager.audios) {
      if (!audio.paused) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const slider = card?.querySelector('.volume-slider');
        const currentVolume = parseInt(slider.value);

        this.soundManager.setVolume(soundId, currentVolume, this.masterVolume);
      }
    }
    this.uiManager.setMasterVolumeDisplay(volume);
  }

  masterPlay() {
    // check for soundManager boolean indicating if all audios are playing
    // if is all playing, do the pause logic
    if (this.soundManager.isAllPlaying) {
      // toggle the icon only if the individual audio was playing
      sounds.forEach((sound) => {
        const audio = this.soundManager.audios.get(sound.id);
        if (!audio.paused) {
          this.uiManager.togglePlayPauseIcon(sound.id);
        }
      });
      //   pause all after icon toggle
      this.soundManager.pauseAll();
      this.uiManager.toggleMasterBtn(false);
    } else {
      sounds.forEach((sound) => {
        // set individual audio volume
        let currentVolume = parseInt(
          document
            .querySelector(`[data-sound="${sound.id}"]`)
            .querySelector('.volume-slider').value,
        );
        if (currentVolume === 0) {
          this.setIndividualVolume(sound.id, 50);
        }
        const audio = this.soundManager.audios.get(sound.id);
        // toggle the icon only if the individual audio was not playing
        if (audio.paused) {
          this.uiManager.togglePlayPauseIcon(sound.id);
        }
      });
      //   play all after setting volume and icon toggle
      this.soundManager.playAll();
      this.uiManager.toggleMasterBtn(true);
    }
  }

  //   presets related

  loadCustomPresetsUI() {
    const customPresets = this.presetManager.customPresets;

    for (const preset of Object.values(customPresets)) {
      this.uiManager.addCustomPresetBtn(preset.name);
    }
  }

  deleteCustomPreset(name) {
    if (this.presetManager.deletePreset(name)) {
      this.uiManager.removeCustomPresetBtn(name);
      console.log(`Preset ${name} deleted`);
    }
  }

  playPreset(name) {
    // get target preset
    const preset =
      defaultPresets[name] || this.presetManager.customPresets[name];
    // reset all
    this.reset();
    // for each sound in preset, set and play
    for (const [soundId, volume] of Object.entries(preset.sounds)) {
      this.setIndividualVolume(soundId, volume);
      this.soundManager.toggleAudio(soundId);
      this.uiManager.togglePlayPauseIcon(soundId);
    }

    this.uiManager.setActivePresetVisual(name);
  }

  saveNewPreset() {
    const input = document.querySelector('#preset-name').value;

    if (!input.trim()) {
      alert('Please enter a preset name');
      return;
    }

    let presetSounds = {};

    // for each audio that is playing, add to preset sounds
    sounds.forEach((sound) => {
      const audio = this.soundManager.audios.get(sound.id);
      if (!audio.paused) {
        presetSounds[sound.id] = this.currentSoundState[sound.id];
      }
    });

    this.presetManager.saveCustomPreset(input, presetSounds);

    this.uiManager.addCustomPresetBtn(input);
    this.uiManager.closeModal();
  }

  //   timer
  onTimerComplete() {
    this.soundManager.pauseAll();
    this.uiManager.resetTimerDisplay();
    this.uiManager.toggleMasterBtn(false);
    sounds.forEach((sound) => {
      const audio = this.soundManager.audios.get(sound.id);
      if (!audio.paused) {
        this.uiManager.togglePlayPauseIcon(sound.id);
      }
    });
  }

  reset() {
    // reset all audio attributes
    this.soundManager.resetAllAudio();

    // set master volume back to 50;
    this.masterVolume = 50;
    this.uiManager.setMasterVolumeDisplay(this.masterVolume);

    // reset UI
    this.uiManager.resetUI();

    // reset current sound state
    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AmbientMixer();
  app.init();
});
