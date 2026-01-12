
// --- VARS & PALETTE ---
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
    <!-- Confirm Clear Popup -->
    <div id="confirm-clear-popup" class="popup hidden">
        <div class="popup-overlay" onclick="closeConfirmClear()"></div>
        <div class="popup-content-wrapper">
            <div class="close-btn btn-cancel" onclick="closeConfirmClear()"><i data-lucide="x"></i></div>
            <div class="popup-content exit-popup flex column gap-10">
                <h2 class="text-size-13 line-height-13 text-indigo-500 funny weight-bold full text-center">Perhatian</h2>
                <p class="flex full gap-6 justify-center items-center text-center weight-bold text-size-9 line-height-10 pb-5">
                    Apakah kamu yakin ingin menghapus semua gambarmu?
                </p>
                <div class="flex row gap-4 justify-center mt-4">
                    <button class="full act-wrong btn-cancel" onclick="confirmClearAction()">Ya</button>
                    <button class="full act-neutral btn-click" onclick="closeConfirmClear()">Tidak</button>
                </div>
            </div>
        </div>
    </div>
    `;

    buffer.innerHTML += html;
    if (window.lucide) lucide.createIcons({ root: buffer });
}
createPopups();

const colors = [
    '#000000', '#EF4444', '#F97316', '#EAB308',
    '#22C55E', '#3B82F6', '#A855F7', '#ffffff'
];
let currentColor = '#000000';
let currentTool = 'brush';

const paletteContainer = document.getElementById('color-palette');
if (paletteContainer) {
    colors.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'color-btn';
        btn.style.backgroundColor = c;
        if (c === '#ffffff') btn.style.border = '1px solid #e2e8f0';
        if (c === currentColor) btn.classList.add('active');

        btn.onclick = () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = c;
            if (currentTool === 'eraser') setTool('brush');
        };
        paletteContainer.appendChild(btn);
    });
}

// --- CANVAS SETUP ---
const canvas = document.getElementById('draw-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const container = document.getElementById('canvas-container');

let isDrawing = false;
let startX, startY;
let drawingSnapshot = null;

// History
let history = [];
let historyStep = -1;
const MAX_HISTORY = 20;

function saveState() {
    if (!ctx || !canvas) return;
    historyStep++;
    if (historyStep < history.length) { history.length = historyStep; }
    if (history.length >= MAX_HISTORY) { history.shift(); historyStep--; }

    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    updateUndoRedoUI();
}

window.undo = function () {
    if (historyStep > 0) {
        historyStep--;
        if (historyStep === 0) ctx.clearRect(0, 0, canvas.width, canvas.height);
        else ctx.putImageData(history[historyStep], 0, 0);

        if (historyStep === 0 && history[0]) ctx.putImageData(history[0], 0, 0);
        updateUndoRedoUI();
    }
}

window.redo = function () {
    if (historyStep < history.length - 1) {
        historyStep++;
        ctx.putImageData(history[historyStep], 0, 0);
        updateUndoRedoUI();
    }
}

function updateUndoRedoUI() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
        btnUndo.style.opacity = historyStep > 0 ? '1' : '0.5';
        btnUndo.style.pointerEvents = historyStep > 0 ? 'auto' : 'none';
    }
    if (btnRedo) {
        btnRedo.style.opacity = historyStep < history.length - 1 ? '1' : '0.5';
        btnRedo.style.pointerEvents = historyStep < history.length - 1 ? 'auto' : 'none';
    }
}

function resizeCanvas() {
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    if (canvas.width === rect.width && canvas.height === rect.height) return;

    const temp = document.createElement('canvas');
    temp.width = canvas.width; temp.height = canvas.height;
    const tCtx = temp.getContext('2d');
    if (canvas.width > 0) tCtx.drawImage(canvas, 0, 0);

    canvas.width = rect.width;
    canvas.height = rect.height;

    if (temp.width > 0) ctx.drawImage(temp, 0, 0, temp.width, temp.height, 0, 0, canvas.width, canvas.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;

    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
    }

    if (history.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history.push(blank);
        historyStep = 0;
        updateUndoRedoUI();
    }
}

if (window) {
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);
    setTimeout(resizeCanvas, 500);
}

// --- TOOLS LOGIC ---
window.setTool = function (tool) {
    currentTool = tool;

    ['tool-rect', 'tool-circle', 'tool-triangle', 'tool-brush', 'tool-eraser', 'tool-fill'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active', 'act-study');
            el.classList.add('act-neutral');
        }
    });

    const activeId = 'tool-' + tool;
    const btn = document.getElementById(activeId);
    if (btn) {
        btn.classList.remove('act-neutral');
        btn.classList.add('act-study', 'active');
    }

    if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 5;
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
    }
}

window.openConfirmClear = function () { document.getElementById('confirm-clear-popup').classList.remove('hidden'); }
window.closeConfirmClear = function () { document.getElementById('confirm-clear-popup').classList.add('hidden'); }
window.confirmClearAction = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
    closeConfirmClear();
}
window.saveCanvas = function () {
    const link = document.createElement('a');
    link.download = 'karyaku-gambar.png';
    link.href = canvas.toDataURL();
    link.click();
}

// --- DRAWING HANDLERS ---
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (!ctx) return;

    if (currentTool === 'fill') {
        e.preventDefault();
        const pos = getPos(e);
        floodFill(Math.floor(pos.x), Math.floor(pos.y), currentColor);
        saveState();
        return;
    }

    isDrawing = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
    }

    if (['rect', 'circle', 'triangle'].includes(currentTool)) {
        drawingSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);

    if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    } else {
        if (drawingSnapshot) {
            ctx.putImageData(drawingSnapshot, 0, 0);
        }

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = currentColor;

        const w = pos.x - startX;
        const h = pos.y - startY;

        if (currentTool === 'rect') {
            ctx.rect(startX, startY, w, h);
            ctx.stroke();
        } else if (currentTool === 'circle') {
            const radiusX = Math.abs(w / 2);
            const radiusY = Math.abs(h / 2);
            const centerX = startX + w / 2;
            const centerY = startY + h / 2;

            if (radiusX > 0 && radiusY > 0) {
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
        } else if (currentTool === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(startX + w / 2, startY);
            ctx.lineTo(startX, startY + h);
            ctx.lineTo(startX + w, startY + h);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    saveState();
}

// --- FLOOD FILL ALGORITHM (Stack-based) ---
function floodFill(x, y, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let r, g, b, a = 255;
    if (fillColor.startsWith('#')) {
        const hex = fillColor.substring(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    const targetColor = getPixelColor(imageData, x, y);
    if (colorsMatch(targetColor, { r, g, b, a })) return;

    const pixelStack = [[x, y]];
    const w = imageData.width;
    const h = imageData.height;

    while (pixelStack.length > 0) {
        const newPos = pixelStack.pop();
        const px = newPos[0];
        let py = newPos[1];
        let pixelPos = (py * w + px) * 4;

        while (py >= 0 && colorsMatch(getPixelColorAtPos(imageData, pixelPos), targetColor)) {
            py--;
            pixelPos -= w * 4;
        }

        pixelPos += w * 4;
        py++;
        let reachLeft = false;
        let reachRight = false;

        while (py < h && colorsMatch(getPixelColorAtPos(imageData, pixelPos), targetColor)) {
            setPixelColor(imageData, pixelPos, r, g, b, a);

            if (px > 0) {
                if (colorsMatch(getPixelColorAtPos(imageData, pixelPos - 4), targetColor)) {
                    if (!reachLeft) {
                        pixelStack.push([px - 1, py]);
                        reachLeft = true;
                    }
                } else if (reachLeft) {
                    reachLeft = false;
                }
            }

            if (px < w - 1) {
                if (colorsMatch(getPixelColorAtPos(imageData, pixelPos + 4), targetColor)) {
                    if (!reachRight) {
                        pixelStack.push([px + 1, py]);
                        reachRight = true;
                    }
                } else if (reachRight) {
                    reachRight = false;
                }
            }
            py++;
            pixelPos += w * 4;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function getPixelColorAtPos(imageData, index) {
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function setPixelColor(imageData, index, r, g, b, a) {
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}

if (canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

// Implicit init from html
if (window.lucide) lucide.createIcons();
