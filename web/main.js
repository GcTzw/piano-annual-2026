const toast = document.querySelector('.toast');
// Hide only while an observer is available; without JS the program stays readable.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('revealed', entry.isIntersecting);
    });
  }, {rootMargin: '0px 0px -30px 0px', threshold: 0});
  document.querySelectorAll('.movement').forEach(section => {
    section.classList.add('reveal-pending');
    reveal.observe(section);
  });
}

// Two octaves, C3–C5, with C4 exactly at the center of the white keys.
const keyboard = document.querySelector('.keyboard');
const whites = [48,50,52,53,55,57,59,60,62,64,65,67,69,71,72];
const names = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
let audioContext;
async function sound(midi, button) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) { announce('此瀏覽器不支援琴鍵音效'); return; }
  try {
    audioContext ??= new Audio();
    await audioContext.resume();
    const now = audioContext.currentTime;
    const volume = audioContext.createGain();
    volume.gain.setValueAtTime(0, now);
    volume.gain.linearRampToValueAtTime(.14, now + .008);
    volume.gain.exponentialRampToValueAtTime(.001, now + 1.6);
    volume.connect(audioContext.destination);
    // Short attack and decaying harmonics approximate a struck piano string.
    [1, 2, 3].forEach((harmonic, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440 * 2 ** ((midi - 69) / 12) * harmonic;
      gain.gain.setValueAtTime([.75,.18,.07][i], now);
      gain.gain.exponentialRampToValueAtTime(.001, now + 1.6 / harmonic);
      osc.connect(gain).connect(volume);
      osc.start(now); osc.stop(now + 1.7);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
    setTimeout(() => volume.disconnect(), 1800);
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 180);
  } catch { announce('音效尚未啟用，請再次輕觸琴鍵'); }
}
function addKey(midi, index, black = false) {
  const button = document.createElement('button');
  const note = names[midi % 12] + (Math.floor(midi / 12) - 1);
  button.type = 'button';
  button.className = black ? 'piano-key black-key' : 'piano-key white-key';
  button.dataset.midi = midi;
  button.setAttribute('aria-label', `演奏 ${note}`);
  button.title = note;
  if (black) button.style.left = `${(index + 1) / whites.length * 100}%`;
  if (midi === 60) { button.classList.add('middle-c'); button.textContent = 'C4'; }
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault(); button.focus({preventScroll:true}); sound(midi, button);
  });
  button.addEventListener('click', event => { if (event.detail === 0) sound(midi, button); });
  keyboard.append(button);
}
whites.forEach((midi, index) => addKey(midi, index));
whites.forEach((midi, index) => { if (whites[index + 1] === midi + 2) addKey(midi + 1, index, true); });

// Use the rotated keyboard's visible bounds rather than a fixed breakpoint offset.
const pianoHint = document.querySelector('.piano-hint');
const pianoArt = document.querySelector('.art');
function positionPianoHint() {
  const keys = keyboard.getBoundingClientRect();
  const art = pianoArt.getBoundingClientRect();
  pianoHint.style.top = `${keys.bottom - art.top + 22}px`;
  pianoHint.style.left = `${keys.left + keys.width / 2 - art.left}px`;
}
new ResizeObserver(positionPianoHint).observe(pianoArt);
window.addEventListener('resize', positionPianoHint);
document.fonts.ready.then(positionPianoHint);
positionPianoHint();
let toastTimer;
function announce(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}
// Fallback for browsers without native details grouping support.
const pieces = [...document.querySelectorAll('.piece')];
function selectPiece(selected) {
  pieces.forEach(piece => { if (piece !== selected) piece.open = false; });
}
pieces.forEach(piece => piece.addEventListener('toggle', () => {
  if (piece.open) selectPiece(piece);
}));
const backFirst = document.querySelector('.back-first');
backFirst?.addEventListener('click', () => {
  const first = document.querySelector('#piece-01');
  selectPiece(first);
  first.querySelector('summary').focus({preventScroll:true});
});
function openHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches('details')) { selectPiece(target); target.open = true; }
}
openHash();
window.addEventListener('hashchange', openHash);
const links = document.querySelectorAll('[data-part]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.dataset.part === entry.target.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-10% 0px -65% 0px', threshold: 0});
  document.querySelectorAll('.movement').forEach(section => observer.observe(section));
}

// Show the shortcut only while the program occupies the reading area.
const programArea = document.querySelector('#program');
let shortcutFrame;
function updateProgramShortcut() {
  const bounds = programArea.getBoundingClientRect();
  backFirst.hidden = !(bounds.top <= window.innerHeight * .5 && bounds.bottom > window.innerHeight * .5);
}
function scheduleShortcutUpdate() {
  if (shortcutFrame) return;
  shortcutFrame = requestAnimationFrame(() => {
    shortcutFrame = null;
    updateProgramShortcut();
  });
}
if (backFirst && programArea) {
  window.addEventListener('scroll', scheduleShortcutUpdate, {passive:true});
  window.addEventListener('resize', scheduleShortcutUpdate);
  new ResizeObserver(scheduleShortcutUpdate).observe(programArea);
  updateProgramShortcut();
}
