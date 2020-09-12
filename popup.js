var quotations = null;
chrome.runtime.getPackageDirectoryEntry(function(root) {
    root.getFile("quotations.json", {}, function(fileEntry) {
        fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                quotations = JSON.parse(this.result)["quotations"];
                chrome.storage.sync.get({"index": 0}, function(data) {
                    document.getElementById("quotationDisplay").innerHTML = "\"".concat(quotations[data.index]["quotation"].concat("\""));
                    document.getElementById("authorDisplay").innerHTML = "- ".concat(quotations[data.index]["author"]);
                });
                var numHidden = 0;
                for (var i = 0; i < quotations.length; i++) {
                    if (quotations[i]["hidden"] == true) {
                        numHidden += 1;
                    }
                }
                chrome.storage.sync.set({"numHidden": numHidden});
            };
            reader.readAsText(file);
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // buttons
    var shuffle = document.getElementById("shuffle");
    var hide = document.getElementById("hide");
    var add = document.getElementById("add");
    var reset = document.getElementById("reset");

    // get a different, unhidden quote and update the current index
    shuffle.addEventListener("click", function() {
        var newIndex = null;
        var foundIndex = false;
        while (!foundIndex) {
            newIndex = Math.floor(Math.random() * (quotations.length));
            if (quotations[newIndex]["hidden"] == false) {
                foundIndex = true;
            }
        }
        chrome.storage.sync.set({"index": newIndex});
        document.getElementById("quotationDisplay").innerHTML = "\"".concat(quotations[newIndex]["quotation"].concat("\""));
        document.getElementById("authorDisplay").innerHTML = "- ".concat(quotations[newIndex]["author"]);
    });

    // hide the current quotation if there would be 2+ quotations left unhidden
    hide.addEventListener("click", function() {
        // var numHidden;
        // chrome.storage.sync.get("numHidden", function(data) {
        //     numHidden = data.numHidden;
        // });

        // if (numHidden + 2 == quotations.length) {
        //     alert("At least two quotations must be enabled. If you would like to hide this one, please first add a new one.");
        // } else {
            chrome.storage.sync.get("index", function(data) {
                quotations[data.index]["hidden"] = true;
            });
        //     chrome.storage.sync.set({"numHidden": (numHidden + 1)});
        // }
    });

    // add a custom quotation
    add.addEventListener("click", function() {
        var addQuotation = document.getElementById("addQuotation").value;
        var addAuthor = document.getElementById("addAuthor").value;
        if ((addQuotation == "") || (addAuthor == "")) {
            alert("Please fill in both fields.")
        } else {
            quotations.push({
                "quotation": addQuotation,
                "author": addAuthor,
                "hidden": false,
                "base": false});
            document.getElementById("addQuotation").value = "";
            document.getElementById("addAuthor").value = "";
        }
    });

    reset.addEventListener("click", function() {
        for (var i = 0; i < quotations.length; i++) {
            quotations[i]["hidden"] = false;
        }
        chrome.storage.sync.set({"numHidden": 0});
    });
})