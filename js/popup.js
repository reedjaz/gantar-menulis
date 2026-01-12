const POPUP_TEMPLATE = `
<div id="settings-popup" class="popup hidden">
    <div class="popup-overlay" onclick="closeSettings()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn btn-cancel" onclick="closeSettings()"><i data-lucide="circle-x"></i></div>
        <div class="popup-content settings-popup flex column gap-10">
            <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">
                Pengaturan</h2>
            <div class="flex column full gap-10">
                <div class="flex row full gap-9">
                    <div class="ctrl-toggle flex column full">
                        <span class="label">
                            <i data-lucide="music"></i><span>Musik Latar</span>
                        </span>
                        <label class="switch large">
                            <input type="checkbox" id="toggle-bgm-checkbox" checked>
                            <span class="mark">
                            </span>
                        </label>
                    </div>
                    <div class="ctrl-toggle flex column full">
                        <span class="label">
                            <i data-lucide="fullscreen"></i><span>Layar Penuh</span>
                        </span>
                        <label class="switch large">
                            <input type="checkbox" id="toggle-fs-checkbox" checked>
                            <span class="mark">
                            </span>
                        </label>
                    </div>
                </div>
                <div class="flex column full gap-6">
                    <button class="full act-wrong btn-click" onclick="
                        openConfirmReset();
                        ">Mulai dari Awal
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
    
<div id="other-popup" class="popup hidden">
    <div class="popup-overlay" onclick="closeOther()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn btn-cancel" onclick="closeOther()"><i data-lucide="circle-x"></i></div>
        <div class="popup-content other-popup flex column gap-10">
            <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">
                Lainnya</h2>
            <div class="flex column full gap-6">
                <button class="full act-study btn-click" onclick="
                    closeSettings();
                    loadSceneTrans('about', 'both', 'zoom-in');
                    ">Tentang
                </button>
                <button class="full act-study btn-click" onclick="
                    closeSettings();
                    loadSceneTrans('help', 'both', 'zoom-in');
                    ">Bantuan
                </button>
            </div>
        </div>
    </div>
</div>

<div id="exit-popup" class="popup hidden">
    <div class="popup-overlay" onclick="closeExit()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn btn-cancel" onclick="closeExit()"><i data-lucide="circle-x"></i></div>
        <div class="popup-content exit-popup flex column gap-10">
            <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">
                Perhatian</h2>
            <div class="flex full gap-6 justify-center items-center text-center weight-bold text-size-9 line-height-10 pb-5">
                Sudah cukup belajarnya?
            </div>
            <div class="flex column gap-6">
                <div class="flex row full gap-6">
                    <button class="full act-wrong btn-cancel" onclick="
                        exitFullscreen();
                        closeExit();
                        loadSceneTrans('halt', 'both', 'fade');
                    ">Ya
                    </button>
                    <button class="full act-neutral btn-click" onclick="
                        closeExit();
                    ">Tidak
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="confirmreset-popup" class="popup hidden">
    <div class="popup-overlay" onclick="closeConfirmReset()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn btn-cancel" onclick="closeConfirmReset()"><i data-lucide="circle-x"></i></div>
        <div class="popup-content confirmreset-popup flex column gap-10">
            <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">
                Perhatian</h2>
            <div
                class="flex full gap-6 justify-center items-center text-center weight-bold text-size-9 line-height-10 pb-5">
                Hapus semua data dan mulai dari awal?
            </div>
            <div class="flex column gap-6">
                <div class="flex row full gap-6">
                    <button class="full act-wrong btn-cancel" onclick="
                        closeConfirmReset();
                        closeSettings();
                        localStorage.clear();
                        loadSceneTrans('halt', 'both', 'fade');
                    ">Ya
                    </button>
                    <button class="full act-neutral btn-click" onclick="
                        closeConfirmReset();
                    ">Tidak
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="backhome-popup" class="popup hidden">
    <div class="popup-overlay" onclick="closeBackHome()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn btn-cancel" onclick="closeBackHome()"><i data-lucide="circle-x"></i></div>
        <div class="popup-content exit-popup flex column gap-10">
            <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">
                Perhatian</h2>
            <div class="flex full gap-6 justify-center items-center text-center text-balance weight-bold text-size-9 line-height-9 pb-5">
                Kembali ke Menu Utama sekarang?
            </div>
            <div class="flex column gap-6">
                <div class="flex row full gap-6">
                    <button class="full act-wrong btn-decide" onclick="
                        closeBackHome();
                        stopStopwatch();
                        resetStopwatch();
                        loadSceneTrans('title', 'both', 'zoom-in');
                    ">Ya
                    </button>
                    <button class="full act-neutral btn-click" onclick="
                        closeBackHome();
                    ">Tidak
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="intro-popup" class="popup hidden" data-close-overlay="false">
    <div class="popup-overlay" onclick="closeIntro()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn inverted btn-cancel" onclick="closeIntro()"><i data-lucide="circle-x"></i></div>
        <div class="popup-content intro-popup flex column bg-normalize cover">
            <div class="flex height-half">
            </div>
            <div class="story-area height-half">
                <div class="story-text gap-4">
                    <button class="read-btn" onclick="readAloud('vo-intro')"><i data-lucide="volume-2"></i></button>
                    <div id="vo-intro" class="vo-text">
                        <span class="vo-text-wrap">
                            Kimu ingin menjenguk Nara yang sedang sakit. Ia ingin membuat kue bingka pisang kesukaan Nara. Tapi sayangnya, bahan-bahan kuenya belum lengkap. Ayo bantu Kimu dengan menyelesaikan tugas-tugas dan kumpulkan semua bahan yang dibutuhkan!
                        </span>
                    </div>
                </div>
                <button class="act-study btn-enter animate-fadeInDown duration-6 delay-7 easing-ease" onclick="
                    closeIntro();
                    loadSceneTrans('a4-play/lobby', 'both', 'zoom-in');
                ">Ayo Bantu Kimu!</button>
            </div>
        </div>
    </div>
</div>

<div id="outro-popup" class="popup hidden" data-close-overlay="false">
    <div class="popup-overlay" onclick="closeOutro()"></div>
    <div class="popup-content-wrapper">
        <div class="close-btn inverted btn-cancel" onclick="
            closeOutro();
            stopConfettiCelebration();
        "><i data-lucide="circle-x"></i></div>
        <div class="popup-content outro-popup flex column bg-normalize cover">
            <div class="flex height-half">
            </div>
            <div class="story-area height-half">
                <div class="story-text gap-4">
                    <button class="read-btn" onclick="readAloud('vo-outro')"><i data-lucide="volume-2"></i></button>
                    <div id="vo-outro" class="vo-text">
                        <span class="vo-text-wrap">
                            Hebat, kamu telah mengumpulkan semua bahan yang diperlukan oleh Kimu untuk membuat kue. Sekarang Kimu dapat menjenguk Nara dan memberikan kue buatannya.
                        </span>
                    </div>
                </div>
                <button class="act-study btn-enter animate-fadeInDown duration-6 delay-7 easing-ease" onclick="
                    closeOutro();
                    stopConfettiCelebration();
                    loadSceneTrans('title', 'both', 'zoom-out');
                ">Menu Utama</button>
            </div>
        </div>
    </div>
</div>
`;

window.initPopups = function () {
    const container = document.getElementById('popup-buffer');
    if (container) {
        container.innerHTML = POPUP_TEMPLATE;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

function openPopup(id, onOpen) {
    const popup = document.getElementById(id);
    if (!popup) return;

    // Overlay click behavior
    const overlay = popup.querySelector('.popup-overlay');
    if (overlay) {
        overlay.onclick = null;
        const shouldClose = popup.dataset.closeOverlay !== "false";
        if (shouldClose) {
            overlay.onclick = () => closePopup(id);
        }
    }

    // Jalankan kode tambahan (khusus settings, dll)
    if (typeof onOpen === 'function') onOpen();

    popup.classList.remove('hidden');
    void popup.offsetWidth;
    popup.classList.add('show');
}

function closePopup(id) {
    const popup = document.getElementById(id);
    if (!popup) return;

    popup.classList.remove('show');
    popup.addEventListener('transitionend', function handler() {
        popup.classList.add('hidden');
        popup.removeEventListener('transitionend', handler);
    }, { once: true });
}

// === Custom Logic untuk masing-masing popup ===

function openSettings() {
    openPopup('settings-popup', () => {
        const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
        const fsCheckbox = document.getElementById('toggle-fs-checkbox');

        if (bgmCheckbox && soundman.channels.bgm) {
            bgmCheckbox.checked = !soundman.channels.bgm.paused;
        }
        if (fsCheckbox) {
            fsCheckbox.checked = !!document.fullscreenElement;
        }

        setupToggles();
    });
}

function closeSettings() {
    closePopup('settings-popup');
}

function openOther() {
    openPopup('other-popup');
}
function closeOther() {
    closePopup('other-popup');
}

function openExit() {
    openPopup('exit-popup');
}
function closeExit() {
    closePopup('exit-popup');
}

function openConfirmReset() {
    openPopup('confirmreset-popup');
}
function closeConfirmReset() {
    closePopup('confirmreset-popup');
}

function openBackHome() {
    openPopup('backhome-popup');
}
function closeBackHome() {
    closePopup('backhome-popup');
}

function openIntro() {
    applyInputBlocker(1250);
    openPopup('intro-popup');
    setTimeout(() => {
        readAloud('vo-intro');
    }, 450);
}
function closeIntro() {
    closePopup('intro-popup');
    stopAllVOHighlight();
}

function openOutro() {
    applyInputBlocker(3250);
    openPopup('outro-popup');
    setTimeout(() => {
        readAloud('vo-outro');
    }, 1500);
}
function closeOutro() {
    closePopup('outro-popup');
    stopAllVOHighlight();
}

// === Checkbox Setup Logic ===

function setupToggles() {
    const bgmCheckbox = document.getElementById('toggle-bgm-checkbox');
    const fsCheckbox = document.getElementById('toggle-fs-checkbox');

    if (bgmCheckbox) {
        const newBgmCheckbox = bgmCheckbox.cloneNode(true);
        bgmCheckbox.parentNode.replaceChild(newBgmCheckbox, bgmCheckbox);

        newBgmCheckbox.addEventListener('change', function () {
            if (this.checked) {
                if (soundman && typeof soundman.toggleMuteAllBgm === 'function') {
                    // Checkbox checked = BGM ON (unmute)
                    // Logic toggleMuteAllBgm(mute): if mute is true, it mutes.
                    // So if checked (enabled), mute should be false.
                    soundman.toggleMuteAllBgm(false);
                }
            } else {
                if (soundman && typeof soundman.toggleMuteAllBgm === 'function') {
                    soundman.toggleMuteAllBgm(true);
                }
            }
        });
    }

    if (fsCheckbox) {
        const newFsCheckbox = fsCheckbox.cloneNode(true);
        fsCheckbox.parentNode.replaceChild(newFsCheckbox, fsCheckbox);

        newFsCheckbox.addEventListener('change', function () {
            if (this.checked) {
                goFullscreen();
            } else {
                exitFullscreen();
            }
        });
    }
}