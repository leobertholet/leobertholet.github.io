

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

    for (i = 1; i < colHeights.length; i++) {
        if (colHeights[i] < colHeights[minCol]) {
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

        colHeights[colNum] += newTile.height() + 10;
    }

    if (tilesInfo.length == 0) {
        $("#container").append("<p>You don't have any tiles yet ... click add :)</p>");
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
    $("body").css("background", "slategray");
    setCookie(-2, "dark");
}

function lightMode() {
    $("#brightness-mode").text("Dark mode");
    $("body").css("background", "white");
    removeCookie(-2);
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
