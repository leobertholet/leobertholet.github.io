

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

tilesInfo = [[50,
              "Name",
              "Here is some content for you sir"],
             ["Name",
              "Here is some content for you sir"],
             ["Name",
              "Here is some content for you sir"],
             ["Name something words why how oh no",
              "Here is some content for you sir"],
             ["Name",
              "Here is some content for you sir"],
             ["Name",
              "Here is some content for you sir and here how is that even"],
             ["Name",
              "Here is some content for you sir"],
             ["Name",
              "Here is some content for you sir"]
            ];

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

function setCookie() {
    if (!navigator.cookiesEnabled) {
        alert("cookies not enabled!");
    }
    else {
        document.cookie = "username=John Doe";
    }
}

$("#cookies-test").click(function() {
    setCookie();
    console.log("done");
});

function pageSetup() {
    $("#container").empty();
    numCols = Math.max(1, Math.floor(0.85 * $(window).width() / (colWidth + 15)));
    colsWidth = Math.floor(numCols * colWidth + 15 * (numCols - 1));

    windowWidth = $(window).innerWidth();

    marginLeft = Math.floor((windowWidth - colsWidth) / 2);

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

        colHeights[colNum] += newTile.height() + 10;
    }
}

$(window).resize(function() {
    pageSetup();
});

$(document).ready(function() {
    pageSetup();

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
        }
    });
});

$("#add").click(function() {
    newTitle = prompt("enter title");
    newText = prompt("enter text");
    tilesInfo.push([newTitle, newText]);

    pageSetup();
});

$("#delete-all").click(function() {
    if (confirm("Umm for real?")) {
        tilesInfo = [];
        pageSetup();
    }
});

$(document).on("click", ".tile h3", function() {
    newText = prompt("change text", $(this).text());
    $(this).text(newText);
});

$(document).on("click", ".tile p", function() {
    newText = prompt("change text", $(this).text());
    $(this).text(newText);
});
