let pyodide;

async function initializePyodide() {
    const status = document.getElementById("status");
    const button = document.getElementById("run-button");

    try {
        status.textContent = 'Loading Pyodide...';

        pyodide = await loadPyodide();

        const response = await fetch('physics.py');

        if(!response.ok) {
            throw new Error(`Failed to fetch physics.py: ${response.status} ${response.statusText}`);
        }

        const pythonCode = await response.text();

        await pyodide.runPythonAsync(pythonCode);

        status.textContent = "Python is ready!";
        button.disabled = false;
    } catch (error) {
        console.error('Error initializing Pyodide:', error);
        status.textContent = 'Error loading Pyodide. Check console for details.';
    }   

}

document.getElementById("run-button").addEventListener("click", () => {
    const result = pyodide.runPython("printInitialized()");
    document.getElementById("output").textContent = "Python returned: " + result;
});

initializePyodide();


function getPalette() {
    const styles = getComputedStyle(document.documentElement);

    return {
        text: styles.getPropertyValue("--text").trim(),
        grid: styles.getPropertyValue("--grid").trim(),
        axis: styles.getPropertyValue("--axis").trim(),
        positive: styles.getPropertyValue("--positive").trim(),
        positiveBd: styles.getPropertyValue("--positive-bd").trim(),
        negative: styles.getPropertyValue("--negative").trim(),
        negativeBd: styles.getPropertyValue("--negative-bd").trim()
    };
}

const addPositiveChargeButton = document.getElementById("add-charge-positive");
const addNegativeChargeButton = document.getElementById("add-charge-negative");

const themeButton = document.getElementById("theme-toggle");
const gridButton = document.getElementById("grid-toggle");
let gridVisible = true;

addPositiveChargeButton.addEventListener("click", () => {
    charges.push({ x: 0, y: 0, positive: true });
    drawScene();
});

addNegativeChargeButton.addEventListener("click", () => {
    charges.push({ x: 0, y: 0, positive: false });
    drawScene();
});


gridButton.addEventListener("click", () => {
    gridVisible = !gridVisible;
    gridButton.textContent = gridVisible ? "Hide grid" : "Show grid";
    drawScene();
});

themeButton.addEventListener("click", () => {
    const root = document.documentElement;

    const isDark = root.dataset.theme !== "light";

    root.dataset.theme = isDark ? "light" : "dark";


    drawScene();
});

const canvas = document.getElementById("field-canvas");
const ctx = canvas.getContext("2d");


const scale = 50;
let canvasWidth = 600;
let canvasHeight = 400;

let draggedCharge = null;
const chargeRadius = 20;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvasWidth = rect.width;
    canvasHeight = rect.height;

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawScene();
}
function convertX(x) {
    return x * scale + canvasWidth / 2;
}

function convertY(y) {
    return canvasHeight / 2 - y * scale;
}

const charges = [
    { x: -2, y: 1, charge: 1e-6 },
    { x: 1, y: -1, charge: -1e-6 }
];

function isPositive(charge) {
    return charge.charge > 0;
}

function drawScene() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if(gridVisible) {
        drawGrid();
        drawAxis();
    }
    for (const charge of charges) {
    drawCharge(charge.x, charge.y, isPositive(charge));
}
}

resizeCanvas();

const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(canvas);


function drawGrid() {
    const palette = getPalette();

    ctx.beginPath();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;

    for (let x = canvasWidth / 2 % scale; x <= canvasWidth; x += scale) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
    }

    for (let y = canvasHeight / 2 % scale; y <= canvasHeight; y += scale) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
    }

    ctx.stroke();
}


function drawAxis() {
    const palette = getPalette();

    ctx.beginPath();
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 2;

    ctx.moveTo(0, convertY(0));
    ctx.lineTo(canvasWidth, convertY(0));

    ctx.moveTo(convertX(0), 0);
    ctx.lineTo(convertX(0), canvasHeight);

    ctx.stroke();
}


function drawCharge(x, y, isPositive) {
    const palette = getPalette();

    const centerX = convertX(x);
    const centerY = convertY(y);
    const radius = chargeRadius;

    ctx.beginPath();
    ctx.arc(convertX(x), convertY(y), radius, 0, 2 * Math.PI);
    ctx.fillStyle = isPositive
        ? palette.positive
        : palette.negative;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle  = isPositive
        ? palette.positiveBd
        : palette.negativeBd;
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isPositive ? "+" : "−", centerX, centerY);
}

function pointerToPhysics(event) {
    const rect = canvas.getBoundingClientRect();

    const pixelX = event.clientX - rect.left; 
    const pixelY = event.clientY - rect.top;

    return {
        x: (pixelX - canvasWidth/2)/scale,
        y: (canvasHeight/2 -pixelY)/scale
    };
}

canvas.addEventListener("pointerdown", (event) => {
    const pointer = pointerToPhysics(event);

    for (let i = charges.length - 1; i >= 0; i--) {
        const charge = charges[i];

        const dx = pointer.x - charge.x;
        const dy = pointer.y - charge.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= chargeRadius / scale) {
            draggedCharge = charge;
            canvas.setPointerCapture(event.pointerId);
            break;
        }
    }
});

canvas.addEventListener("pointermove", (event) => {
    if (draggedCharge === null) return;

    const pointer = pointerToPhysics(event);

    draggedCharge.x = pointer.x;
    draggedCharge.y = pointer.y;

    drawScene();
});

canvas.addEventListener("pointerup", () => {
    draggedCharge = null;
});

canvas.addEventListener("pointercancel", () => {
    draggedCharge = null;
});

function calculateElectricField(charge,chargeX,chargeY,x,y) {
    const k = 8.99 * 10 ** 9;
    const dx = x-chargeX;
    const dy = y-chargeY;
    const r = Math.sqrt(dx**2 + dy**2);
    if(r === 0){
        return {x: 0, y: 0};
    }
    const fieldX = k * charge * dx / r**3;
    const fieldY = k * charge * dy / r**3;
    return {x: fieldX, y: fieldY};
}

function calculateTotalElectricField(charges, x, y) {
    let totalFieldX = 0;
    let totalFieldY = 0;
    for (let i = 0; i < charges.length; i++) {
        const field = calculateElectricField(
            charges[i].charge, charges[i].x, charges[i].y,x,y);
        totalFieldX += field.x;
        totalFieldY += field.y;
    }
    return {x: totalFieldX, y: totalFieldY};
}

function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    if(magnitude === 0){
        return {x: 0, y: 0};
    }
    const dx = vector.x / magnitude;
    const dy = vector.y / magnitude;

    return {x: dx, y: dy};
}

function traceFieldLine(startX, startY){
    const points = [];

    let x = startX;
    let y = startY;

    const stepSize = 0.05;
    const maxSteps = 1000;

    for (let i = 0; i < maxSteps; i++) {
        const field = calculateTotalElectricField(charges, x, y);
        const direction = normalizeVector(field);
        if(field.x === 0 && field.y === 0){
            break;
        }
        if(direction.x === 0 && direction.y === 0){
            break;
        }
        points.push({x:x,y:y});
        x += direction.x * stepSize;
        y += direction.y * stepSize;
    }
    return points;
}