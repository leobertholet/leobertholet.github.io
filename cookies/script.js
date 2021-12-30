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

var tilesInfo;

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
    scrollPos = $(document).scrollTop();
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
        $("#container").append("<p class='init-msg'>Click \"Add\" to make a cookie.</p>");
    }

    $("#footer").css("display", "none");
    footerTop = Math.max($("#container").height() + 200,
                         $(document).height() - $("#footer").height());

    $("#footer").css("top", footerTop.toString() + "px");
    $("#footer").css("display", "initial");
    $(document).scrollTop(scrollPos);

    if (getCookie(-2) != null) {
        darkMode();
    }
    else {
        lightMode();
    }
}

$(window).resize(function() {
    if (tilesInfo != null) {
        pageSetup();
    }
});

$(document).ready(function() {
    loadCookies();
    pageSetup();

    // Runs again after 0.5s, in case slow font loading caused incorrect size
    // measurements initially
    setTimeout(function() {
        pageSetup();
    }, 500 );
});

/* Swap tiles at i and j */
function swapTiles(i, j) {
    temp = tilesInfo[i];
    tilesInfo[i] = tilesInfo[j];
    tilesInfo[j] = temp;
    storeCookies();
    pageSetup();
}

$(document).on("click", ".delete", function() {
    if (confirm("This will delete the cookie. Are you sure?")) {
        tile = $(this).parent();
        index = tile.attr("index");
        tile.remove();

        tilesInfo.splice(index, 1); // Remove elt from array
        // Reset indices of everyone that came after
        $(".tile").each(function() {
            if ($(this).attr("index") > index) {
                $(this).attr("index", $(this).attr("index") - 1);
            }
        });

        pageSetup();
        storeCookies();
    }
});

// Link for image at bottom
$(document).on("click", "#cookie-img", function() {
    document.location.href = "https://en.wikipedia.org/wiki/HTTP_cookie";
})

function darkMode() {
    $("#brightness-mode").text("Light mode");
    $("body").css("background", "#222324");
    setCookie(-2, "dark");
    $("#top h1").css("color", "white");
    $(".option").hover(function() {
        $(this).css("color", "rgb(168, 187, 212)");
    });
    $(".option").css("color", "white");
    $(".option").mouseleave(function() {
        $(this).css("color", "white");
    });
    $(".tile").css("border", "0.5px solid white");
    $(".tile").css("color", "white");
    $("#cookie-img").attr("src", "cookie-dark.png");
}

function lightMode() {
    $("#brightness-mode").text("Dark mode");
    $("body").css("background", "white");
    removeCookie(-2);
    $("#top h1").css("color", "black");
    $(".option").css("color", "black");
    $(".option").hover(function() {
        $(this).css("color", "rgb(168, 187, 212)");
    });
    $(".option").mouseleave(function() {
        $(this).css("color", "black");
    });
    $(".tile").css("border", "0.5px solid black");
    $(".tile").css("color", "black");
    $("#cookie-img").attr("src", "cookie.png");
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
    newTitle = prompt("Enter title:");
    if (newTitle != null) {
        newText = prompt("Enter text:");
    }
    
    if (newTitle != null && newText != null) {
        tilesInfo.push([newTitle, newText]);

        pageSetup();
        storeCookies();
    }
});

$("#delete-all").click(function() {
    if (confirm("Are you sure?")) {
        tilesInfo = [];
        pageSetup();
        storeCookies();
    }
});

var wasDragging = false;
var int00; // Declared here to make it visible to clearInterval()

currCol = currRow = -1;
currIndex = -1;
var tileIndex;
var tile;

$(document).on("mousedown touchstart", ".tile", function(e) {
    oldTile = $(this);
    oldTile.clone().insertAfter($("#container"));

    tile = $("#container").next();
    tile.css("width", "280px");
    tile.css("box-sizing", "border-box");
    tile.css("display", "none");
    tile.css("opacity", "0.85");
    if (getCookie(-2) != null) {
        tile.css("background", "#222324");
    }
    else {
        tile.css("background", "white");
    }
    
    tileIndex = tile.attr("index");

    wasDragging = true;
    var mouseX, mouseY;
    var deltaX, deltaY;

    initRect = oldTile[0].getBoundingClientRect();

    if (e.type == "touchstart") {
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        mouseX = touch.pageX;
        mouseY = touch.pageY - $(window).scrollTop();
    }
    else {
        mouseX = e.pageX;
        mouseY = e.pageY - $(window).scrollTop();
    }

    // Displacement between box corner and where mouse grabs
    deltaX = Math.floor(mouseX - initRect.left);
    deltaY = Math.floor(mouseY - initRect.top);
    
    $("*").css("user-select", "none");

    hiddenDeletes = false;
    madeClone = false;
    
    int00 = setInterval(function() {
        $(document).on("mousemove touchmove", function(event) {
            if (!hiddenDeletes) {
                $(".delete").css("visibility", "hidden");
                hiddenDeletes = true;
            }

            if (!madeClone) {
                oldTile.css("visibility", "hidden");
                tile.css("display", "initial");
                madeClone = true;
            }

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
            tile.css("left", (mouseX - deltaX).toString() + "px");
            tile.css("top", (mouseY - deltaY).toString() + "px");
            tile.css("margin-left", 0);

            for (i = 0; i < numCols; i++) {
                col = $("#container").children().eq(i);

                for (j = 0; j < col.children().length; j++) {
                    elt = col.children().eq(j);

                    if (elt.attr("index") != tileIndex) {
                        elt.css("background", "none");
                        rect = elt[0].getBoundingClientRect();
                        
                        if (rect.left <= mouseX && mouseX <= rect.right && rect.bottom >= mouseY && mouseY >= rect.top) {
                            elt.css("background-color", "rgba(168, 187, 212, 0.1)");
                            currCol = i;
                            currRow = j;
                        }
                    }
                }
            }

            if (mouseY < 100) {
                $(document).scrollTop($(document).scrollTop() - 1)
            }
            else if (mouseY > $(window).height() - 100) {
                $(document).scrollTop($(document).scrollTop() + 1)
            }   
        });  
    }, 200);
});

$(document).on("mouseup touchend", function() {
    if (wasDragging) {
        wasDragging = false;
        $(".delete").css("visibility", "visible");
        $(document).unbind("mousemove");
        $(document).unbind("touchmove");
        clearInterval(int00);
        $(".tile").css("position", "static");
        $(".tile").css("opacity", "1");
        $(".tile").css("visibility", "visible");
        tile.remove();
        
        if (currCol != -1) {
            otherIndex = $("#container").children().eq(currCol).children().eq(currRow).attr("index");
            swapTiles(tileIndex, otherIndex);
        }

        currCol = CurrRow = -1;
        $("*").css("user-select", "auto");
    }
});
