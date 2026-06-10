/* ================================================
   MineHostum - Coming Soon Page Script
   Countdown Timer + Tick-Tock Sound
   ================================================ */

(function () {
    'use strict';

    // --- Configuration ---
    const TARGET_DATE = new Date('2026-07-06T00:00:00+03:00'); // 6 Temmuz 2026
    const TOTAL_DURATION_MS = TARGET_DATE.getTime() - new Date('2026-01-01T00:00:00+03:00').getTime();

    // --- Audio ---
    let audioCtx = null;
    let isTick = true;

    // Otomatik sesi başlatmayı dene, veya sayfada herhangi bir etkileşim olunca ses başlasın
    function startAudioOnInteraction() {
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('keydown', startAudioOnInteraction);
    window.addEventListener('load', () => {
        initAudio();
        // Bazı tarayıcılar hemen izin verebilir:
        if (audioCtx) {
            audioCtx.resume().catch(() => {
                // Sessizce başarısız olabilir (etkileşim bekler)
            });
        }
    });



    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }

    function playTick() {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const freq = isTick ? 800 : 600;
        const volume = 0.35;
        isTick = !isTick;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.02);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now);
        gain2.gain.setValueAtTime(volume * 0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now);
        osc2.stop(now + 0.03);
    }



    // --- Countdown Timer ---
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');

    let lastSecond = -1;

    function updateCountdown() {
        const now = new Date();
        const diff = TARGET_DATE.getTime() - now.getTime();

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');

        if (seconds !== lastSecond) {
            lastSecond = seconds;
            playTick();

            const secCard = secondsEl.closest('.time-card');
            secCard.classList.remove('tick');
            void secCard.offsetWidth;
            secCard.classList.add('tick');
        }

        // Progress bar
        const elapsed = now.getTime() - new Date('2026-01-01T00:00:00+03:00').getTime();
        const rawProgress = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 100);
        const cappedProgress = Math.min(rawProgress * 0.6, 60);
        progressFill.style.width = cappedProgress + '%';
        progressPercent.textContent = Math.round(cappedProgress) + '%';
    }

    updateCountdown();
    setInterval(updateCountdown, 200);

})();
