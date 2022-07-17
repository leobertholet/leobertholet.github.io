/* Scripts used by this file:
 *   - math-parser.js
 *   - groups.js
 */

/* Main script for the Group Grapher. See commented out part at the bottom for
 * animation and automatic image downloading. */

// Canvas parameters
var scale = 8; // Canvas scale - determines its sharpness.
var canvas = document.getElementById("canvas"); // Get canvas
var ctx = canvas.getContext("2d"); // Get context

// Canvas width & height
var canvasWidth = 0;
var canvasHeight = 0;

/* Draws a box on the canvas at left, top with dimensions width, height and
 * color parameters h, s, l. */
function drawBoxCanvas(left, top, width, height, h, s, l) {
    // Create gradient
    let grd = ctx.createLinearGradient(left * scale, top * scale,
        (left + width) * scale, (top + height) * scale);

    // Gradient colors for box
    let firstColor = `hsl(${h}, ${s}%, ${l}%)`;
    let secondColor = `hsl(${h - 24}, ${s}%, ${l}%)`;
    // If any color is NaN, just show a white tile
    if (isNaN(h) || isNaN(s) || isNaN(l)) {
        firstColor = "white";
        secondColor = "white";
    }

    // Add colors to the gradient
    grd.addColorStop(0, firstColor);
    grd.addColorStop(1, secondColor);

    // Fill box with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(left * scale, top * scale, width * scale, height * scale);
}

/* Draws grid for the current expression in the passed in mode. Most of the work
 * is in this function. */
function drawExpressionGrid(mode) {
    let numGroups = currentGroup.length; // Number of groups in current product
    let config = createConfig(numGroups); // Get configuration for them

    // We don't pass in preexisting variable values when evaluating expression
    let variableValues = new Array(numGroups);
    for (let i = 0; i < numGroups; i++) {
        variableValues[i] = {}; // Array has no data
    }
    
    // Use method from groups script to perform evaluation and get data table
    let multTableOut = groups.multiplicationTable(currentGroup,
        currentExpression, variableValues, mode);
    // On error, stop and return null
    if (multTableOut == null) {
        return null;
    }

    currentTable = multTableOut; // Update the current table

    // Get some data
    let multTable = multTableOut.multTable; // The table of data
    // The input and output sizes (number of elements)
    let inputRingSizes = multTableOut.inputRingSizes;
    let outputRingSizes = multTableOut.outputRingSizes;
    let tableSize = multTable.length; // The table size
    let labelRow = multTableOut.labelRow; // The x or y rows

    // Adjust the display parameters to match the number of blocks displayed
    let currentGroupInput = getUserInputStrings()[1];
    // We only renormalize display if group changes.
    if (oldGroupInput != currentGroupInput) {
        renormalize(multTable.length);
    }
    oldGroupInput = currentGroupInput; // Now update the value of the old group
    
    getAdditionalSettings(); // Gets the user's inputted settings.

    /* Now compute expected size of canvas (canvasWidth, canvasHeight are global
     * vars. */
    // If input rows are included
    canvasWidth = (tableSize + 1) * boxWidthParam + tableSize * xSpacingParam
        + extraSpacingParam;
    canvasHeight = (tableSize + 1) * boxHeightParam + tableSize * ySpacingParam
        + extraSpacingParam;
    // If input rows are not included
    if (!showInputsParam) {
        canvasWidth = tableSize * boxWidthParam
            + (tableSize - 1) * xSpacingParam;
        canvasHeight = tableSize * boxHeightParam
            + (tableSize - 1) * ySpacingParam;
    }

    // Set new canvas dimensions
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    // Adjust canvas CSS accordingly
    $("#canvas").css("width", canvasWidth);
    $("#canvas").css("height", canvasHeight);

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    /* Now compute widths, heights, additional xDisp, yDisp for small blocks
     * within each box (for when a product group is displayed). */
    let cellWidthArr = [];
    let cellHeightArr = [];
    let xCellDispArr = [];
    let yCellDispArr = [];
    
    let numRows = config.length; // Number of rows of blocks within each box
    // Go through rows and columns
    for (let row = 0; row < numRows; row++) {
        let numCols = config[row]; // Number of columns
        for (let col = 0; col < numCols; col++) {
            // Calculate position info for block
            let cellWidth = boxWidthParam / numCols;
            let cellHeight = boxHeightParam / numRows;
            let xCellDisp = cellWidth * col;
            let yCellDisp = cellHeight * row;

            // Add info to arrays
            cellWidthArr.push(cellWidth);
            cellHeightArr.push(cellHeight);
            xCellDispArr.push(xCellDisp);
            yCellDispArr.push(yCellDisp);
        }
    }

    // Draw label rows, if they are being displayed (top and left bars).
    if (showInputsParam) {
        // Iterate through boxes of label row.
        for (let rowColNum = 0; rowColNum < tableSize; rowColNum++) {
            let colLeft = (rowColNum + 1) * (boxWidthParam + xSpacingParam)
                + extraSpacingParam; // Start of left column edge
            let rowTop = (rowColNum + 1) * (boxHeightParam + ySpacingParam)
                + extraSpacingParam; // Start of top row edge

            // Product colors can be mixed or displayed separately.
            if (!mixProductsParam) {
                // Iterate through groups
                for (let i = 0; i < numGroups; i++) {
                    let index = labelRow[rowColNum][i][1]; // Index in group
                    // Use index to get colors
                    let color = colorFunction(inputRingSizes[i], index);
                    let h = color.h;
                    let s = color.s;
                    let l = color.l;

                    // Draw a box in label row and in label column
                    drawBoxCanvas(
                        colLeft + xCellDispArr[i], yCellDispArr[i],
                        cellWidthArr[i], cellHeightArr[i],
                        h, s, l
                    );
                    drawBoxCanvas(
                        xCellDispArr[i], rowTop + yCellDispArr[i],
                        cellWidthArr[i], cellHeightArr[i],
                        h, s, l
                    );
                }
            }
            // If product colors combined (no need to iterate through groups)
            else {
                // Index in overall product group
                let color = colorFunction(tableSize, rowColNum);
                // Get color
                let h = color.h;
                let s = color.s;
                let l = color.l;

                // Draw boxes in label rows
                drawBoxCanvas(
                    colLeft, 0,
                    boxWidthParam, boxHeightParam,
                    h, s, l
                );
                drawBoxCanvas(
                    0, rowTop,
                    boxWidthParam, boxHeightParam,
                    h, s, l
                );
            }
        }
    }

    // Now draw the grid, iterating through rows and columns.
    for (let row = 0; row < tableSize; row++) {
        for (let col = 0; col < tableSize; col++) {
            // Start of left column edge and row top
            let colLeft = col * (boxWidthParam + xSpacingParam);
            let rowTop = row * (boxHeightParam + ySpacingParam);
            // Adjust if input rows are being displayed
            if (showInputsParam) {
                colLeft = (col + 1) * (boxWidthParam + xSpacingParam)
                    + extraSpacingParam;
                rowTop = (row + 1) * (boxHeightParam + ySpacingParam)
                    + extraSpacingParam;
            }

            // If products not being mixed
            if (!mixProductsParam) {
                // Iterate through rows for each box
                for (let i = 0; i < numGroups; i++) {
                    let index = multTable[col][row][i][1]; // Index for group

                    // Get color
                    let color = colorFunction(outputRingSizes[i], index);
                    let h = color.h;
                    let s = color.s;
                    let l = color.l;

                    // Draw box
                    drawBoxCanvas(
                        colLeft + xCellDispArr[i], rowTop + yCellDispArr[i],
                        cellWidthArr[i], cellHeightArr[i],
                        h, s, l
                    );
                }
            }
            // If products are being mixed
            else {
                // Need to figure out index as part of overall product group
                let index = 0;
                let weight = 1;
                // Add up contribution from every group to overall index
                for (let i = numGroups - 1; i >= 0; i--) {
                    if (i < numGroups - 1) {
                        weight *= outputRingSizes[i + 1];
                    }
                    index += multTable[col][row][i][1] * weight;
                }

                // Compute color, using product of all ring sizes
                let color = colorFunction(outputRingSizes[0] * weight, index);
                let h = color.h;
                let s = color.s;
                let l = color.l;

                // Draw box
                drawBoxCanvas(
                    colLeft, rowTop,
                    boxWidthParam, boxHeightParam,
                    h, s, l
                );
            }
        }
    }

    return true; // Indicate success
}

var targetSize; // Target size of canvas

/* Adjusts display parameters based on how many boxes are being displayed, as
 * well as the globally known number of groups. */
function renormalize(numBoxes) {
    let targetSpacingRatio = 5; // Ratio of box length to space length
    let targetExtraSpacingRatio = 5; // Ratio of box length to extra spacing

    let numGroups = currentGroup.length; // Current number of groups

    // Compute box size
    let boxSize = Math.min(Math.ceil(targetSize / numBoxes), 100);

    // Fill in settings inputs with these values
    $("#box-width").val(boxSize);
    $("#box-height").val(boxSize);
    $("#x-spacing").val(0);
    $("#y-spacing").val(0);
    $("#extra-spacing").val(Math.ceil(boxSize / targetExtraSpacingRatio));

    // If multiple blocks in each box
    if (numGroups > 1) {
        let spacingSize = Math.ceil(boxSize / targetSpacingRatio);
        $("#x-spacing").val(spacingSize);
        $("#y-spacing").val(spacingSize);
    }
}

// Maps element of a group to a color based on the index and group size.
function colorFunction(ringSize, index) {
    // Ranges for colors
    let hRange = hUpperParam - hLowerParam;
    let sRange = sUpperParam - sLowerParam;
    let lRange = lUpperParam - lLowerParam;

    // Compute h, s, l. Note h is computed differently because it is mod 360.
    let h = (index / ringSize) * hRange + hLowerParam;
    let s = (index / (ringSize - 1)) * sRange + sLowerParam;
    let l = (index / (ringSize - 1)) * lRange + lLowerParam;

    // In case ringSize is 1, so that ringSize - 1 is 0
    if (ringSize == 1) {
        s = (index / ringSize) * sRange + sLowerParam;
        l = (index / ringSize) * lRange + lLowerParam;
    }

    // Return colors as object
    return {
        h: h,
        s: s,
        l: l
    };
}

/* Creates a configuration for how blocks should be arranged within a box, based
 * on the number of groups. */
function createConfig(num) {
    config = []; // Configuration returned as an array of number of elts per row

    // List explicitly for smaller numbers
    if (num == 1) {
        config = [1];
    }
    else if (num == 2) {
        config = [1, 1];
    }
    else if (num == 3) {
        config = [2, 1];
    }
    else if (num == 4) {
        config = [2, 2];
    }
    else if (num == 5) {
        config = [2, 1, 2];
    }
    else if (num == 6) {
        config = [2, 2, 2];
    }
    else if (num == 7) {
        config = [2, 3, 2];
    }
    else if (num == 8) {
        config = [3, 3, 2];
    }
    else if (num == 9) {
        config = [3, 3, 3];
    }
    // Otherwise just do all rows
    else if (num >= 9) {
        config = Array(num).fill(1);
    }

    return config;
}

/* Returns user's entered expression and group strings in an array. Otherwise
 * return ["", ""]. */
function getUserInputStrings() {
    userInputStrings = ["", ""];
    let separator = " in "; // Separates expression and group
    let userInput = $("#expression-input").val();
    let splitIndex = userInput.lastIndexOf(separator); // Split on last "in"
    if (splitIndex >= 0) {
        let expressionString = userInput.slice(0, splitIndex);
        let groupString = userInput.slice(splitIndex + separator.length,
            userInput.length);

        userInputStrings = [expressionString, groupString];
    }
    
    return userInputStrings;
}

// Updates page to show a new graphs
function updatePage(mode) {
    let userInputStrings = getUserInputStrings(); // Get user's input

    if (userInputStrings != null) {
        let expressionString = userInputStrings[0]; // Expression
        let groupString = userInputStrings[1]; // Group

        // Update current group based on string
        currentGroup = groups.parseGroup(groupString);
        let numGroups = currentGroup.length; // Number of groups in product
        let displayString = groups.getLatex(currentGroup); // Display group

        // If group valid, display it
        if (numGroups >= 1 && displayString != null) {   
            $("#group-display").text(displayString);
            MathJax.typeset(); // Process MathJax
        }

        let expression = mathParser.read(expressionString); // Read expression
        if (expression != null) {
            currentExpression = expression[0]; // The expression
            currentVariables = expression[1]; // Variables it contains
            // Get LaTeX for it
            let displayString = mathParser.getLatex(currentExpression, true);
    
            // Call function to draw graph and check for error
            if (drawExpressionGrid(mode) != null) {
                // Show expression LaTeX
                $("#expression-display").text(displayString);
                MathJax.typeset();

                // Adjust vertical spacing to center graph vertically
                let canvasEffectiveHeight = Math.ceil(canvas.height / scale);
                let verticalSpace = Math.max(15, Math.floor((getScreenHeight()
                    - 60 - canvasEffectiveHeight) / 2));

                // Adjust padding to create desired vertical spacing
                $("#canvas-container").css("padding-top", Math.max(15,
                    verticalSpace));
                $("#canvas-container").css("padding-bottom", Math.max(85,
                    verticalSpace));
            }
        }
    }
}

// Sets up page. This has default parameter values.
function setup() {
    $("#expression-input").val("x*y in Z/10"); // Default expression

    // Set default settings values
    $("#box-width").val("35");
    $("#box-height").val("35");
    $("#inputs-toggle>option:eq(0)").prop("selected", true);
    $("#x-spacing").val("0");
    $("#y-spacing").val("0");
    $("#extra-spacing").val("10");
    $("#h-lower").val("0");
    $("#h-upper").val("360");
    $("#s-lower").val("90");
    $("#s-upper").val("90");
    $("#l-lower").val("60");
    $("#l-upper").val("60");
    $("#mix-products>option:eq(0)").prop("selected", true);

    updatePage("ring"); // Finally, update page
}

/* Goes through user's entered settings. If valid, they are updated; otherwise
 * the value is changed to something valid. */
function getAdditionalSettings() {
    // Box width
    let boxWidthInput = $("#box-width").val();
    let boxWidthValidInput = false;
    if (boxWidthInput.match(/^[0-9]+$/)) {
        let val = parseInt(boxWidthInput, 10);
        if (!isNaN(val) && val > 0) {
            boxWidthParam = val;
            boxWidthValidInput = true;
        }
    }
    if (!boxWidthValidInput) {
        $("#box-width").val(boxWidthParam.toString());
    }

    // Box height
    let boxHeightInput = $("#box-height").val();
    let boxHeightValidInput = false;
    if (boxHeightInput.match(/^[0-9]+$/)) {
        let val = parseInt(boxHeightInput, 10);
        if (!isNaN(val) && val > 0) {
            boxHeightParam = val;
            boxHeightValidInput = true;
        }
    }
    if (!boxHeightValidInput) {
        $("#box-height").val(boxHeightParam.toString());
    }

    // Show inputs
    let showInputsInput = false;
    if ($("#inputs-toggle>option:eq(0)").prop("selected")) {
        showInputsInput = true;
    }
    showInputsParam = showInputsInput;

    // x spacing
    let xSpacingInput = $("#x-spacing").val();
    let xSpacingValidInput = false;
    if (xSpacingInput.match(/^[0-9]+$/)) {
        let val = parseInt(xSpacingInput, 10);
        if (!isNaN(val) && val >= 0) {
            xSpacingParam = val;
            xSpacingValidInput = true;
        }
    }
    if (!xSpacingValidInput) {
        $("#x-spacing").val(xSpacingParam.toString());
    }

    // y spacing
    let ySpacingInput = $("#y-spacing").val();
    let ySpacingValidInput = false;
    if (ySpacingInput.match(/^[0-9]+$/)) {
        let val = parseInt(ySpacingInput, 10);
        if (!isNaN(val) && val >= 0) {
            ySpacingParam = val;
            ySpacingValidInput = true;
        }
    }
    if (!ySpacingValidInput) {
        $("#y-spacing").val(ySpacingParam.toString());
    }

    // Extra spacing
    let extraSpacingInput = $("#extra-spacing").val();
    let extraSpacingValidInput = false;
    if (extraSpacingInput.match(/^[0-9]+$/)) {
        let val = parseInt(extraSpacingInput, 10);
        if (!isNaN(val) && val >= 0) {
            extraSpacingParam = val;
            extraSpacingValidInput = true;
        }
    }
    if (!extraSpacingValidInput) {
        $("#extra-spacing").val(extraSpacingParam.toString());
    }

    // h lower
    let hLowerInput = $("#h-lower").val();
    let hLowerValidInput = false;
    if (hLowerInput.match(/^[0-9]+$/)) {
        let val = parseInt(hLowerInput, 10);
        if (!isNaN(val) && val >= 0 && val <= 360) {
            hLowerParam = val;
            hLowerValidInput = true;
        }
    }
    if (!hLowerValidInput) {
        $("#h-lower").val(hLowerParam.toString());
    }

    // h upper
    let hUpperInput = $("#h-upper").val();
    let hUpperValidInput = false;
    if (hUpperInput.match(/^[0-9]+$/)) {
        let val = parseInt(hUpperInput, 10);
        if (!isNaN(val) && val >= 0 && val <= 360) {
            hUpperParam = val;
            hUpperValidInput = true;
        }
    }
    if (!hUpperValidInput) {
        $("#h-upper").val(hUpperParam.toString());
    }

    // s lower
    let sLowerInput = $("#s-lower").val();
    let sLowerValidInput = false;
    if (sLowerInput.match(/^[0-9]+$/)) {
        let val = parseInt(sLowerInput, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            sLowerParam = val;
            sLowerValidInput = true;
        }
    }
    if (!sLowerValidInput) {
        $("#s-lower").val(sLowerParam.toString());
    }

    // s upper
    let sUpperInput = $("#s-upper").val();
    let sUpperValidInput = false;
    if (sUpperInput.match(/^[0-9]+$/)) {
        let val = parseInt(sUpperInput, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            sUpperParam = val;
            sUpperValidInput = true;
        }
    }
    if (!sUpperValidInput) {
        $("#s-upper").val(sUpperParam.toString());
    }

    // l lower
    let lLowerInput = $("#l-lower").val();
    let lLowerValidInput = false;
    if (lLowerInput.match(/^[0-9]+$/)) {
        let val = parseInt(lLowerInput, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            lLowerParam = val;
            lLowerValidInput = true;
        }
    }
    if (!lLowerValidInput) {
        $("#l-lower").val(lLowerParam.toString());
    }

    // l upper
    let lUpperInput = $("#l-upper").val();
    let lUpperValidInput = false;
    if (lUpperInput.match(/^[0-9]+$/)) {
        let val = parseInt(lUpperInput, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) {
            lUpperParam = val;
            lUpperValidInput = true;
        }
    }
    if (!lUpperValidInput) {
        $("#l-upper").val(lUpperParam.toString());
    }

    // Mix products
    let mixProductsInput = true;
    if ($("#mix-products>option:eq(0)").prop("selected")) {
        mixProductsInput = false;
    }
    mixProductsParam = mixProductsInput;
}

// The global state
var currentGroup = null; // Current group being graphed
var currentExpression = {}; // Current expression being graphed

var oldGroupInput = ""; // Old group, to detect when group is changed

// Current color choices
var hLowerParam = 0;
var hUpperParam = 0;
var sLowerParam = 0;
var sUpperParam = 0;
var lLowerParam = 0;
var lUpperParam = 0;

// Display parameters
var boxWidthParam = 10;
var boxHeightParam = 10;
var xSpacingParam = 0;
var ySpacingParam = 0;
var extraSpacingParam = 0;
var showInputsParam = true;
var mixProductsParam = false;

var currentTable = []; // Current multiplication table

// For main input display
var mainInputDisplayed = true;
var topFullHeight = 0;
var topSmallHeight = 0;

// Toggles main input being open/closed.
function toggleMainInput() {
    $("#down-arrow").toggleClass("down-arrow-flip"); // Rotate arrow icon

    // Close main input, if it is open
    if (mainInputDisplayed) {
        mainInputDisplayed = false;

        topFullHeight = $("#top").height();
        $("#input-main").css("display", "none");
        $("#display").css("display", "block");
        topSmallHeight = $("#top").height();
        
        $("#top").height(topFullHeight).animate({height: topSmallHeight}, 300,
                function() {
            // Animation complete
            $("#top").css("height", "auto");
        });
    }
    // Open main input, if it is closed
    else {
        mainInputDisplayed = true;

        $("#input-main").css("display", "block");
        $("#display").css("display", "none");

        $("#top").height(topSmallHeight).animate({height: topFullHeight}, 300,
                function() {
            // Animation complete
            $("#top").css("height", "auto");
        }); 
    }
}

var settingsDisplayed = false; // Whether settings are displayed
var infoDisplayed = false; // Whether info is displayed

// Toggles appearance of settings area
function toggleSettings() {
    // Open settings if they are close
    if (!settingsDisplayed) {
        settingsDisplayed = true;
        infoDisplayed = false;

        let topOriginalHeight = $("#top").height();
        $("#extra").css("display", "block");
        $("#settings").css("display", "block");
        $("#info").css("display", "none");
        let topNewHeight = $("#top").height();

        $("#top").height(topOriginalHeight).animate({height: topNewHeight}, 300, function() {
            // Animation complete
            $("#top").css("height", "auto");
        });
    }
    // Close settings if they are open
    else {
        settingsDisplayed = false;

        let topNewHeight = $("#top").height();
        $("#extra").css("display", "none");
        $("#settings").css("display", "none");
        let topOriginalHeight = $("#top").height();

        $("#top").height(topNewHeight).animate({height: topOriginalHeight}, 300, function() {
            // Animation complete
            $("#top").css("height", "auto");
        });
    }
}

// Toggles appearance of info area
function toggleInfo() {
    // Open info if it is closed
    if (!infoDisplayed) {
        infoDisplayed = true;
        settingsDisplayed = false;

        let topOriginalHeight = $("#top").height();
        $("#extra").css("display", "block");
        $("#settings").css("display", "none");
        $("#info").css("display", "block");
        let topNewHeight = $("#top").height();

        $("#top").height(topOriginalHeight).animate({height: topNewHeight}, 300, function() {
            // Animation complete
            $("#top").css("height", "auto");
        });
    }
    // Close info if it is open
    else {
        infoDisplayed = false;

        let topNewHeight = $("#top").height();
        $("#extra").css("display", "none");
        $("#info").css("display", "none");
        let topOriginalHeight = $("#top").height();

        $("#top").height(topNewHeight).animate({height: topOriginalHeight}, 300, function() {
            // Animation complete
            $("#top").css("height", "auto");
        });
    }
}

// Gets normally, unless Android in which case original measurement used.
function getScreenHeight() {
    if (isAndroid) {
        return androidHeight;
    }
    else return $(window).height();
}

// For getting proper height on Android
var androidHeight;
var isAndroid;

// Run when document first loads
$(document).ready(function() {
    // Android keyboard screws up height measurements, so measure now
    $("input").blur(); // Hide Android keyboard
    androidHeight = $(window).height()
    let ua = navigator.userAgent.toLowerCase();
    isAndroid = ua.indexOf("android") > -1; // Check if Android

    // Change default widths if window width is small
    if ($(window).width() < 480) {
        targetSize = $(window).width() - 15;
        $("#input-holder").css("width", targetSize); // Change search bar size
        targetSize = targetSize - 50; // Change target graph size
        // Shorter link names under search bar
        $("#submit-group").text("As group");
        $("#info-button").text("Info");
        // Reduce space between links
        $("#second-line p").css("margin-left", "14px");
        $("#second-line p:first-of-type").css("margin-left",
            Math.max(14, $(window).width() - 310));
    }
    else targetSize = 400;

    // If screen too short, change height of info box
    if (window.innerHeight < 350) {
        $("#extra").css("max-height", getScreenHeight() / 2);
    }

    setup(); // Set up page

    // Detect click to graph group
    $("#submit-group").click(function() {
        updatePage("group");
    });

    // Detect click to graph ring
    $("#submit-ring").click(function() {
        updatePage("ring");
    });

    // Detect click on display bar (when main input hidden)
    $("#display").click(function() {
        toggleMainInput();
        $("#expression-input").focus();
    });

    // Detect clik on arrow icon
    $("#down-arrow").click(function() {
        toggleMainInput();
    });

    // Detect click on settings
    $("#settings-button").click(function() {
        toggleSettings();
    });

    // Detect click on info
    $("#info-button").click(function() {
        toggleInfo();
    });

    // Detect Enter key to update display when main input selected
    $("body").on("keypress", "input", function(event) {
        // Check if Enter key
        if (event.keyCode == 13) {
            updatePage("ring");
        }
    });

    // Detect rainbow color scheme click
    $("#rainbow-scheme").click(function() {
        $("#h-lower").val("0");
        $("#h-upper").val("360");
        $("#s-lower").val("90");
        $("#s-upper").val("90");
        $("#l-lower").val("60");
        $("#l-upper").val("60");

        updatePage("ring");
    });

    // Detect blue color scheme click
    $("#blue-scheme").click(function() {
        $("#h-lower").val("200");
        $("#h-upper").val("250");
        $("#s-lower").val("90");
        $("#s-upper").val("100");
        $("#l-lower").val("65");
        $("#l-upper").val("40");

        updatePage("ring");
    });

    // Detect green color scheme click
    $("#green-scheme").click(function() {
        $("#h-lower").val("150");
        $("#h-upper").val("185");
        $("#s-lower").val("85");
        $("#s-upper").val("100");
        $("#l-lower").val("65");
        $("#l-upper").val("20");

        updatePage("ring");
    });
    
    // Detect grayscale color scheme click
    $("#grayscale-scheme").click(function() {
        $("#h-lower").val("0");
        $("#h-upper").val("0");
        $("#s-lower").val("0");
        $("#s-upper").val("0");
        $("#l-lower").val("100");
        $("#l-upper").val("0");

        updatePage("ring");
    });

    // Code for label to show values when graph is hovered over
    $(document).on("mousemove", function(event) {
        // Check if mouse is over canvas
        if ($("#canvas:hover").length != 0) {
            $("#label").css("display", "block"); // Show the label
            // Move label to where mouse is
            $("#label").offset({left: event.pageX + 10, top: event.pageY + 16});

            // Get where client is on the canvas
            var rect = canvas.getBoundingClientRect();
            let xDisp = event.clientX - rect.left;
            let yDisp = event.clientY - rect.top;

            // Check if over left label column
            if (showInputsParam && xDisp <= boxWidthParam && yDisp
                    >= boxHeightParam + ySpacingParam + extraSpacingParam) {
                // Distance from mouse vertically to top of left label column
                let distFromTopOfCol = yDisp - boxHeightParam - ySpacingParam
                    - extraSpacingParam;
                if (distFromTopOfCol % (boxHeightParam + ySpacingParam)
                        <= boxHeightParam) {
                    // Detect which box it is over
                    let index = Math.max(Math.floor(distFromTopOfCol
                        / (boxHeightParam + ySpacingParam)), 0);

                    $("#label-key").text(`y: `); // Change label

                    // Figure out what data to display
                    let data = currentTable.labelRow[index];
                    // If one element, display by itself
                    if (data.length == 1) {
                        $("#label-value").text(`${data[0][2]}`);
                    }
                    // Otherwise list the elements in a vector
                    else {
                        let orderedPairString = "";
                        let numGroups = data.length;
                        for (let i = 0; i < numGroups; i++) {
                            orderedPairString += data[i][2];
                            if (i < numGroups - 1) {
                                orderedPairString += ", ";
                            }
                        }
                        $("#label-value").text(`(${orderedPairString})`);
                    }
                }
                else $("#label").css("display", "none");
            }

            // Check if over top label row
            else if (showInputsParam && yDisp <= boxHeightParam && xDisp
                    >= boxWidthParam + xSpacingParam + extraSpacingParam) {
                // Distance horizontally from mouse to left of top row
                let distFromLeftOfRow = xDisp - boxWidthParam - xSpacingParam
                    - extraSpacingParam;
                if (distFromLeftOfRow % (boxWidthParam + xSpacingParam)
                        <= boxWidthParam) {
                    // Get which box it is over
                    let index = Math.max(Math.floor(distFromLeftOfRow
                        / (boxWidthParam + xSpacingParam)), 0);
                    $("#label-key").text(`x: `); // Set label text

                    // Figure out what data to display
                    let data = currentTable.labelRow[index];
                    // If one element, display by itself
                    if (data.length == 1) {
                        $("#label-value").text(`${data[0][2]}`);
                    }
                    // Otherwise display elements as vector
                    else {
                        let orderedPairString = "";
                        let numGroups = data.length;
                        for (let i = 0; i < numGroups; i++) {
                            orderedPairString += data[i][2];
                            if (i < numGroups - 1) {
                                orderedPairString += ", ";
                            }
                        }
                        $("#label-value").text(`(${orderedPairString})`);
                    }
                }
                else {
                    $("#label").css("display", "none");
                }
            }

            // Otherwise over the rest of grid, not label rows
            else if ((showInputsParam && xDisp >= boxWidthParam + xSpacingParam
                    + extraSpacingParam && yDisp >= boxHeightParam
                    + ySpacingParam + extraSpacingParam)
                    || (!showInputsParam)) {
                let distFromLeft = xDisp;
                let distFromTop = yDisp;

                // Adjust values based on whether label rows displayed
                if (showInputsParam) {
                    distFromLeft -= (boxWidthParam + xSpacingParam
                        + extraSpacingParam);
                    distFromTop -= (boxHeightParam + ySpacingParam
                        + extraSpacingParam);
                }

                // Now check if not over a space.
                if ((distFromLeft % (boxWidthParam + xSpacingParam)
                        <= boxWidthParam) && (distFromTop %
                        (boxHeightParam + ySpacingParam) <= boxHeightParam)) {
                    // Over a box - get indices
                    let xIndex = Math.max(Math.floor(distFromLeft
                        / (boxWidthParam + xSpacingParam)), 0);
                    let yIndex = Math.max(Math.floor(distFromTop
                        / (boxHeightParam + ySpacingParam)), 0);

                    $("#label-key").text(`Value: `); // Set label value

                    // Figure out what data to display
                    let data = currentTable.multTable[xIndex][yIndex];
                    // If one element, display by itself
                    if (data.length == 1) {
                        $("#label-value").text(`${data[0][2]}`);
                    }
                    // Otherwise display elements as list
                    else {
                        let orderedPairString = "";
                        let numGroups = data.length;
                        for (let i = 0; i < numGroups; i++) {
                            orderedPairString += data[i][2];
                            if (i < numGroups - 1) {
                                orderedPairString += ", ";
                            }
                        }
                        $("#label-value").text(`(${orderedPairString})`);
                    }
                }
                // Otherwise, over a space
                else {
                    $("#label").css("display", "none");
                }
            }
            // Over canvas, but none of the situations above
            else {
                $("#label").css("display", "none");
            }
        }
        // Default behavior when not over canvas - don't show label.
        else {
            $("#label").css("display", "none");
        }
    });

    /* Image downloader - the following code makes a series of graphs while
     * updating a parameter and saves them to the device. Make sure automatic
     * downloads are turned on for the site. */
    /*
    // Function to download canvas image as PNG with name "filename".
    var downloadCanvas = function(filename) {
        var link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = document.getElementById("canvas").toDataURL();
        link.click();
    }

    let timingInterval = 1000; // Interval between downloads
    let imgParam = 0; // Start value for the parameter

    // Desired settings for image
    $("#inputs-toggle>option:eq(1)").prop("selected", true); // Hide inputs
    $("#rainbow-scheme").click(); // Set color theme
    scale = 2; // Change scale to reduce image size

    // Repeat downloads while updating parameter
    setInterval(function() {
            // Input for each image
            $("#expression-input").val(`${imgParam}xy in Z17`);

            updatePage("ring"); // Update page

            // Add text to image
            let unit = Math.floor(canvas.width / 10);
            ctx.fillStyle = "red";
            ctx.font = `${unit}px CMU Serif`;
            ctx.shadowColor = "black";
            ctx.shadowBlur = 5;
            ctx.fillText(`${imgParam}`, unit / 2, canvas.height - unit / 2);

            downloadCanvas(`${imgParam}`); // Download result

            imgParam = imgParam + 1; // Update parameter
    }, timingInterval);
    */
});
