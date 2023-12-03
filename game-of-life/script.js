// Global vars

var side = 30; // Side length in px
var xDim; // Horizontal grid dim
var yDim; // Vertical grid dim

// Compute canvas size
var canvasWidth;
var canvasHeight;

var mat; // State matrix

var canvas = document.getElementById("canvas"); // Canvas
var ctx = canvas.getContext("2d"); // Context

// Functions

function drawRect(x, y, w, h, h1, s1, l1, h2, s2, l2) {
    // Create gradient
    let grd = ctx.createLinearGradient(x, y, x + w, y + h);

    // Gradient colors for box
    let firstColor = `hsl(${h1},${s1}%,${l1}%)`;
    let secondColor = `hsl(${h2},${s2}%,${l2}%)`;

    // Add colors to the gradient
    grd.addColorStop(0, firstColor);
    grd.addColorStop(1, secondColor);

    // Fill box with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, w, h);
}

function drawSquare(i, j) {
    h = getRandomInt(360);
    drawRect(i * side, j * side, side, side, h, 80, 60, h - 50, 90, 60);
}

function drawSquareIntensity(i, j, intensity) {
    h = getRandomInt(360);
    drawRect(i * side, j * side, side, side, h, 80, 60 * intensity, h - 50, 90, 60 * intensity);
}

function clearSquare(i, j) {
    drawRect(i * side, j * side, side, side, 360, 100, 0, 360, 100, 0);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function flip(i, j) {
    mat[i][j] = 1 - mat[i][j];
}

function matGet(i, j) {
    if (i >= 0 && i < xDim && j >= 0 && j < yDim) {
        return mat[i][j];
    }
    else return 0;
}

function numNeighbors(i, j) {
    let numNeighbors = 0;
    for (iParam = -1; iParam <= 1; iParam++) {
        for (jParam = -1; jParam <= 1; jParam++) {
            if (!(iParam == 0 && jParam == 0)) {
                numNeighbors += matGet(i + iParam, j + jParam);
            }
        }
    }

    return numNeighbors;
}

// Possible update rules
var stdRule = [[0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0]];
var mazeRule = [[0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0]];
var badRule = [[0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0]];
var goodRule = [[0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0, 0]];

function rule(i, j) {
    num = numNeighbors(i, j);
    alive = mat[i][j];

    return stdRule[alive][num]; // Standard way

    // Balance good and bad rules
    /*
    if (Math.random() > 0.695) {
        return badRule[alive][num];
    }
    else return goodRule[alive][num];*/
}

// Update with rule
function update() {
    // Make copy of mat
    let newMat = Array(xDim).fill(0).map(x => Array(yDim).fill(0));
    for (i = 0; i < xDim; i++) {
        for (j = 0; j < yDim; j++) {
            newMat[i][j] = rule(i, j);
        }
    }

    // Update display
    for (i = 0; i < xDim; i++) {
        for (j = 0; j < yDim; j++) {
            // Only draw if something changed
            if (mat[i][j] != newMat[i][j]) {
                drawSquareIntensity(i, j, newMat[i][j]);
            }
        }
    }

    // Update mat
    for (i = 0; i < xDim; i++) {
        for (j = 0; j < yDim; j++) {
            mat[i][j] = newMat[i][j];
        }
    }
}

function isValidIndex(i, j) {
    return (i >= 0 && i < xDim && j >= 0 && j < yDim);
}

var lastPressed = [-1, -1]; // Last square pressed

// Randomly initialize matrix
function randomize() {
    for (let i = 0; i < xDim; i++) {
        for (let j = 0; j < yDim; j++) {
            mat[i][j] = getRandomInt(2);
            drawSquareIntensity(i, j, mat[i][j]);
        }
    }
}

// Clear game
function clear() {
    for (let i = 0; i < xDim; i++) {
        for (let j = 0; j < yDim; j++) {
            mat[i][j] = 0;
            drawSquareIntensity(i, j, mat[i][j]);
        }
    }
}

// Initialize canvas with a glider
//  ##
// # #
//   #
function glider() {   
    clear();
    gliderIdc = [
        [1, yDim - 3],
        [2, yDim - 4],
        [3, yDim - 4],
        [3, yDim - 3],
        [3, yDim - 2]
    ];

    for (let i = 0; i < gliderIdc.length; i++) {
        let xIdx = gliderIdc[i][0];
        let yIdx = gliderIdc[i][1];

        flip(xIdx, yIdx);
        drawSquareIntensity(xIdx, yIdx, 1);
    }
}

function actOnCanvas(event) {
    // Get where client is on the canvas
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let i = Math.floor(x / side);
    let j = Math.floor(y / side);
    
    if (isValidIndex(i, j) && !(i == lastPressed[0] && j == lastPressed[1])) {
        // Save this press
        lastPressed[0] = i;
        lastPressed[1] = j;
        flip(i, j);
        drawSquareIntensity(i, j, mat[i][j]);
        
        /*
        if (mat[i][j] == 0) {
            clearSquare(i, j);
        }
        else {
            drawSquare(i, j);
        }*/
    }
}

// Run update every interval
setInterval(function(){ 
    update();
}, 250);

// Run when document first loads
$(document).ready(function() {
    // Get screen height and width and calculate matrix size, assuming body
    // margin is 10.
    xDim = ~~((window.innerWidth - 20) / side);
    yDim = ~~((window.innerHeight - 20) / side);

    // Compute canvas size
    canvasWidth = xDim * side;
    canvasHeight = yDim * side;

    mat = Array(xDim).fill(0).map(x => Array(yDim).fill(0)); // State matrix

    // Keep track of whether mouse pressed
    var mouseDown = false;
    document.body.onmousedown = function() { 
        mouseDown = true;
    }
    document.body.onmouseup = function() {
        mouseDown = false;
        lastPressed = [-1, -1];
    }
    
    // Adjust canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    $("#canvas").css("width", canvasWidth);
    $("#canvas").css("height", canvasHeight);

    // Initialize canvas with a glider pn start
    glider();

    // Detect interaction with canvas
    $(document).mousedown(function(event) {
        actOnCanvas(event);
    });

    $(document).on("mousemove", function(event) {
        // Check if mouse is over canvas
        if ($("#canvas:hover").length != 0) {
            if (mouseDown) {
                actOnCanvas(event);
            }
        }
    });

    // Press 'r' for random, 'g' for glider, 'c' to clear
    console.log("Press 'r' for random initialization, 'g' for glider, and 'c' to clear grid.");
    $(document).on("keypress", function(e) {
        // 'r' or 'R'
        if (e.keyCode == 114 || e.keyCode == 82) {
            randomize();
        }
        // 'g' or 'G'
        else if (e.keyCode == 103 || e.keyCode == 71) {
            glider();
        }
        // 'c' or 'C'
        else if (e.keyCode == 99 || e.keyCode == 67) {
            clear();
        }
    });
});