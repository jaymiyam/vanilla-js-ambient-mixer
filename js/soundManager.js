import { sounds } from './data.js';
class SoundManager {
  constructor() {
    this.audios = new Map();
    this.isAllPlaying = false;
  }

  init() {
    this.createAudios();
  }

  createAudios() {
    sounds.forEach((sound) => {
      try {
        const audio = new Audio();
        audio.src = `../audio/${sound.file}`;
        audio.loop = true;
        audio.preload = 'metadata';

        this.audios.set(sound.id, audio);
      } catch (error) {
        console.log(error);
      }
    });
  }

  toggleAudio(soundId) {
    const audio = this.audios.get(soundId);

    if (audio.paused) {
      this.playAudio(audio);
    } else {
      this.pauseAudio(audio);
    }
  }

  async playAudio(audio) {
    try {
      await audio.play();
    } catch (error) {
      console.log(`Failed to play sound ${soundId}: ${error}`);
    }
  }

  pauseAudio(audio) {
    audio.pause();
  }

  playAll() {
    for (const [soundId, audio] of this.audios) {
      if (audio.paused) {
        audio.play();
      }
    }
    this.isAllPlaying = true;
  }

  pauseAll() {
    for (const [soundId, audio] of this.audios) {
      if (!audio.paused) {
        audio.pause();
      }
    }
    this.isAllPlaying = false;
  }

  setVolume(soundId, volume, masterVolume) {
    const audio = this.audios.get(soundId);
    const effectiveVolume = (volume * masterVolume) / 100;
    audio.volume = effectiveVolume / 100;
  }

  resetAllAudio() {
    for (const [soundId, audio] of this.audios) {
      if (!audio.paused) {
        audio.pause();
        audio.volume = 0;
        audio.currentTime = 0;
      }
    }
    this.isAllPlaying = false;
  }
}

export default SoundManager;
