// Variabel Global
let isLoadingScene = false;
let voTimeoutId = null;
let bgmVol = 0.35;
let currentBGM = null;

// Config diambil dari window.gameConfig (js/config.js)
const sceneVOMap = window.gameConfig?.vo || {};
const sceneBGMMap = window.gameConfig?.bgm || {};

// Helper untuk membaca bundle offline atau fetch jika tidak ada
function fetchOrBundle(url) {
    // Normalisasi URL (hilangkan ./ atau / di depan jika perlu, samakan dengan key di bundle)
    // Di build script kita pakai relative path e.g 'scene/title.html'
    const normalizedUrl = url.startsWith('./') ? url.slice(2) : url;

    if (window.OFFLINE_CONTENT && window.OFFLINE_CONTENT[normalizedUrl]) {
        console.log(`[Offline] Loaded from bundle: ${normalizedUrl}`);
        return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(window.OFFLINE_CONTENT[normalizedUrl]),
            json: () => Promise.resolve(JSON.parse(window.OFFLINE_CONTENT[normalizedUrl]))
        });
    }

    // Fallback ke network fetch biasa
    return fetch(url);
}

// Helper untuk inject Lottie Blob (Offline Fix)
function injectOfflineLottie(container) {
    container.querySelectorAll('dotlottie-player').forEach(player => {
        const src = player.getAttribute('src');
        // Normalisasi URL dan cek bundle
        const normalizedSrc = src ? (src.startsWith('./') ? src.slice(2) : src) : null;

        if (normalizedSrc && window.OFFLINE_CONTENT && window.OFFLINE_CONTENT[normalizedSrc]) {
            const jsonContent = window.OFFLINE_CONTENT[normalizedSrc];
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const blobUrl = URL.createObjectURL(blob);
            player.setAttribute('src', blobUrl);
            console.log(`[Offline] Injected Lottie Blob for: ${normalizedSrc}`);
        }
    });
}



// Fungsi untuk menjalankan script dalam HTML yang sudah di-inject
function runScripts(container) {
    container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// Fungsi Load HTML (dengan eksekusi script)
function loadHTML(selector, url, options = {}) {
    return fetchOrBundle(url)
        .then(res => res.text())
        .then(html => {
            const el = document.querySelector(selector);
            if (!el) throw new Error(`Elemen ${selector} tidak ditemukan di DOM`);

            el.innerHTML = html;
            injectOfflineLottie(el);

            runScripts(el);

            if (options.name) {
                el.classList.add(`scene-${options.name}`);
            }

            const stage = document.querySelector('.stage');
            if (stage) {
                stage.classList.remove('showheader', 'showfooter', 'immersive');

                soundman.stopChannel('voice');
                lucide.createIcons();
                applyAmazingTitleEffect();
                setupBtnSFX();
                loadAndRenderAllVoTexts();

                if (typeof options.hideHUD === 'boolean') {
                    options.hideHUD = options.hideHUD ? 'both' : 'none';
                }

                switch (options.hideHUD) {
                    case 'both':
                        stage.classList.add('immersive');
                        break;
                    case 'header':
                        stage.classList.add('showheader');
                        break;
                    case 'footer':
                        stage.classList.add('showfooter');
                        break;
                    case 'none':
                    default:
                        break;
                }
            }
        });
}

// Fungsi Load Scene tanpa transisi
function loadScene(name, hideHUD = 'none') {
    if (isLoadingScene) return;
    isLoadingScene = true;

    // Sync FlowManager State
    if (window.FlowManager) {
        window.FlowManager.currentScene = name;
    }

    if (voTimeoutId) {
        clearTimeout(voTimeoutId);
        voTimeoutId = null;
    }

    soundman.stopChannel('voice');

    Object.keys(soundman.channels.bgm).forEach(bgmName => {
        soundman.stop(bgmName);
    });

    lucide.createIcons();
    applyAmazingTitleEffect();
    setupBtnSFX();
    loadAndRenderAllVoTexts();

    const configVO = sceneVOMap[name];
    if (configVO) {
        voTimeoutId = setTimeout(() => {
            if (typeof readAloud === 'function') {
                readAloud(configVO.sound);
            } else {
                soundman.play(configVO.sound);
            }
            voTimeoutId = null;
        }, configVO.delay);
    }

    const configBGM = sceneBGMMap[name];
    if (configBGM) {
        const sound = configBGM.sound;

        const fadeAndPlayMatch = sound.match(/^\[FO=(\d+)\](?:&(.+))?$/);
        if (fadeAndPlayMatch) {
            const fadeDuration = parseInt(fadeAndPlayMatch[1], 10);
            const nextBGM = fadeAndPlayMatch[2];

            if (nextBGM && !soundman.channels.bgm[nextBGM]?.paused) {
                return;
            }

            Promise.all(
                Object.keys(soundman.channels.bgm).map(bgmName =>
                    soundman.fadeOut(bgmName, fadeDuration)
                )
            ).then(() => {
                if (nextBGM) {
                    soundman.play(nextBGM, configBGM.volume ?? bgmVol);
                }
            });

        } else if (sound === '[STOP]') {
            Object.keys(soundman.channels.bgm).forEach(bgmName => {
                soundman.stop(bgmName);
            });

        } else {
            if (!soundman.channels.bgm[sound]?.paused) {
                return;
            }

            soundman.play(sound, configBGM.volume ?? bgmVol);
        }
    }

    return loadHTML('#main .scene', `scene/${name}.html`, { hideHUD, name })
        .finally(() => {
            isLoadingScene = false;
        });
}

function applyInputBlocker(duration = 1800) {
    const inputBlocker = document.createElement('div');
    inputBlocker.style.position = 'fixed';
    inputBlocker.style.top = '0';
    inputBlocker.style.left = '0';
    inputBlocker.style.width = '100vw';
    inputBlocker.style.height = '100vh';
    inputBlocker.style.zIndex = '9999';
    inputBlocker.style.background = 'transparent';
    inputBlocker.style.pointerEvents = 'all';
    inputBlocker.id = 'input-blocker-priority';
    document.body.appendChild(inputBlocker);
    setTimeout(() => {
        const blocker = document.getElementById('input-blocker-priority');
        if (blocker) blocker.remove();
    }, duration);
}

// Fungsi Load Scene dengan transisi
function loadSceneTrans(name, hideHUD = 'none', transition = 'fade') {
    if (isLoadingScene) return;
    isLoadingScene = true;

    // Sync FlowManager State
    if (window.FlowManager) {
        window.FlowManager.currentScene = name;
    }

    // --- BGM Logic (Moved to Top for Sync Execution) ---
    const configBGM = sceneBGMMap[name];
    if (configBGM) {
        const sound = configBGM.sound;
        const fadeAndPlayMatch = sound.match(/^\[FO=(\d+)\](?:&(.+))?$/);

        if (fadeAndPlayMatch) {
            const fadeDuration = parseInt(fadeAndPlayMatch[1], 10);
            const nextBGM = fadeAndPlayMatch[2];

            if (fadeDuration < 50) {
                // SYNC path (Preserves user gesture)

                // 1. Check if nextBGM is already playing
                const isSameBGM = nextBGM && soundman.channels.bgm[nextBGM] && !soundman.channels.bgm[nextBGM].paused;

                // 2. Stop everything EXCEPT the nextBGM (if it's the same)
                Object.keys(soundman.channels.bgm).forEach(bgmName => {
                    if (bgmName !== nextBGM && soundman.channels.bgm[bgmName]) {
                        soundman.channels.bgm[bgmName].pause();
                        soundman.channels.bgm[bgmName].currentTime = 0;
                    }
                });

                // 3. Play nextBGM if it wasn't already playing
                if (nextBGM && !isSameBGM) {
                    soundman.play(nextBGM, configBGM.volume ?? bgmVol);
                }

            } else {
                // ASYNC path (Long fades)
                const isSameBGM = nextBGM && soundman.channels.bgm[nextBGM] && !soundman.channels.bgm[nextBGM].paused;

                if (isSameBGM) {
                    // Logic: If same, don't stop it. Stop others.
                    Object.keys(soundman.channels.bgm).forEach(bgmName => {
                        if (bgmName !== nextBGM) soundman.fadeOut(bgmName, fadeDuration);
                    });
                    // Continue to scene loading... (NO RETURN HERE)
                } else {


                    // 1. Fade Out Others
                    Object.keys(soundman.channels.bgm).forEach(bgmName => {
                        if (bgmName !== nextBGM) soundman.fadeOut(bgmName, fadeDuration);
                    });

                    // 2. Wait for Fade Out, then Play Next
                    if (nextBGM) {
                        setTimeout(() => {
                            // Ensure previous tracks are fully stopped/paused if fadeOut didn't catch them?
                            // soundman.play logic handles unpausing.

                            const targetVol = configBGM.volume ?? bgmVol;
                            soundman.play(nextBGM, targetVol);

                            // Optional: If we want a fade-in for the new track too, we can implement it here.
                            // But usually "Wait then Play" implies playing at target volume immediately or short fade.
                            // Assuming direct play at target volume for now based on request "beres baru diplay".

                        }, fadeDuration);
                    }

                }
            }
        } else if (sound === '[STOP]') {
            Object.keys(soundman.channels.bgm).forEach(bgmName => soundman.stop(bgmName));

        } else {
            // Direct Play (Sync)
            if (!soundman.channels.bgm[sound]?.paused) {
                // already playing
            } else {
                soundman.play(sound, configBGM.volume ?? bgmVol);
            }
        }
    }
    // --- End BGM Logic ---

    if (voTimeoutId) {
        clearTimeout(voTimeoutId);
        voTimeoutId = null;
    }

    const main = document.querySelector('#main');
    const oldScene = main.querySelector('.scene');

    if (oldScene) {
        oldScene.classList.remove('scene');
        oldScene.classList.add('scene-prev');
    }

    const newWrapper = document.createElement('div');
    newWrapper.classList.add('scene', `transition-in-${transition}`);

    return fetchOrBundle(`scene/${name}.html`)
        .then(res => res.text())
        .then(html => {
            newWrapper.innerHTML = html;
            injectOfflineLottie(newWrapper);
            newWrapper.classList.add(`scene-${name.replace(/\//g, '-')}`);
            main.appendChild(newWrapper);

            runScripts(newWrapper);

            void newWrapper.offsetWidth;
            newWrapper.classList.remove(`transition-in-${transition}`);

            const prevScene = document.querySelector('.scene-prev');
            if (prevScene) {
                prevScene.classList.add(`transition-out-${transition}`);
                console.log('Transisi keluar dimulai, prevScene:', prevScene);
                const inputBlocker = document.createElement('div');
                inputBlocker.style.position = 'fixed';
                inputBlocker.style.top = '0';
                inputBlocker.style.left = '0';
                inputBlocker.style.width = '100vw';
                inputBlocker.style.height = '100vh';
                inputBlocker.style.zIndex = '9999';
                inputBlocker.style.background = 'transparent';
                inputBlocker.style.pointerEvents = 'all';
                inputBlocker.id = 'input-blocker';
                document.body.appendChild(inputBlocker);
                setTimeout(() => {
                    const prev = document.querySelector('.scene-prev');
                    if (prev) {
                        console.log('Timeout selesai, akan remove prevScene');
                        prev.remove();
                        console.log('prevScene dihapus dari DOM');
                    } else {
                        console.warn('prevScene sudah tidak ada saat timeout');
                    }

                    const blocker = document.getElementById('input-blocker');
                    if (blocker) blocker.remove();
                }, 500);
            }

            soundman.stopChannel('voice');
            lucide.createIcons();
            applyAmazingTitleEffect();
            setupBtnSFX();
            loadAndRenderAllVoTexts();

            if (typeof hideHUD === 'boolean') {
                hideHUD = hideHUD ? 'both' : 'none';
            }

            const stage = document.querySelector('.stage');
            if (stage) {
                stage.classList.remove('showheader', 'showfooter', 'immersive');
                switch (hideHUD) {
                    case 'both':
                        stage.classList.add('immersive');
                        break;
                    case 'header':
                        stage.classList.add('showheader');
                        break;
                    case 'footer':
                        stage.classList.add('showfooter');
                        break;
                }
            }

            const config = sceneVOMap[name];
            if (config) {
                voTimeoutId = setTimeout(() => {
                    if (typeof readAloud === 'function') {
                        readAloud(config.sound);
                    } else {
                        soundman.play(config.sound);
                    }
                    voTimeoutId = null;
                }, config.delay);
            }



        })
        .finally(() => {
            isLoadingScene = false;
        });
}



// DOM Ready
window.addEventListener('load', () => {
    firstScene = 'splash';

    document.body.addEventListener('touchmove', function (e) {
        if (e.touches.length === 1 && Math.abs(e.touches[0].clientX) < 50) {
            e.preventDefault();
        }
    }, { passive: false });



    // Headers and Footers are now handled by UIManager
    // Popups are handled by PopupManager (initPopups)

    initPopups();

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            console.log('F11 pressed!');
            e.preventDefault();
        }
    });
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey && e.key === 'r') || // Ctrl+R
            (e.key === 'F5') ||             // F5
            (e.ctrlKey && e.shiftKey && e.key === 'I')) { // Ctrl+Shift+I
            e.preventDefault();
            console.log('Shortcut prevented!');
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12') {
            e.preventDefault(); // 🚫 Ini biasanya TIDAK akan berfungsi
            console.log("F12 pressed - trying to prevent...");
        }
    });

    const stage = document.querySelector('.stage');
    if (stage) {
        stage.classList.remove('showheader', 'showfooter');
        stage.classList.add('immersive');
        stage.classList.remove('init');
        document.body.classList.remove('init');
        console.log('BGM loaded:', Object.keys(soundman.channels.bgm));
        Object.entries(soundman.channels.bgm).forEach(([name, entry]) => {
            console.log(`${name}: buffer =`, entry.buffer);
        });

    }
});


