
// --- ONSCREEN KEYBOARD LOGIC ---
let isShiftActive = false;
let isKeyboardVisible = false;
let keyboardEl = null;
let keysContainer = null;

function initVirtualKeyboard() {
    if (document.getElementById('virtual-keyboard-overlay')) {
        document.getElementById('virtual-keyboard-overlay').remove();
    }

    keyboardEl = document.createElement('div');
    keyboardEl.id = 'virtual-keyboard-overlay';
    // Styles managed by css/onscreen-keyboard.css

    // Container for key rows
    keysContainer = document.createElement('div');
    keysContainer.className = 'vk-keys-container';
    keyboardEl.appendChild(keysContainer);

    renderKeys();

    // Utility Row (Fixed)
    const utilRow = document.createElement('div');
    utilRow.className = 'vk-utility-row';

    // Clear Button
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '<i data-lucide="trash-2" size="18"></i>';
    clearBtn.className = 'vk-btn vk-btn-red';
    clearBtn.onclick = () => {
        if (window.openConfirmText) window.openConfirmText();
        // Hide keyboard immediately
        isKeyboardVisible = false;
        updateKeyboardAnim('keyboard');
    };

    // Space Button
    const space = document.createElement('button');
    space.textContent = '';
    space.className = 'vk-btn vk-btn-space';
    space.onmousedown = (e) => { e.preventDefault(); typeChar(' '); };

    // Backspace Button
    const back = document.createElement('button');
    back.innerHTML = '<i data-lucide="delete" size="18"></i>';
    back.className = 'vk-btn vk-btn-dark';
    back.onmousedown = (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text-input');
        if (!textInput) return;

        const start = textInput.selectionStart;
        const end = textInput.selectionEnd;
        const val = textInput.value;
        if (start === end && start > 0) {
            textInput.value = val.slice(0, start - 1) + val.slice(end);
            textInput.setSelectionRange(start - 1, start - 1);
        } else {
            textInput.setRangeText("", start, end, "end");
        }
        // Trigger input event for line limit check
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
    };

    // Mic Button
    const micBtn = document.createElement('button');
    micBtn.id = 'vk-mic-btn';
    micBtn.innerHTML = '<i data-lucide="mic" size="18"></i>';
    micBtn.className = 'vk-btn vk-btn-mic';
    micBtn.onclick = (e) => {
        e.preventDefault();
        toggleSpeech();
    };

    utilRow.appendChild(clearBtn);
    utilRow.appendChild(space);
    utilRow.appendChild(back);
    utilRow.appendChild(micBtn);
    keyboardEl.appendChild(utilRow);

    // Prevent focus loss and auto-hide
    keyboardEl.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    document.body.appendChild(keyboardEl);
    if (window.lucide) lucide.createIcons({ root: keyboardEl });
}

// --- SPEECH RECOGNITION ---
let recognition = null;
let isRecording = false;
let hasPromotedPermission = false;

window.triggerMicFromPopup = function () {
    hasPromotedPermission = true;

    // Show Keyboard again if hidden
    if (!isKeyboardVisible) {
        if (window.setIsKeyboardVisible && window.setMode) {
            window.setMode('keyboard'); // Ensure mode is correct
            // Or just update visibility if mode is already correct but keyboard hidden manually
            // But relying on setMode is safer to restore UI state
        }
    }

    // Delay slightly to allow UI to settle, then start
    setTimeout(() => {
        startRecognition();
    }, 300);
}

function toggleSpeech() {
    const micBtn = document.getElementById('vk-mic-btn');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Browser tidak mendukung fitur suara.");
        return;
    }

    if (isRecording) {
        if (recognition) recognition.stop();
        return;
    }

    // Check if we need to promote permission first
    if (!hasPromotedPermission) {
        // Show Popup
        if (window.openMicPopup) window.openMicPopup();
        // Hide Keyboard
        isKeyboardVisible = false;
        if (window.updateKeyboardAnim) window.updateKeyboardAnim('keyboard');
        return;
    }

    startRecognition();
}

function startRecognition() {
    // ALWAYS CLEAR TEXT ON START
    const input = document.getElementById('text-input');
    if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (!recognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = true; // Enable real-time results
        recognition.continuous = false;

        recognition.onstart = function () {
            isRecording = true;
            const micBtn = document.getElementById('vk-mic-btn');
            if (micBtn) {
                micBtn.classList.add('recording');
                micBtn.innerHTML = '<i data-lucide="mic-off"></i>';
                if (window.lucide) lucide.createIcons({ root: micBtn });
            }
        };

        recognition.onend = function () {
            isRecording = false;
            const micBtn = document.getElementById('vk-mic-btn');
            if (micBtn) {
                micBtn.classList.remove('recording');
                micBtn.innerHTML = '<i data-lucide="mic"></i>';
                if (window.lucide) lucide.createIcons({ root: micBtn });
            }
        };

        recognition.onerror = function (event) {
            console.error("Speech Error:", event.error);
            isRecording = false;
            const micBtn = document.getElementById('vk-mic-btn');
            if (micBtn) micBtn.classList.remove('recording');

            // If strictly denied, might need to show popup again or alert
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                if (window.openMicPopup) window.openMicPopup();
            }
        };

        recognition.onresult = function (event) {
            let transcript = event.results[0][0].transcript;
            const isFinal = event.results[0].isFinal;

            if (isFinal) {
                transcript = processTranscript(transcript);
            }

            // Since we clear text on start, we just overwrite the value
            updateInput(transcript);
        };
    }

    recognition.start();
}

function updateInput(text) {
    const input = document.getElementById('text-input');
    if (!input) return;

    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger line limit check
}

function processTranscript(text) {
    if (!text) return "";
    text = text.trim();

    // Explicit Punctuation Mapping (Case Insensitive)
    // Replace "tanda tanya" -> "?"
    text = text.replace(/\s+tanda\s+tanya/gi, '?');
    text = text.replace(/\s+tanda\s+seru/gi, '!');
    text = text.replace(/\s+titik/gi, '.');
    text = text.replace(/\s+koma/gi, ',');
    text = text.replace(/\s+titik\s+dua/gi, ':');
    text = text.replace(/\s+titik\s+koma/gi, ';');

    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);

    // Heuristic Punctuation
    // List of common Indonesian question words
    const questionWords = [
        'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'bagaimana',
        'kenapa', 'apakah', 'berapa', 'bolehkah', 'bisakah', 'sudahkah'
    ];

    const firstWord = text.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

    // Check if it already has punctuation at the end (including from explicit mapping)
    const lastChar = text.charAt(text.length - 1);
    const hasPunctuation = ['.', '?', '!', ',', ';', ':'].includes(lastChar);

    if (!hasPunctuation) {
        if (questionWords.includes(firstWord)) {
            text += '?';
        } else {
            text += '.';
        }
    }

    return text;
}

function insertText(text) {
    const input = document.getElementById('text-input');
    if (!input) return;

    if (document.activeElement !== input) input.focus();

    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.setRangeText(text, start, end, "end");
    input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger line limit check
}

function typeChar(char) {
    const input = document.getElementById('text-input');
    if (!input) {
        console.error("Critical Error: text-input element not found!");
        return;
    }

    if (document.activeElement !== input) {
        input.focus();
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.setRangeText(char, start, end, "end");
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Auto-off Shift
    if (isShiftActive && char.trim() !== "") {
        isShiftActive = false;
        renderKeys();
    }
}

function toggleShift() {
    isShiftActive = !isShiftActive;
    renderKeys();
}

function renderKeys() {
    if (!keysContainer) return;
    keysContainer.innerHTML = '';

    const baseKeys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '(', ')'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '"', "'"],
        ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?', '!']
    ];

    baseKeys.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'vk-row';

        row.forEach(char => {
            if (char === 'SHIFT') {
                const shiftBtn = document.createElement('button');
                shiftBtn.id = 'btn-shift';
                shiftBtn.innerHTML = '<i data-lucide="arrow-up" size="18"></i>';
                shiftBtn.className = 'vk-btn vk-btn-wide';

                if (isShiftActive) {
                    shiftBtn.classList.add('vk-btn-blue');
                } else {
                    shiftBtn.classList.add('vk-btn-dark');
                }

                shiftBtn.onmousedown = (e) => {
                    e.preventDefault();
                    toggleShift();
                };
                rowEl.appendChild(shiftBtn);
            } else {
                const btn = document.createElement('button');
                btn.className = 'vk-btn';

                let displayChar = char;
                if (isShiftActive && char.match(/[a-z]/)) {
                    displayChar = char.toUpperCase();
                }

                btn.textContent = displayChar;
                btn.onmousedown = (e) => { e.preventDefault(); typeChar(displayChar); };
                rowEl.appendChild(btn);
            }
        });
        keysContainer.appendChild(rowEl);
    });

    if (window.lucide) {
        lucide.createIcons({ root: keysContainer });
    }
}

// Helper to animate keyboard
function updateKeyboardAnim(currentMode) {
    const btnKb = document.getElementById('btn-mode-keyboard');
    const textInput = document.getElementById('text-input');

    if (!keyboardEl) return;
    if (isKeyboardVisible) {
        keyboardEl.classList.remove('hidden-force');
        keyboardEl.classList.add('visible');

        if (currentMode === 'keyboard') {
            setTimeout(() => {
                if (isKeyboardVisible && textInput) textInput.focus();
            }, 100);
        }

        if (btnKb) {
            btnKb.classList.remove('act-neutral');
            btnKb.classList.add('act-study', 'active');
        }
    } else {
        keyboardEl.classList.remove('visible');
        keyboardEl.classList.add('hidden-force');

        if (btnKb) {
            btnKb.classList.remove('act-study', 'active');
            btnKb.classList.add('act-neutral');
        }
    }
}

// Expose functions regarding keyboard state that might be needed by main logic
window.initVirtualKeyboard = initVirtualKeyboard;
window.setIsKeyboardVisible = (val) => { isKeyboardVisible = val; };
window.getIsKeyboardVisible = () => isKeyboardVisible;
window.updateKeyboardAnim = updateKeyboardAnim;

// Auto-hide listener (Global)
document.addEventListener('mousedown', (e) => {
    // Check if we can access the current mode from writing.js (assumed globally accessible or valid context)
    // We'll trust writing.js to handle its specific mode checks or we check global vars
    // Ideally, this listener belongs in writing.js, but user asked for "keyboard logic" here.
    // However, hiding logic depends heavily on UI elements in writing.js. 
    // To be safe and respect separation: We provide a helper check, but the LISTENER should probably be in writing.js 
    // or we make this robust.

    // For now, let's keep the listener logic in writing.js to avoid circular dependency/undefined vars of UI elements.
    // BUT user asked to move keyboard JS. 
    // I will expose a 'checkKeyboardAutoHide(e)' function and call it from writing.js
});

window.checkKeyboardAutoHide = function (e, currentMode) {
    if (currentMode !== 'keyboard' || !isKeyboardVisible) return;

    const keyboard = document.getElementById('virtual-keyboard-overlay');
    const input = document.getElementById('text-input');
    const btnKb = document.getElementById('btn-mode-keyboard');
    const confirmPopup = document.getElementById('confirm-text-popup');

    if (keyboard && keyboard.contains(e.target)) return;
    if (input && input.contains(e.target)) return;
    if (btnKb && btnKb.contains(e.target)) return;
    if (confirmPopup && !confirmPopup.classList.contains('hidden') && confirmPopup.contains(e.target)) return;

    isKeyboardVisible = false;
    updateKeyboardAnim(currentMode);
}
