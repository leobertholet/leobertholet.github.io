

/* Removes problematic characters from user inputs */
/*function sanitize(string) {
    string = string.replace(/\</g, "&lt;");
    string = string.replace(/\>/g, "&gt;");
    string = string.replace(/\"/g, "&quot;");
    string = string.replace(/\'/g, "&#39;");
    string = string.replace(/\`/g, "&#96;");
    string = string.replace(/\{/g, "&#123;");
    string = string.replace(/\}/g, "&#125;");

    return string;
}*/

colWidth = 280;

function getMinCol() {
    minCol = 0;
    var i;

    for (i = 1; i < numCols; i++) {
        if ($("#container").children().eq(i).height() < $("#container").children().eq(minCol).height()) {
            minCol = i;
        }
    }

    return minCol;
}

function setCookie(index, string) {
    localStorage.setItem(index.toString(), string);
}

function getCookie(index) {
    return localStorage.getItem(index.toString());
}

function removeCookie(index) {
    localStorage.removeItem(index.toString());
}

function storeCookies() {
    localStorage.clear();
    setCookie(-1,tilesInfo.length.toString());
    var i;
    for (i = 0; i < tilesInfo.length; i++) {
        setCookie(2*i, tilesInfo[i][0]);
        setCookie(2*i+1, tilesInfo[i][1]);
    }
    if ($("#brightness-mode").text() == "Light mode") {
        setCookie(-2, "dark");
    }
}

function loadCookies() {
    len = getCookie(-1);
    tilesInfo = [];
    if (len >= 1) {
        tilesInfo = new Array(len);
    }

    var i;
    for (i = 0; i < len; i++) {
        
        tilesInfo[i] = [getCookie(2*i), getCookie(2*i+1)];
    }
}

var numCols;

function pageSetup() {
    $("#container").empty();
    numCols = Math.max(1, Math.floor(0.85 * $(window).width() / (colWidth + 15)));
    colsWidth = Math.floor(numCols * colWidth + 15 * (numCols - 1));

    colHeights = new Array(numCols).fill(0);

    for (i = 0; i < numCols; i++) {
        newCol = "<div class='column'></div>";
        $("#container").append(newCol);
    }

    $("#container .column").css("margin-right", "15px");
    $("#container .column").last().css("margin-right", "0");

    for (i = 0; i < tilesInfo.length; i++) {
        tileInfo = tilesInfo[i];
        newTile = "<div class='tile'>"
                    + "<div class='delete'></div>"
                    + "<div class ='move'></div>"
                    + "<h3>" + tileInfo[0] + "</h3>"
                    + "<p>" + tileInfo[1] + "</p>"
                + "</div>";
        colNum = i % numCols;

        if (i >= numCols) {
            colNum = getMinCol();
        }

        col = $("#container").children().eq(colNum);
        col.append(newTile);

        newTile = col.children().last();
        newTile.attr("index", i);

        colHeights[colNum] += newTile.height() + 15;
    }

    if (tilesInfo.length == 0) {
        $("#container").append("<p>You don't have any cookies yet ... click add :)</p>");
    }
}

$(window).resize(function() {
    pageSetup();
});

$(document).ready(function() {
    loadCookies();
    pageSetup();
    if (getCookie(-2) != null) {
        darkMode();
    }
    /* move click() stuff into here */
});

/* swap tiles at i and j */
function swapTiles(i, j) {
    temp = tilesInfo[i];
    tilesInfo[i] = tilesInfo[j];
    tilesInfo[j] = temp;
    storeCookies();
    pageSetup();
}

$(document).on("click", ".delete", function() {
    if (confirm("Yo you sure?")) {
        tile = $(this).parent();
        index = tile.attr("index");
        tile.remove();
        tilesInfo.splice(index, 1); // Remove elt from arr
        // reset indices of everyone that came after
        $(".tile").each(function() {
            if ($(this).attr("index") > index) {
                $(this).attr("index", $(this).attr("index") - 1);
            }
        });

        pageSetup();
        storeCookies();
    }
});

function darkMode() {
    $("#brightness-mode").text("Light mode");
    $("body").css("background", "#222324");
    setCookie(-2, "dark");
    $("#top h1").css("color", "white");
}

function lightMode() {
    $("#brightness-mode").text("Dark mode");
    $("body").css("background", "white");
    removeCookie(-2);
    $("#top h1").css("color", "black");
}

$("#brightness-mode").click(function() {
    if ($(this).text() == "Dark mode") {
        darkMode();
    }
    else {
        lightMode();
    }
});

$("#add").click(function() {
    newTitle = prompt("enter title");
    if (newTitle != null) {
        newText = prompt("enter text");
    }
    
    if (newTitle != null && newText != null) {
        tilesInfo.push([newTitle, newText]);

        pageSetup();
        storeCookies();
    }
});

$("#delete-all").click(function() {
    if (confirm("Umm for real?")) {
        tilesInfo = [];
        pageSetup();
        storeCookies();
    }
});

$(document).on("click", ".tile h3", function() {
    newText = prompt("change text", $(this).text());
    $(this).text(newText);
    tilesInfo[$(this).parent().attr("index")][0] = $(this).text();
    storeCookies();
});

$(document).on("click", ".tile p", function() {
    newText = prompt("change text", $(this).text());
    $(this).text(newText);
    tilesInfo[$(this).parent().attr("index")][1] = $(this).text();
    storeCookies();
});

var wasDragging = false;

var int00; // declared here to make it visible to clearInterval.

currCol = currRow = -1;
currIndex = -1;
var tileIndex;

$(document).on("mousedown touchstart", ".tile .move", function() {
    tile = $(this).parent();
    tile.css("width", "280px");
    tile.css("box-sizing", "border-box");
    tileIndex = tile.attr("index");
    wasDragging = true;
    
    int00 = setInterval(function() {

        $(document).on("mousemove touchmove", function(event) {

            var mouseX, mouseY;
            // code for osmeone on the intenet
            /*if(event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel'){
                var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                mouseX = touch.pageX;
                mouseY = touch.pageY;
            } else if (event.type == 'mousedown' || event.type == 'mouseup' || event.type == 'mousemove' || event.type == 'mouseover'|| event.type=='mouseout' || event.type=='mouseenter' || event.type=='mouseleave') {
                mouseX = event.clientX;
                mouseY = event.clientY;
            }*/

            if (event.type == "touchmove") {
                var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                mouseX = touch.pageX;
                mouseY = touch.pageY - $(window).scrollTop();
            }
            else {
                mouseX = event.pageX;
                mouseY = event.pageY - $(window).scrollTop();
            }

         
            currCol = currElt = -1;
            

            tile.css("position", "fixed");
            tile.css("left", (mouseX - 35).toString() + "px");
            tile.css("top", (mouseY - 25).toString() + "px");
            tile.css("margin-left", 0);

            for (i = 0; i < numCols; i++) {
                col = $("#container").children().eq(i);
                for (j = 0; j < col.children().length; j++) {
                    elt = col.children().eq(j);
                    if (elt.attr("index") != tileIndex) {
                        elt.css("background-color", "white");
                        
                        rect = elt[0].getBoundingClientRect();
                        
                        if (rect.left <= mouseX && mouseX <= rect.right && rect.bottom >= mouseY && mouseY >= rect.top) {
                            elt.css("background-color", "red");
                            currCol = i;
                            currRow = j;
                        }
                    }
                }
            }
            
        });

        
    }, 200);
});

$(document).on("mouseup touchend", function() {
    if (wasDragging) {
        
        wasDragging = false;
        $(document).unbind("mousemove");
        $(document).unbind("touchmove");
        clearInterval(int00);
        $(".tile").css("position", "static");
        
        if (currCol != -1) {
            
            otherIndex = $("#container").children().eq(currCol).children().eq(currRow).attr("index");
            swapTiles(tileIndex, otherIndex);
        }

        currCol = CurrRow = -1;
    }
});

