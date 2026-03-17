import { sounds } from './data.js';

class UIManager {
  constructor() {
    this.soundCardsContainer = null;
    this.themeToggleBtn = null;
    this.savePresetBtn = null;
    this.cancelSaveBtn = null;
    this.presetInput = null;
    this.modal = null;
    this.masterPlayBtn = null;
    this.masterVolumeDisplay = null;
    this.masterVolumeSlider = null;
    this.timerDisplay = null;
    this.timerSelect = null;
    this.customPresetsContainer = null;
  }

  init() {
    this.soundCardsContainer = document.querySelector('#sound-cards-cont');
    this.themeToggleBtn = document.querySelector('#theme-toggle');
    this.savePresetBtn = document.querySelector('#save-preset');
    this.cancelSaveBtn = document.querySelector('#cancel-save');
    this.presetInput = document.querySelector('#preset-name');
    this.modal = document.querySelector('#save-preset-modal');
    this.masterPlayBtn = document.querySelector('#master-play');
    this.masterVolumeDisplay = document.querySelector('#master-volume-value');
    this.masterVolumeSlider = document.querySelector('#master-volume');
    this.timerDisplay = document.querySelector('#timer-display');
    this.timerSelect = document.querySelector('#timer-select');
    this.customPresetsContainer = document.querySelector('#custom-presets');

    this.setupEventListeners();
    this.renderSoundCards(sounds);
  }

  setupEventListeners() {
    this.themeToggleBtn.addEventListener('click', this.toggleTheme.bind(this));
    this.savePresetBtn.addEventListener('click', this.showModal.bind(this));
    this.cancelSaveBtn.addEventListener('click', this.closeModal.bind(this));
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }

  //   sound cards DOM elements
  createSoundCardEl(sound) {
    const card = document.createElement('div');
    card.className =
      'sound-card | bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300';
    card.dataset.sound = sound.id;

    card.innerHTML = ` <div class="flex flex-col h-full">
      <!-- Sound Icon and Name -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="sound-icon-wrapper w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center">
            <i class="fas ${sound.icon} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg">${sound.name}</h3>
            <p class="text-xs opacity-70">${sound.description}</p>
          </div>
        </div>
        <button type="button" class="play-btn w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center" data-sound="${sound.id}">
          <i class="fas fa-play text-sm"></i>
        </button>
      </div>

      <!-- Volume Control -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-center space-x-3">
          <i class="fas fa-volume-low opacity-50"></i>
          <input type="range" class="volume-slider flex-1" min="0" max="100" value="0" data-sound="${sound.id}">
          <span class="volume-value text-sm w-8 text-right">0</span>
        </div>
      </div>
    </div>`;

    return card;
  }

  renderSoundCards(sounds) {
    this.soundCardsContainer.innerHTML = '';

    sounds.forEach((sound) => {
      const card = this.createSoundCardEl(sound);
      this.soundCardsContainer.appendChild(card);
    });
  }

  //   toggle individual play pause button icons
  togglePlayPauseIcon(soundId) {
    const card = document.querySelector(`[data-sound="${soundId}"]`);
    const playBtn = card.querySelector('.play-btn');
    const icon = playBtn.querySelector('i');

    if (icon.classList.contains('fa-play')) {
      icon.classList.replace('fa-play', 'fa-pause');
    } else {
      icon.classList.replace('fa-pause', 'fa-play');
    }
  }

  //   toggle master play pause icon visuals
  toggleMasterBtn(toPlay) {
    const span = this.masterPlayBtn.querySelector('span');
    const icon = this.masterPlayBtn.querySelector('i');
    if (toPlay) {
      icon.classList.replace('fa-play', 'fa-pause');
      span.innerText = 'Stop All';
    } else {
      icon.classList.replace('fa-pause', 'fa-play');
      span.innerText = 'Play All';
    }
  }

  setVolumeDisplay(soundId, volume) {
    const card = document.querySelector(`[data-sound="${soundId}"]`);
    const volumeSlider = card.querySelector('.volume-slider');
    const volumeTextEl = card.querySelector('.volume-value');

    volumeSlider.value = volume;
    volumeTextEl.textContent = volume;
  }

  setMasterVolumeDisplay(volume) {
    this.masterVolumeDisplay.innerText = volume;
  }

  //   presets related
  setActivePresetVisual(presetId) {
    document
      .querySelectorAll('.preset-btn')
      .forEach((btn) => btn.classList.remove('preset-active'));
    const actievPresetBtn = document.querySelector(
      `.preset-btn[data-preset="${presetId}"]`,
    );
    actievPresetBtn.classList.add('preset-active');
  }

  addCustomPresetBtn(name) {
    const button = document.createElement('button');
    button.className =
      'preset-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 relative group';
    button.dataset.preset = name;
    button.innerHTML = `  <i class="fas fa-star mr-2 text-yellow-400"></i>
    ${name}
    <button type="button" class="delete-preset absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-preset="${name}">
      <i class="fas fa-times text-xs text-white"></i>
    </button>`;

    this.customPresetsContainer.appendChild(button);
  }

  removeCustomPresetBtn(name) {
    const btn = document.querySelector(`.preset-btn[data-preset="${name}"]`);
    if (btn) {
      // remove method of a DOM element
      btn.remove();
    }
  }

  resetUI() {
    // reset individual sound-related UI
    sounds.forEach((sound) => {
      const card = document.querySelector(`[data-sound="${sound.id}"]`);
      const volumeSlider = card.querySelector('.volume-slider');
      const volumeTextEl = card.querySelector('.volume-value');
      const playBtn = card.querySelector('.play-btn');
      const icon = playBtn.querySelector('i');

      volumeSlider.value = 0;
      volumeTextEl.textContent = '0';

      if (icon.classList.contains('fa-pause')) {
        icon.classList.replace('fa-pause', 'fa-play');
      }
    });

    // reset master button & slider
    const span = this.masterPlayBtn.querySelector('span');
    const icon = this.masterPlayBtn.querySelector('i');
    if (icon.classList.contains('fa-pause')) {
      icon.classList.replace('fa-pause', 'fa-play');
    }
    span.innerText = 'Play All';

    this.masterVolumeSlider.value = 50;
  }

  //   timer display
  updateTimerDisplay(minutes, seconds) {
    this.timerDisplay.classList.remove('hidden');
    this.timerDisplay.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  resetTimerDisplay() {
    this.timerDisplay.classList.add('hidden');
    this.timerDisplay.innerHTML = '';
    this.timerSelect.value = '0';
  }

  //   theme toggle
  toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');

    const icon = this.themeToggleBtn.querySelector('i');
    if (icon.classList.contains('fa-sun')) {
      icon.classList.replace('fa-sun', 'fa-moon');
    } else {
      icon.classList.replace('fa-moon', 'fa-sun');
    }
  }

  //   save preset modal
  showModal() {
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    this.presetInput.focus();
  }

  closeModal() {
    this.modal.classList.remove('flex');
    this.modal.classList.add('hidden');
    this.presetInput.value = '';
  }
}

export default UIManager;
