window.UIManager = {
    // Render Header secara dinamis
    renderHeader(type, options = {}) {
        const headerEl = document.getElementById('header');
        if (!headerEl) return;

        let html = '';

        if (type === 'empty') {
            html = ''; // Kosong (untuk title screen dll)
            headerEl.innerHTML = html;
            return;
        }

        // Default Values
        const {
            maxStep = 1,
            currentStep = 0,
            backAction = "goPrev()",
            backLabel = "Kembali"
        } = options;

        if (type === 'activity') {
            const percentage = maxStep > 0 ? ((currentStep - 1) / maxStep) * 100 : 0;
            html = `
            <section class="header-bar flex row justify-between items-center py-0 gap-12">
                <div class="flex row gap-7 justify-start width-auto">
                    <div class="top-button btn-cancel" onclick="${backAction}">
                        <i data-lucide="arrow-left"></i>
                        <span>${backLabel}</span>
                    </div>
                </div>
                <div class="progress-bar grow padding-0">
                    <div class="bar">
                        <div id="activity-progress" class="completed" data-max="${maxStep}" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div id="step-indicator" class="flex row width-auto">
                    <span id="step">${currentStep}</span>
                    /
                    <span id="steps">${maxStep}</span>
                </div>
            </section>
            `;
        } else if (type === 'activity-slim') {
            const effectiveMax = Math.max(1, maxStep - 2);
            const percentage = maxStep > 0 ? (Math.max(0, currentStep - 1) / effectiveMax) * 100 : 0;
            html = `
            <section class="header-bar slim flex row justify-center items-start py-0 gap-12">
                 <div class="progress-bar grow padding-0">
                    <div class="bar">
                        <div id="activity-progress" class="completed" data-max="${maxStep}" style="width: ${percentage}%"></div>
                    </div>
                </div>
            </section>
            `;
        } else if (type === 'activity-quiz') {
            const { pointIcon = "assets/star.svg" } = options;
            const percentage = maxStep > 0 ? ((currentStep - 1) / maxStep) * 100 : 0;
            html = `
            <section class="header-bar flex row justify-between items-center py-0 gap-12">
                <div class="flex row gap-7 justify-start width-auto">
                    <div class="top-button btn-cancel" onclick="${backAction}">
                        <i data-lucide="arrow-left"></i>
                        <span>${backLabel}</span>
                    </div>
                </div>
                <div class="progress-bar grow padding-0">
                    <div class="bar">
                        <div id="activity-progress" class="completed" data-max="${maxStep}" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div id="point-indicator" class="flex row width-auto">
                    <span id="point-icon">
                        <img src="${pointIcon}" alt="Poin">
                    </span>
                    <span id="point-count">
                        ${window.score || 0}
                    </span>
                </div>
            </section>
            `;
        }

        headerEl.innerHTML = html;
        lucide.createIcons();
    },

    // Render Footer secara dinamis
    renderFooter(type, options = {}) {
        const footerEl = document.getElementById('footer');
        if (!footerEl) return;

        let html = '';

        if (type === 'empty') {
            html = '';
            footerEl.innerHTML = html;
            return;
        }

        // Default Values
        const {
            title = "",
            actionLabel = "Lanjut",
            actionFn = "goNext()",
            btnClass = "act-neutral" // act-study, act-listen, etc.
        } = options;

        if (type === 'activity') {
            html = `
            <section class="footer-bar flex row justify-between items-center py-0">
                <div class="flex row gap-7 justify-start shrink width-auto">
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button class="act-neutral btntext btn-click ico-sm" onclick="openBackHome()">
                            <i data-lucide="home"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Menu Utama</span>
                    </div>
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button class="act-neutral btntext btn-click ico-sm" onclick="openSettings()">
                            <i data-lucide="settings"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Pengaturan</span>
                    </div>
                </div>
                <div class="flex row gap-7 justify-center text-center text-slate-700 text-size-9 line-height-10">
                    <span>${title}</span>
                </div>
                <div class="flex row gap-7 justify-end shrink width-auto">
                    <button id="btn-action" class="${btnClass} btn-click" onclick="${actionFn}">
                        ${actionLabel}
                    </button>
                </div>
            </section>
            `;
        } else if (type === 'activity-nav') {
            html = `
            <section class="footer-bar flex row justify-between items-center py-0">
                <div class="flex row gap-7 justify-start shrink width-auto">
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button class="act-neutral btntext btn-click ico-sm" onclick="openBackHome()">
                            <i data-lucide="home"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Menu Utama</span>
                    </div>
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button class="act-neutral btntext btn-click ico-sm" onclick="openSettings()">
                            <i data-lucide="settings"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Pengaturan</span>
                    </div>
                </div>
                <div class="flex row gap-7 justify-center text-center text-slate-700 text-size-9 line-height-10">
                    <span>${title}</span>
                </div>
                <div class="flex row gap-7 justify-end shrink width-auto">
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button id="btn-reset" class="act-neutral btntext btn-click ico-sm" onclick="// defined in scene">
                            <i data-lucide="rotate-ccw"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Putar Ulang</span>
                    </div>
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button id="btn-prev" class="act-neutral btntext btn-click ico-sm" onclick="// defined in scene">
                            <i data-lucide="chevron-left"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Sebelumnya</span>
                    </div>
                    <div class="btntext-wrapper flex column text-center gap-5 justify-center items-center">
                        <button id="btn-next" class="act-neutral btntext btn-click ico-sm" onclick="// defined in scene">
                            <i data-lucide="chevron-right"></i>
                        </button>
                        <span class="text-size-6 line-height-6 weight-bold text-slate-800">Selanjutnya</span>
                    </div>
                </div>
            </section>
            `;
        }

        footerEl.innerHTML = html;
        lucide.createIcons();
        if (typeof applyAmazingTitleEffect === 'function') applyAmazingTitleEffect();
        if (typeof setupBtnSFX === 'function') setupBtnSFX();
    },

    // Update Progress Bar Only (Optimization)
    updateProgress(current, max) {
        const prog = document.getElementById('activity-progress');
        const step = document.getElementById('step');
        const steps = document.getElementById('steps');
        const point = document.getElementById('point-count');

        if (prog) {
            let currentMax = max;
            if (currentMax === undefined) {
                currentMax = parseFloat(prog.dataset.max) || 100;
            } else {
                prog.dataset.max = currentMax;
            }

            // Check if it's slim (1-based) or not (0-based)
            const isSlim = document.querySelector('.header-bar.slim') !== null;

            let percentage = 0;
            if (isSlim) {
                // Formula: (Current - 1) / (Max - 2)
                // Maps Step 1 (Page 2) to 0% and Step 8 (Page 9) to 100%
                const effectiveMax = Math.max(1, currentMax - 2);
                percentage = currentMax > 0 ? (Math.max(0, current - 1) / effectiveMax) * 100 : 0;
            } else {
                percentage = currentMax > 0 ? ((current - 1) / currentMax) * 100 : 0;
            }

            prog.style.width = `${Math.min(100, percentage)}%`;
        }
        if (step) step.textContent = current;
        if (steps && max !== undefined) steps.textContent = max;
        if (point) point.textContent = window.score || 0;
    },

    // Helper untuk update state tombol action
    setActionButton(enabled) {
        const btn = document.getElementById('btn-action');
        if (!btn) return;

        if (enabled) {
            btn.classList.remove('disabled');
        } else {
            btn.classList.add('disabled');
        }
    },

    // Progress Logic
    initProgress(max, current) {
        window.progressState = { max, current };
        this.updateProgress(current, max);
    },

    increaseProgress() {
        if (!window.progressState) return;
        window.progressState.current = Math.min(window.progressState.current + 1, window.progressState.max);
        this.updateProgress(window.progressState.current, window.progressState.max);
    }
};

// Global Alias
window.loadHeader = (type, opts) => window.UIManager.renderHeader(type, opts);
window.loadFooter = (type, opts) => window.UIManager.renderFooter(type, opts);
window.progressUpdate = (c, m) => window.UIManager.updateProgress(c, m);
window.progressInit = (m, c) => window.UIManager.initProgress(m, c);
window.progressIncrease = () => window.UIManager.increaseProgress();
