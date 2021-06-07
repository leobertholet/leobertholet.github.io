colorChoicesXML = ""
+ "<colorChoices>"
    + "<textColors>"
        + "<color>black</color>"
        + "<color>#d77c69</color>"
        + "<color>lightsalmon</color>"
        + "<color>#fac655</color>"
        + "<color>#8fd769</color>"
        + "<color>#699cd7</color>"
        + "<color>plum</color>"
    + "</textColors>"
    + "<backgroundColors>"
        + "<color>white</color>"
        + "<color>papayawhip</color>"
        + "<color>gainsboro</color>"
        + "<color>lavender</color>"
        + "<color>powderblue</color>"
    + "</backgroundColors>"
+ "</colorChoices>";

words = ["hi",
         "iguana",
         "schadenfreude",
         "octet",
         "flex",
         "woke",
         ";)",
         ":/",
         "umm",
         "welp",
         "okayy",
         "singularity"
        ];

/* >= min, < max. stolen from mozilla  */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

$(document).ready(function() {
    randInt = getRandomInt(0, words.length);
    startWord = words[randInt];
    $("#word").attr("value", startWord);
    

    parser = new DOMParser();
    xmlDoc = parser.parseFromString(colorChoicesXML, "text/xml");
    textColors = xmlDoc.getElementsByTagName("textColors")[0].childNodes;

    for (i = 0; i < textColors.length; i++) {
        $("#text-colors").append("<div class=\"color-choice\"></div>");
        color = textColors[i].childNodes[0].nodeValue;
        $("#text-colors").children().eq(i).css("background", color);
    }

    /* repeat for background */
    backgroundColors = xmlDoc.getElementsByTagName("backgroundColors")[0].childNodes;

    for (i = 0; i < backgroundColors.length; i++) {
        $("#background-colors").append("<div class=\"color-choice\"></div>");
        color = backgroundColors[i].childNodes[0].nodeValue;
        $("#background-colors").children().eq(i).css("background", color);
    }

    /* select first one text */
    $("#text-colors").children().eq(0).css("border-width", "0px");
    $("#text-colors").children().eq(0).css("width", "31px");
    $("#text-colors").children().eq(0).css("height", "31px");

    /* select first one background */
    $("#background-colors").children().eq(0).css("border-width", "0px");
    $("#background-colors").children().eq(0).css("width", "31px");
    $("#background-colors").children().eq(0).css("height", "31px");

    /* make font color of first one */
    firstColor = $("#text-colors").children().eq(0).css("background-color")
    $("#word").css("color", firstColor)

    /* same for bgnd*/
    firstColor = $("#background-colors").children().eq(0).css("background-color")
    $("body").css("background", firstColor)


    $("body").on("click", "#text-colors .color-choice", function() {
        $("#word").css("color", $(this).css("background-color"))

        /* deseclect everyone else*/
        $("#text-colors").children().css("border-width", "7.5px");
        $("#text-colors").children().css("width", "16px");
        $("#text-colors").children().css("height", "16px");

        /*select this one */
        $(this).css("border-width", "0px");
        $(this).css("width", "31px");
        $(this).css("height", "31px");
    });

    /* same for bgnd */
    $("body").on("click", "#background-colors .color-choice", function() {
        $("body").css("background", $(this).css("background-color"))

        /* deseclect everyone else*/
        $("#background-colors").children().css("border-width", "7.5px");
        $("#background-colors").children().css("width", "16px");
        $("#background-colors").children().css("height", "16px");

        /*select this one */
        $(this).css("border-width", "0px");
        $(this).css("width", "31px");
        $(this).css("height", "31px");
    });

    $("#increase-text-size").click(function() {
        currSize = $("#word").css("font-size").slice(0,-2);
        newSize = parseInt(currSize) + 4;
        newSize = newSize.toString() + "px";
        $("#word").css("font-size", newSize);
    });

    $("#decrease-text-size").click(function() {
        currSize = $("#word").css("font-size").slice(0,-2);
        newSize = parseInt(currSize) - 4;
        newSize = newSize.toString() + "px";
        $("#word").css("font-size", newSize);
    });

    $("#color-reverse").click(function() {
        backgroundColor = $("body").css("background-color");
        textColor = $("#word").css("color");

        $("body").css("background-color", textColor);
        $("#word").css("color", backgroundColor);
    });

/* SANITIZE INPUT LATER!!!!!! */
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            if ($("#font-input").is(":focus")) {
                font = $("#font-input").val();
                $("#word").css("font-family", font);
                $("#font-input").css("font-family", font);
            }

        }
    });
});
