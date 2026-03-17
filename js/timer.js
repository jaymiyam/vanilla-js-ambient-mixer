export default class Timer {
  constructor(onComplete, onTick) {
    this.duration = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.onComplete = onComplete;
    this.onTick = onTick;
    this.intervalId = null;
  }

  start(minutes) {
    if (minutes <= 0) {
      this.stop();
      return;
    }

    this.duration = minutes * 60; // convert to seconds
    this.remaining = this.duration;
    this.isRunning = true;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.updateDisplay();

    this.intervalId = setInterval(() => {
      this.remaining--;
      this.updateDisplay();

      if (this.remaining <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.duration = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.updateDisplay();
  }

  updateDisplay() {
    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    this.onTick(minutes, seconds);
  }
}
