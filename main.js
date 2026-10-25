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
    const result = pyodide.runPython("calculate_test()");
    document.getElementById("output").textContent = "Python returned: " + result;
});

initializePyodide();


const styles = getComputedStyle(document.documentElement);
const gridColor = styles.getPropertyValue("--grid").trim();
const axisColor = styles.getPropertyValue("--axis").trim();

const themeButton = document.getElementById("theme-toggle");
const gridButton = document.getElementById("grid-toggle");
let gridVisible = true;

gridButton.addEventListener("click", () => {
    gridVisible = !gridVisible;
    gridButton.textContent = gridVisible ? "Hide grid" : "Show grid";
    drawScene();
});

themeButton.addEventListener("click", () => {
    const root = document.documentElement;

    const isDark = root.dataset.theme !== "light";

    root.dataset.theme = isDark ? "light" : "dark";

    themeButton.textContent = isDark
        ? "Switch to dark mode"
        : "Switch to light mode";

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

function drawScene() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if(gridVisible) {
        drawGrid();
        drawAxis();
    }
    ctx.beginPath();
    ctx.arc(
        convertX(0),
        convertY(0),
        30,
        0,
        2 * Math.PI
    );

    ctx.fillStyle = "#4d70bd";
    ctx.fill();
}

resizeCanvas();

const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(canvas);


function drawGrid(){
    for(let x = - canvasWidth/2; x < canvasWidth/2; x += 1){
        ctx.beginPath();
        ctx.moveTo(scale*x, 0);
        ctx.lineTo(scale*x, canvasHeight);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    for(let y = - canvasHeight/2; y < canvasHeight/2; y += 1){
        ctx.beginPath();
        ctx.moveTo(0, scale*y);
        ctx.lineTo(canvasWidth, scale*y);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}


function drawAxis() {
    ctx.beginPath();
    ctx.moveTo(0, convertY(0));
    ctx.lineTo(canvasWidth, convertY(0));
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.moveTo(convertX(0), 0);
    ctx.lineTo(convertX(0), canvasHeight);

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.stroke();
}
