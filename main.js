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
        grid: styles.getPropertyValue("--grid").trim(),
        axis: styles.getPropertyValue("--axis").trim(),
        positive: styles.getPropertyValue("--positive").trim(),
        negative: styles.getPropertyValue("--negative").trim()
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
    { x: -2, y: 1, positive: true },
    { x: 1, y: -1, positive: false }
];

function drawScene() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if(gridVisible) {
        drawGrid();
        drawAxis();
    }
    for (const charge of charges) {
    drawCharge(charge.x, charge.y, charge.positive);
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

    ctx.beginPath();
    ctx.arc(
        convertX(x),
        convertY(y),
        20,
        0,
        2 * Math.PI
    );

    ctx.fillStyle = isPositive
        ? palette.positive
        : palette.negative;

    ctx.fill();
}
