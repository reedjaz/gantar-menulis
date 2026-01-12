try {
    console.log("Writing Demo Script Started");

    // Dynamic Popup Creation
    function createPopups() {
        if (document.getElementById('confirm-clear-popup')) return;

        let buffer = document.querySelector('.popup-buffer');
        if (!buffer) {
            buffer = document.createElement('div');
            buffer.className = 'popup-buffer';
            document.body.appendChild(buffer);
        }

        const html = `
        <!-- Custom Confirm Popup (Clear Canvas) -->
        <div id="confirm-clear-popup" class="popup hidden">
            <div class="popup-overlay" onclick="closeConfirmClear()"></div>
            <div class="popup-content-wrapper">
                <div class="close-btn btn-cancel" onclick="closeConfirmClear()"><i data-lucide="x"></i></div>
                <div class="popup-content exit-popup flex column gap-10">
                    <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">Perhatian</h2>
                    <p class="flex full gap-6 justify-center items-center text-center weight-bold text-size-9 line-height-10 pb-5">
                        Apakah kamu yakin ingin menghapus semua tulisan tanganmu?</p>
                    <div class="flex row gap-4 justify-center mt-4">
                        <button class="full act-wrong btn-cancel" onclick="confirmClearAction()">Ya</button>
                        <button class="full act-neutral btn-click" onclick="closeConfirmClear()">Tidak</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Custom Confirm Popup (Clear Text) -->
        <div id="confirm-text-popup" class="popup hidden">
            <div class="popup-overlay" onclick="closeConfirmText()"></div>
            <div class="popup-content-wrapper">
                <div class="close-btn btn-cancel" onclick="closeConfirmText()"><i data-lucide="x"></i></div>
                <div class="popup-content exit-popup flex column gap-10">
                    <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">Perhatian</h2>
                    <p class="flex full gap-6 justify-center items-center text-center weight-bold text-size-9 line-height-10 pb-5">
                        Apakah kamu yakin ingin menghapus semua tulisanmu yang sudah diketik?</p>
                    <div class="flex row gap-4 justify-center mt-4">
                        <button class="full act-wrong btn-cancel" onclick="confirmClearTextAction()">Ya</button>
                        <button class="full act-neutral btn-click" onclick="closeConfirmText()">Tidak</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Custom Popup (Mic Permission) -->
        <div id="confirm-mic-popup" class="popup hidden">
            <div class="popup-overlay" onclick="closeMicPopup()"></div>
            <div class="popup-content-wrapper">
                <div class="close-btn btn-cancel" onclick="closeMicPopup()"><i data-lucide="x"></i></div>
                <div class="popup-content exit-popup flex column gap-10">
                    <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">Izin Diperlukan</h2>
                    <p class="flex full gap-6 justify-center items-center text-center weight-bold text-size-9 line-height-10 pb-5">
                        Mohon berikan izin akses mikrofon pada browser Anda untuk menggunakan fitur dikte suara.
                    </p>
                    <div class="flex row gap-4 justify-center mt-4">
                        <button class="full act-study btn-click" onclick="grantMicPermission()">OK</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        buffer.innerHTML += html;
        if (window.lucide) lucide.createIcons({ root: buffer });
    }
    createPopups();

    // Header
    loadHeader('activity', {
        maxStep: 9,
        currentStep: 0,
        backAction: "if(window.destroyKeyboard) destroyKeyboard(); loadSceneTrans('title', 'both', 'slide-right')",
        backLabel: "Kembali"
    });

    // Footer
    loadFooter('activity', {
        title: "<b>Aktivitas 1</b> Pengantar Pembelajaran",
        actionLabel: "Lanjut Menggambar",
        actionFn: "console.log('Next')",
        btnClass: "act-study"
    });

    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    const textInput = document.getElementById('text-input');
    const container = document.getElementById('box-area');

    let isDrawing = false;
    let currentColor = '#000000'; // Set default explicit
    let currentMode = 'draw';
    let currentTool = 'pencil'; // Initialize currentTool
    let lastPoint = { x: 0, y: 0 };

    // Set initial badge color
    setTimeout(() => {
        const badge = document.getElementById('color-badge');
        if (badge) badge.style.backgroundColor = currentColor;
    }, 100);

    // --- UNDO / REDO HISTORY ---
    let history = [];
    let historyStep = -1;
    const MAX_HISTORY = 20;

    function saveState() {
        historyStep++;
        if (historyStep < history.length) {
            history.length = historyStep;
        }
        if (history.length >= MAX_HISTORY) {
            history.shift();
            historyStep--;
        }
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        updateUndoRedoUI();
        updatePlaceholder();
    }

    window.undo = function () {
        if (historyStep > 0) {
            historyStep--;
            if (historyStep === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.putImageData(history[historyStep], 0, 0);
            }

            if (historyStep === 0 && history[0]) {
                ctx.putImageData(history[0], 0, 0);
            }

            updateUndoRedoUI();
            updatePlaceholder();
        }
    }

    window.redo = function () {
        if (historyStep < history.length - 1) {
            historyStep++;
            ctx.putImageData(history[historyStep], 0, 0);
            updateUndoRedoUI();
            updatePlaceholder();
        }
    }

    function updateUndoRedoUI() {
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');
        if (!btnUndo || !btnRedo) return;

        btnUndo.style.opacity = historyStep > 0 ? '1' : '0.5';
        btnUndo.style.pointerEvents = historyStep > 0 ? 'auto' : 'none';

        btnRedo.style.opacity = historyStep < history.length - 1 ? '1' : '0.5';
        btnRedo.style.pointerEvents = historyStep < history.length - 1 ? 'auto' : 'none';

        updatePlaceholder();
    }

    // --- KEYBOARD INTEG ---
    if (window.initVirtualKeyboard) {
        window.initVirtualKeyboard();
    }

    // FORCE INITIAL UI STATE
    // FORCE INITIAL UI STATE & FADE IN
    setTimeout(() => {
        setMode('draw');
        // Initial Fade In
        const area = document.querySelector('.writing-area');
        if (area) area.classList.add('fade-in');
    }, 100);

    // --- CANVAS & RESIZE ---
    function updatePlaceholder() {
        const placeholder = document.getElementById('handwriting-placeholder');
        if (!placeholder) return;

        if (historyStep <= 0) {
            placeholder.style.opacity = '1';
        } else {
            placeholder.style.opacity = '0';
        }
    }

    function resizeCanvas() {
        if (!container) return;
        const rect = container.getBoundingClientRect();

        if (canvas.width !== rect.width || canvas.height !== rect.height) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            if (canvas.width > 0 && canvas.height > 0) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            canvas.width = rect.width;
            canvas.height = rect.height;

            if (tempCanvas.width > 0 && tempCanvas.height > 0) {
                ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
            }
        }

        if (history.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const blankData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            history.push(blankData);
            historyStep = 0;
            updateUndoRedoUI();
            updatePlaceholder();
        }

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Responsive Line Width (Base 5 for pencil)
        const baseSize = currentTool === 'eraser' ? 20 : 5;
        ctx.lineWidth = getResponsiveLineWidth(baseSize);

        if (ctx.globalCompositeOperation !== 'destination-out') {
            ctx.strokeStyle = currentColor;
        }
    }

    resizeCanvas();
    setTimeout(resizeCanvas, 100);
    setTimeout(resizeCanvas, 500);
    setTimeout(resizeCanvas, 1000);
    window.addEventListener('resize', resizeCanvas);


    // --- TEXT INPUT LIMIT (4 Lines) ---
    if (textInput) {
        textInput.dataset.lastValid = textInput.value || "";

        textInput.addEventListener('input', (e) => {
            // Check overflow
            // Using scrollHeight > clientHeight to detect if content exceeds container
            if (textInput.scrollHeight > textInput.clientHeight) {
                // Revert to last valid state
                textInput.value = textInput.dataset.lastValid;
            } else {
                // Update valid state
                textInput.dataset.lastValid = textInput.value;
            }
        });
    }


    // --- ANIMATION HELPERS ---
    function togglePopover(id) {
        const el = document.getElementById(id);
        if (!el) return;

        // If currently hidden or exiting, enter
        if (el.classList.contains('hidden') || el.classList.contains('exit')) {
            el.classList.remove('hidden');
            el.classList.remove('exit');
            void el.offsetWidth; // trigger reflow
            el.classList.add('enter');
        } else {
            // Exit
            el.classList.remove('enter');
            el.classList.add('exit');
            setTimeout(() => {
                if (el.classList.contains('exit')) {
                    el.classList.add('hidden');
                    el.classList.remove('exit');
                }
            }, 300); // match css transition
        }
    }

    function hidePopover(id) {
        const el = document.getElementById(id);
        if (!el || el.classList.contains('hidden')) return;

        el.classList.remove('enter');
        el.classList.add('exit');
        setTimeout(() => {
            if (el.classList.contains('exit')) {
                el.classList.add('hidden');
                el.classList.remove('exit');
            }
        }, 300);
    }

    // --- MODE SWITCHING & TOOLS ---

    // Auto-hide keyboard Listener
    document.addEventListener('mousedown', (e) => {
        if (window.checkKeyboardAutoHide) {
            window.checkKeyboardAutoHide(e, currentMode);
        }

        // Auto-hide popovers if clicking outside
        ['tools-popover', 'color-popover'].forEach(pid => {
            const p = document.getElementById(pid);
            if (p && !p.classList.contains('hidden') && p.classList.contains('enter')) {
                // Check triggers
                const triggerId = pid === 'tools-popover' ? 'btn-mode-draw' : 'btn-color';
                const trigger = document.getElementById(triggerId);

                if (!p.contains(e.target) && (!trigger || !trigger.contains(e.target))) {
                    hidePopover(pid);
                }
            }
        });
    });

    window.handleClickDraw = function () {
        if (currentMode === 'draw') {
            togglePopover('tools-popover');
            hidePopover('color-popover');
        } else {
            setMode('draw');
        }
    }

    window.handleClickKeyboard = function () {
        if (currentMode === 'keyboard') {
            if (window.setIsKeyboardVisible && window.getIsKeyboardVisible) {
                window.setIsKeyboardVisible(!window.getIsKeyboardVisible());
                if (window.updateKeyboardAnim) window.updateKeyboardAnim(currentMode);
            }
        } else {
            setMode('keyboard');
        }
    }

    // Color Picker Logic
    const colors = [
        '#000000', '#EF4444', '#F97316', '#EAB308',
        '#22C55E', '#3B82F6', '#A855F7', '#ffffff'
    ];

    window.toggleColorPicker = function () {
        const pop = document.getElementById('color-popover');
        if (!pop) return;

        if (pop.innerHTML.trim() === '') {
            colors.forEach(c => {
                const dot = document.createElement('div');
                dot.className = 'color-dot';
                dot.style.backgroundColor = c;
                if (c === '#ffffff') dot.style.border = '1px solid #cbd5e1';

                if (c === currentColor) dot.classList.add('selected');

                dot.onclick = () => {
                    currentColor = c;
                    Array.from(pop.children).forEach(child => child.classList.remove('selected'));
                    dot.classList.add('selected');

                    if (currentTool === 'pencil') {
                        ctx.strokeStyle = currentColor;
                    }

                    // Update Badge Color
                    const btnColor = document.getElementById('btn-color');
                    if (btnColor) {
                        btnColor.style.setProperty('--active-color', currentColor);
                        // Hide badge if white? Maybe add border? CSS handles border.
                    }
                };
                pop.appendChild(dot);
            });
        }

        // Initial Badge Set (if not set)
        const btnColor = document.getElementById('btn-color');
        if (btnColor && !btnColor.style.getPropertyValue('--active-color')) {
            btnColor.style.setProperty('--active-color', currentColor);
        }

        togglePopover('color-popover');
        hidePopover('tools-popover');
    }

    window.setMode = function (mode) {
        currentMode = mode;
        const btnDr = document.getElementById('btn-mode-draw');
        //const tools = document.getElementById('tools-popover'); // handled by helpers
        //const btnColor = document.getElementById('btn-color'); // Using wrapper now
        const colorWrapper = document.getElementById('color-wrapper');
        //const popColor = document.getElementById('color-popover');
        const undoRedoGroup = document.getElementById('undo-redo-group');
        const placeholder = document.getElementById('handwriting-placeholder');

        hidePopover('tools-popover');
        hidePopover('color-popover');

        if (mode === 'keyboard') {
            if (undoRedoGroup) undoRedoGroup.classList.add('hidden');

            btnDr.classList.remove('act-study', 'active');
            btnDr.classList.add('act-neutral');

            textInput.style.zIndex = '30';
            textInput.style.pointerEvents = 'auto';
            textInput.style.opacity = '1';

            canvas.style.zIndex = '20';
            canvas.style.pointerEvents = 'none';
            canvas.style.opacity = '0';

            if (placeholder) placeholder.style.display = 'none';

            // Hide Color Button Wrapper
            if (colorWrapper) colorWrapper.classList.add('hidden');

            if (window.setIsKeyboardVisible) window.setIsKeyboardVisible(true);
            if (window.updateKeyboardAnim) window.updateKeyboardAnim(currentMode);

        } else {
            if (undoRedoGroup) undoRedoGroup.classList.remove('hidden');

            btnDr.classList.remove('act-neutral');
            btnDr.classList.add('act-study', 'active');

            canvas.style.zIndex = '30';
            canvas.style.pointerEvents = 'auto';
            canvas.style.opacity = '1';

            textInput.style.zIndex = '20';
            textInput.style.pointerEvents = 'none';
            textInput.style.opacity = '0';

            if (placeholder) placeholder.style.display = 'block';

            if (window.setIsKeyboardVisible) window.setIsKeyboardVisible(false);
            if (window.updateKeyboardAnim) window.updateKeyboardAnim(currentMode);

            // Show Color Button Wrapper
            if (colorWrapper) colorWrapper.classList.remove('hidden');

            resizeCanvas();
        }
    };

    window.setTool = function (tool) {
        currentTool = tool; // Added to track current tool
        const btnPencil = document.getElementById('btn-tool-pencil');
        const btnEraser = document.getElementById('btn-tool-eraser');

        if (tool === 'pencil') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = getResponsiveLineWidth(5);

            if (btnPencil) {
                btnPencil.classList.remove('act-neutral');
                btnPencil.classList.add('act-study');
            }
            if (btnEraser) {
                btnEraser.classList.remove('act-study');
                btnEraser.classList.add('act-neutral');
            }

        } else if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = getResponsiveLineWidth(20);

            if (btnPencil) {
                btnPencil.classList.remove('act-study');
                btnPencil.classList.add('act-neutral');
            }
            if (btnEraser) {
                btnEraser.classList.remove('act-neutral');
                btnEraser.classList.add('act-study');
            }
        }

        // Update Main Button Icon
        const btnDraw = document.getElementById('btn-mode-draw');
        if (btnDraw && window.lucide) {
            // We need to re-render the icon
            // Easiest is to set innerHTML and call createIcons on the element
            const iconName = tool === 'eraser' ? 'eraser' : 'pencil';
            btnDraw.innerHTML = `<i data-lucide="${iconName}"></i>`;
            lucide.createIcons({ root: btnDraw });
        }

        hidePopover('tools-popover');
    }

    // --- POPUPS ---
    window.openConfirmClear = function () {
        hidePopover('tools-popover');
        const popup = document.getElementById('confirm-clear-popup');
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('show');
    }

    window.closeConfirmClear = function () {
        const popup = document.getElementById('confirm-clear-popup');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }

    window.confirmClearAction = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Reset History
        history = [];
        historyStep = -1;

        // Save blank state as initial
        const blankData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history.push(blankData);
        historyStep = 0;

        closeConfirmClear();
        updateUndoRedoUI();
        updatePlaceholder();
    }

    window.openConfirmText = function () {
        const popup = document.getElementById('confirm-text-popup');
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('show');
    }

    window.closeConfirmText = function () {
        const popup = document.getElementById('confirm-text-popup');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }

    window.confirmClearTextAction = function () {
        textInput.value = '';
        closeConfirmText();
    }

    window.openMicPopup = function () {
        const popup = document.getElementById('confirm-mic-popup');
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('show');
    }

    window.closeMicPopup = function () {
        const popup = document.getElementById('confirm-mic-popup');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }

    window.grantMicPermission = function () {
        window.closeMicPopup();
        if (window.triggerMicFromPopup) {
            window.triggerMicFromPopup();
        }
    }

    // --- DRAWING ---
    function getPoint(e) {
        const rect = canvas.getBoundingClientRect();
        let cx = e.clientX;
        let cy = e.clientY;
        if (e.touches && e.touches.length > 0) {
            cx = e.touches[0].clientX;
            cy = e.touches[0].clientY;
        }
        return { x: cx - rect.left, y: cy - rect.top };
    }

    function startDraw(e) {
        if (currentMode !== 'draw') return;
        isDrawing = true;

        const placeholder = document.getElementById('handwriting-placeholder');
        if (placeholder) placeholder.style.opacity = '0';

        lastPoint = getPoint(e);
        ctx.beginPath();
        if (ctx.globalCompositeOperation !== 'destination-out') {
            ctx.arc(lastPoint.x, lastPoint.y, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
        }
    }

    function moveDraw(e) {
        if (!isDrawing || currentMode !== 'draw') return;
        e.preventDefault();
        const point = getPoint(e);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        lastPoint = point;
    }

    function endDraw() {
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
            saveState();
        }
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    // Initial Icon Init if needed (though ui-manager usually handles, or keyboard script)
    if (window.lucide) lucide.createIcons();

    // --- HELPER: Responsive Line Width ---
    function getResponsiveLineWidth(baseSize) {
        if (!canvas) return baseSize;
        // Assume 1024px is the standard "base" width for the design
        const scale = canvas.width / 1024; 
        // Clamp minimum scale to avoid invisible lines on very small screens (though unlikely)
        // and keeping it reasonable.
        return Math.max(2, baseSize * scale);
    }

} catch (e) {
    console.error("Error in writing script:", e);
}
