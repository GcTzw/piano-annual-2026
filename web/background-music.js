{
  const controls = document.querySelector('.background-music');
  const music = controls.querySelector('audio');
  const toggle = controls.querySelector('.music-toggle');
  const volume = controls.querySelector('input');
  const percentage = controls.querySelector('.music-volume span');
  const Audio = window.AudioContext || window.webkitAudioContext;
  let lastVolume = volume.valueAsNumber;
  let gain;
  let request = 0;

  function updateControls() {
    const playing = !music.error && !music.muted && !music.paused;
    const action = music.error ? '重試背景音樂' :
      playing ? '靜音背景音樂' : '開啟背景音樂';
    controls.toggleAttribute('data-playing', playing);
    toggle.setAttribute('aria-label', action);
    toggle.title = action;
    percentage.textContent = volume.value + '%';
    volume.setAttribute('aria-valuetext', percentage.textContent);
  }

  async function enableMusic() {
    const attempt = ++request;
    try {
      if (music.error) music.load();
      // A gain node also supports in-page volume on iOS, where audio.volume can be fixed.
      if (Audio && !gain) {
        audioContext ??= new Audio();
        const output = audioContext.createGain();
        audioContext.createMediaElementSource(music).connect(output).connect(audioContext.destination);
        gain = output;
      }
      applyVolume();
      const ready = gain ? audioContext.resume() : Promise.resolve();
      music.muted = false;
      await Promise.all([ready, music.play()]);
    } catch {
      if (attempt !== request) return;
      music.muted = true;
      announce('背景音樂無法播放，請再試一次');
    }
    updateControls();
  }

  function applyVolume() {
    const level = volume.valueAsNumber / 100;
    if (gain) gain.gain.value = level;
    else music.volume = level;
  }

  toggle.addEventListener('click', () => {
    if (music.muted || music.paused || music.error) {
      if (volume.valueAsNumber === 0) volume.value = lastVolume;
      enableMusic();
    } else {
      request++;
      music.muted = true;
    }
    updateControls();
  });

  volume.addEventListener('input', () => {
    const level = volume.valueAsNumber;
    if (level === 0) {
      request++;
      music.muted = true;
      applyVolume();
    } else {
      lastVolume = level;
      if (music.muted || music.paused) enableMusic();
      else applyVolume();
    }
    updateControls();
  });

  ['playing', 'pause', 'error', 'volumechange'].forEach(event => {
    music.addEventListener(event, updateControls);
  });
  music.muted = true;
  controls.hidden = false;
  updateControls();
  music.play().catch(updateControls);
}
