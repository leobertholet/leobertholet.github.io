/* Color options at the top */
colorChoicesXML = ""
+ "<colorChoices>"
    + "<textColors>" /* Text color options */
        + "<color>black</color>"
        + "<color>#d77c69</color>"
        + "<color>lightsalmon</color>"
        + "<color>#fac655</color>"
        + "<color>#8fd769</color>"
        + "<color>#699cd7</color>"
        + "<color>plum</color>"
    + "</textColors>"
    + "<backgroundColors>" /* Background color options */
        + "<color>white</color>"
        + "<color>papayawhip</color>"
        + "<color>gainsboro</color>"
        + "<color>lavender</color>"
        + "<color>powderblue</color>"
    + "</backgroundColors>"
+ "</colorChoices>";

/* Various default words */
words = ["hi",
         "iguana",
         "schadenfreude",
         "octet",
         "flex",
         "woke",
         ";)",
         "umm",
         "welp",
         "okayy",
         "singularity",
         "digraph",
         "huh",
         "monoid",
         "coset"
        ];

/* Removes problematic characters from user inputs */
function sanitize(string) {
    string = string.replace(/\</g, "&lt;");
    string = string.replace(/\>/g, "&gt;");
    string = string.replace(/\"/g, "&quot;");
    string = string.replace(/\'/g, "&#39;");
    string = string.replace(/\`/g, "&#96;");
    string = string.replace(/\{/g, "&#123;");
    string = string.replace(/\}/g, "&#125;");

    return string;
}

/* Gets random int between min (inclusive) and max (exclusive) (credit:
Mozilla) */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

/* Selects a color option */
function selectColor(elt) {
    elt.css("border-width", "0px");
    elt.css("width", "31px");
    elt.css("height", "31px");
}

/* Deselects a color option */
function deselectColor(elt) {
    elt.css("border-width", "7.5px");
    elt.css("width", "16px");
    elt.css("height", "16px");
}

/* Changes size of main input text */
function changeWordSizeBy(n) {
    /* Get current size as int */
    currSize = $("#word").css("font-size").slice(0,-2);
    newSize = parseInt(currSize) + n; /* Change by n */
    /* Set back as size */
    newSize = newSize.toString() + "px";
    $("#word").css("font-size", newSize);
}

$(document).ready(function() {
    /* Get random word from list and display in input */
    $("#word").attr("value", words[getRandomInt(0, words.length)]);

    parser = new DOMParser(); /* To parse XML */
    xmlDoc = parser.parseFromString(colorChoicesXML, "text/xml");

    /* Get text and background color data */
    textColors = xmlDoc.getElementsByTagName("textColors")[0].childNodes;
    backgroundColors
        = xmlDoc.getElementsByTagName("backgroundColors")[0].childNodes;

    /* Iterate through text colors */
    for (i = 0; i < textColors.length; i++) {
        /* Add div for color */
        $("#text-colors").append("<div class=\"color-choice\"></div>");

        /* Get, then set, div color */
        color = textColors[i].childNodes[0].nodeValue;
        $("#text-colors").children().eq(i).css("background", color);
    }

    /* Repeat for background colors */
    for (i = 0; i < backgroundColors.length; i++) {
        /* Add div */
        $("#background-colors").append("<div class=\"color-choice\"></div>");

        /* Get & set its color */
        color = backgroundColors[i].childNodes[0].nodeValue;
        $("#background-colors").children().eq(i).css("background", color);
    }

    /* Select first text and background colors by default */
    selectColor($("#text-colors").children().eq(0));
    selectColor($("#background-colors").children().eq(0));

    /* Set font color to color of first option by default */
    textColor = $("#text-colors").children().eq(0).css("background-color");
    $("#word").css("color", textColor);

    /* Set background to color of first option by default */
    backgroundColor
        = $("#background-colors").children().eq(0).css("background-color");
    $("body").css("background", backgroundColor);

    /* Detects button click for text colors */
    $("body").on("click", "#text-colors .color-choice", function() {
        /* Set word color accordingly */
        $("#word").css("color", $(this).css("background-color"))

        /* Deselect everyone & then select this one */
        deselectColor($("#text-colors").children());
        selectColor($(this));
    });

    /* Repeat for background: detect click on background colors */
    $("body").on("click", "#background-colors .color-choice", function() {
        /* Set background color accordingly */
        $("body").css("background", $(this).css("background-color"))

        /* Deselect everyone & then select this one */
        deselectColor($("#background-colors").children());
        selectColor($(this));
    });

    /* Detect when increase text size option clicked */
    $("#increase-text-size").click(function() {
        changeWordSizeBy(4);
    });

    /* Detect when decrease text size option clicked */
    $("#decrease-text-size").click(function() {
        changeWordSizeBy(-4);
    });

    /* Switches text and background colors */
    $("#color-reverse").click(function() {
        /* Get the colors */
        backgroundColor = $("body").css("background-color");
        textColor = $("#word").css("color");

        /* Switch them */
        $("body").css("background-color", textColor);
        $("#word").css("color", backgroundColor);
    });

    /* Changes font to user input - detects when key pressed */
    $(document).on('keypress',function(e) {
        /* Check 'Enter' key & focus on font input */
        if(e.which == 13) {
            if ($("#font-input").is(":focus")) {
                font = sanitize($("#font-input").val()); /* Get font name */
                /* Set word, font input to font */
                $("#word").css("font-family", font);
                $("#font-input").css("font-family", font);
            }
        }
    });
});
