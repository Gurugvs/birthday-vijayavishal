// ==========================================================================
// 🎂 BIRTHDAY CELEBRATION APP JAVASCRIPT
// Dedicated to Vijayavishal
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // AUDIO SYNTHESIZER (Web Audio API - No external mp3 files required!)
  // ------------------------------------------------------------------------
  class SoundController {
    constructor() {
      this.ctx = null;
      this.isPlayingMusic = false;
      this.musicTimer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Play a single tone
    playTone(freq, type = 'sine', duration = 0.3, gainVal = 0.15) {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio playback error', e);
      }
    }

    // Sound effect: Balloon Pop
    playPop() {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    }

    // Sound effect: Candle Extinguish (Puff)
    playPuff() {
      this.init();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    }

    // Sound effect: Fanfare / Celebration
    playFanfare() {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.5, 0.25);
        }, index * 120);
      });
    }

    // Sound effect: Glitch / Tech Alarm
    playGlitchBeep() {
      this.init();
      this.playTone(880, 'sawtooth', 0.08, 0.2);
    }

    // Melody: Happy Birthday synth loop
    startBirthdayMelody() {
      this.init();
      this.isPlayingMusic = true;

      // Happy Birthday Melody Frequencies & Beat Durations
      // "Happy Birthday to you, Happy Birthday to you, Happy Birthday dear Vijayavishal, Happy Birthday to you"
      const melody = [
        { f: 261.63, d: 250 }, { f: 261.63, d: 250 }, { f: 293.66, d: 500 }, { f: 261.63, d: 500 }, { f: 349.23, d: 500 }, { f: 329.63, d: 1000 },
        { f: 261.63, d: 250 }, { f: 261.63, d: 250 }, { f: 293.66, d: 500 }, { f: 261.63, d: 500 }, { f: 392.00, d: 500 }, { f: 349.23, d: 1000 },
        { f: 261.63, d: 250 }, { f: 261.63, d: 250 }, { f: 523.25, d: 500 }, { f: 440.00, d: 500 }, { f: 349.23, d: 500 }, { f: 329.63, d: 500 }, { f: 293.66, d: 1000 },
        { f: 466.16, d: 250 }, { f: 466.16, d: 250 }, { f: 440.00, d: 500 }, { f: 349.23, d: 500 }, { f: 392.00, d: 500 }, { f: 349.23, d: 1200 }
      ];

      let noteIndex = 0;

      const playNextNote = () => {
        if (!this.isPlayingMusic) return;
        const current = melody[noteIndex];
        this.playTone(current.f, 'sine', (current.d / 1000) * 0.9, 0.14);

        noteIndex = (noteIndex + 1) % melody.length;
        const nextDelay = current.d + (noteIndex === 0 ? 1500 : 80);
        this.musicTimer = setTimeout(playNextNote, nextDelay);
      };

      playNextNote();
    }

    stopBirthdayMelody() {
      this.isPlayingMusic = false;
      if (this.musicTimer) clearTimeout(this.musicTimer);
    }
  }

  const sound = new SoundController();

  // ------------------------------------------------------------------------
  // CANVAS CONFETTI & FIREWORKS ENGINE
  // ------------------------------------------------------------------------
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, isExplosion = false) {
      this.x = x;
      this.y = y;
      const colors = ['#ffd166', '#ff4d8d', '#06d6a0', '#118ab2', '#073b4c', '#9d4edd', '#ffffff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.size = Math.random() * 8 + 4;

      if (isExplosion) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      } else {
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 3 + 2;
      }

      this.gravity = 0.15;
      this.opacity = 1;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 8;
      this.isExplosion = isExplosion;
      this.life = isExplosion ? 80 : 250;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.rotation += this.rotSpeed;
      this.life--;

      if (this.isExplosion) {
        this.opacity = Math.max(0, this.life / 80);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function launchConfettiBlast(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 90) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(originX, originY, true));
    }
  }

  function addRainConfetti() {
    if (particles.length < 150) {
      particles.push(new Particle(Math.random() * canvas.width, -10, false));
    }
  }

  function renderFX() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.life <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(renderFX);
  }
  renderFX();

  // Screen click triggers mini fireworks
  document.addEventListener('click', (e) => {
    // Only launch fireworks if inside celebration screen
    if (!celebrationScreen.classList.contains('hidden') && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
      launchConfettiBlast(e.clientX, e.clientY, 30);
    }
  });

  // ------------------------------------------------------------------------
  // PHASE 1: 404 PRANK & UNLOCK MECHANISM
  // ------------------------------------------------------------------------
  const prankScreen = document.getElementById('prank-screen');
  const fixBtn = document.getElementById('fix-error-btn');
  const glitchOverlay = document.getElementById('glitch-overlay');
  const countEl = document.getElementById('override-count');
  const celebrationScreen = document.getElementById('celebration-screen');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicStatusText = document.getElementById('music-status-text');

  function triggerUnlock() {
    sound.init();
    glitchOverlay.classList.add('active');

    let count = 3;
    countEl.textContent = count;
    sound.playGlitchBeep();

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countEl.textContent = count;
        sound.playGlitchBeep();
      } else {
        clearInterval(countInterval);
        countEl.textContent = '🚀 GO!';
        sound.playFanfare();

        setTimeout(() => {
          // Transition screens
          prankScreen.style.opacity = '0';
          prankScreen.style.transform = 'scale(1.1)';
          
          setTimeout(() => {
            prankScreen.classList.add('hidden');
            celebrationScreen.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Launch huge celebratory confetti explosions!
            launchConfettiBlast(window.innerWidth * 0.2, window.innerHeight * 0.4, 80);
            launchConfettiBlast(window.innerWidth * 0.5, window.innerHeight * 0.3, 100);
            launchConfettiBlast(window.innerWidth * 0.8, window.innerHeight * 0.4, 80);

            // Confetti rain interval
            setInterval(addRainConfetti, 120);

            // Start celebration melody
            sound.startBirthdayMelody();
            musicStatusText.textContent = 'Music: ON';
          }, 600);
        }, 600);
      }
    }, 800);
  }

  fixBtn.addEventListener('click', triggerUnlock);

  // Replay Prank button in footer
  const replayBtn = document.getElementById('replay-prank-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      sound.stopBirthdayMelody();
      glitchOverlay.classList.remove('active');
      prankScreen.style.opacity = '1';
      prankScreen.style.transform = 'scale(1)';
      prankScreen.classList.remove('hidden');
      celebrationScreen.classList.add('hidden');
    });
  }

  // Music toggle control
  musicToggleBtn.addEventListener('click', () => {
    if (sound.isPlayingMusic) {
      sound.stopBirthdayMelody();
      musicStatusText.textContent = 'Music: OFF';
    } else {
      sound.startBirthdayMelody();
      musicStatusText.textContent = 'Music: ON';
    }
  });

  // Confetti burst button
  const confettiBurstBtn = document.getElementById('confetti-burst-btn');
  confettiBurstBtn.addEventListener('click', () => {
    launchConfettiBlast(window.innerWidth / 2, window.innerHeight / 2, 80);
    sound.playFanfare();
  });

  // ------------------------------------------------------------------------
  // INTERACTIVE BIRTHDAY CAKE & CANDLE BLOWOUT
  // ------------------------------------------------------------------------
  const candles = document.querySelectorAll('.candle');
  const blowAllBtn = document.getElementById('blow-all-candles-btn');
  const relightBtn = document.getElementById('relight-candles-btn');
  const wishCard = document.getElementById('wish-card');
  const cakeInstructions = document.getElementById('cake-instructions');

  let extinguishedCount = 0;

  function extinguishCandle(candle) {
    if (!candle.classList.contains('extinguished')) {
      candle.classList.add('extinguished');
      sound.playPuff();
      extinguishedCount++;
      cakeInstructions.textContent = `${extinguishedCount} of ${candles.length} candles blown out! Keep going...`;

      if (extinguishedCount === candles.length) {
        onAllCandlesExtinguished();
      }
    }
  }

  candles.forEach((candle) => {
    candle.addEventListener('click', () => extinguishCandle(candle));
  });

  blowAllBtn.addEventListener('click', () => {
    candles.forEach((candle, idx) => {
      setTimeout(() => extinguishCandle(candle), idx * 100);
    });
  });

  function onAllCandlesExtinguished() {
    cakeInstructions.textContent = '🌟 All candles extinguished! Happy Birthday Vijayavishal!';
    wishCard.classList.remove('hidden');
    blowAllBtn.classList.add('hidden');
    relightBtn.classList.remove('hidden');
    sound.playFanfare();
    launchConfettiBlast(window.innerWidth / 2, window.innerHeight * 0.45, 120);
  }

  relightBtn.addEventListener('click', () => {
    candles.forEach((candle) => candle.classList.remove('extinguished'));
    extinguishedCount = 0;
    wishCard.classList.add('hidden');
    blowAllBtn.classList.remove('hidden');
    relightBtn.classList.add('hidden');
    cakeInstructions.textContent = 'Tap the candles to blow them out, make your birthday wish!';
  });

  // ------------------------------------------------------------------------
  // POLAROID GALLERY, LIGHTBOX & CUSTOM PHOTO UPLOADER
  // ------------------------------------------------------------------------
  const polaroids = document.querySelectorAll('.polaroid-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const photoInput = document.getElementById('custom-photo-input');
  const polaroidContainer = document.getElementById('polaroid-container');

  function openLightbox(imgSrc, captionText) {
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = captionText;
    lightboxModal.classList.remove('hidden');
  }

  polaroids.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('.caption-title')?.textContent || 'Special Memory';
      if (img && img.src) {
        openLightbox(img.src, title);
      }
    });
  });

  lightboxClose.addEventListener('click', () => lightboxModal.classList.add('hidden'));
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) lightboxModal.classList.add('hidden');
  });

  // Photo Uploader: Read user's files and prepend new polaroids!
  photoInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newCard = document.createElement('div');
        const randomRot = (Math.random() * 6 - 3).toFixed(1);
        newCard.className = 'polaroid-card';
        newCard.style.setProperty('--rotation', `${randomRot}deg`);

        newCard.innerHTML = `
          <div class="tape-strip"></div>
          <div class="polaroid-img-wrapper">
            <img src="${event.target.result}" alt="Friend Memory" class="polaroid-img">
          </div>
          <div class="polaroid-caption">
            <p class="caption-title">Best Moments 🌟</p>
            <p class="caption-date">Vijayavishal's Celebration</p>
          </div>
        `;

        newCard.addEventListener('click', () => {
          openLightbox(event.target.result, 'Best Moments 🌟');
        });

        polaroidContainer.prepend(newCard);
        launchConfettiBlast(window.innerWidth / 2, window.innerHeight / 2, 40);
      };
      reader.readAsDataURL(file);
    });
  });

  // ------------------------------------------------------------------------
  // BALLOON POPPING MINI-GAME
  // ------------------------------------------------------------------------
  const arena = document.getElementById('balloon-arena');
  const popCounter = document.getElementById('pop-counter');
  const popMsgBox = document.getElementById('pop-message-box');
  const popMsgText = document.getElementById('pop-msg-text');

  const balloonColors = ['#ff4d8d', '#ffd166', '#06d6a0', '#9d4edd', '#00b4d8'];
  const birthdayPerks = [
    '🎁 Perk: Unlimited Good Luck in 2026!',
    '🌟 Perk: VIP Boss Status All Year Long!',
    '🍰 Perk: Free Extra Slice of Cake Granted!',
    '🚀 Perk: Massive Success in All Future Projects!',
    '👑 Perk: Official Friend of the Year Award!'
  ];

  let poppedCount = 0;

  function spawnBalloons() {
    arena.innerHTML = '';
    balloonColors.forEach((color, i) => {
      const balloon = document.createElement('div');
      balloon.className = 'game-balloon';
      balloon.style.background = color;
      balloon.style.animationDelay = `${i * 0.4}s`;

      balloon.addEventListener('click', () => {
        sound.playPop();
        launchConfettiBlast(balloon.getBoundingClientRect().left + 30, balloon.getBoundingClientRect().top + 30, 25);
        balloon.style.transform = 'scale(1.4)';
        balloon.style.opacity = '0';

        setTimeout(() => {
          balloon.remove();
          poppedCount++;
          popCounter.textContent = poppedCount;

          const perk = birthdayPerks[i % birthdayPerks.length];
          popMsgText.textContent = perk;
          popMsgBox.classList.remove('hidden');

          if (poppedCount >= 5) {
            popMsgText.textContent = '🏆 All balloons popped! Master Celebrator Unlocked!';
            sound.playFanfare();
            launchConfettiBlast(window.innerWidth / 2, window.innerHeight / 2, 100);
          }
        }, 150);
      });

      arena.appendChild(balloon);
    });
  }

  spawnBalloons();

});
