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

const canvas = document.getElementById('field-canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = 600;
const canvasHeight = 400;

const dpr = window.devicePixelRatio || 1;

canvas.width = canvasWidth * dpr;
canvas.height = canvasHeight * dpr;

ctx.scale(dpr, dpr);

function convertX(x) {
    const scale = 50;
    return x * scale + canvas.width / 2;
}

function convertY(y) {
    const scale = 50;
    return canvas.height / 2 - y * scale;
}

ctx.beginPath();
ctx.arc(convertX(0), convertY(0), 20, 0, 2 * Math.PI);
ctx.fillStyle = 'red';
ctx.fill();
