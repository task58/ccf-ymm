function onWindowLoad(){
    let inputElem = document.getElementById("input");
    let outputElem = document.getElementById("output");
    let submitButton = document.getElementById("submit");
    let copyButton = document.getElementById("copy");

    let perser = new DOMParser();

    submitButton.addEventListener("click",()=>{
        // console.log("clicked");

        let inputText = inputElem.value;
        let html = perser.parseFromString(inputText,"text/html")

        // console.log(html.body.children[0].children)

        let paragraphs = html.body.children;

        let outputText = "";

        for(let paragraph of paragraphs){

            outputText += paragraph.children[1].innerText;
            outputText += ",";

            outputText += paragraph.children[2].innerText.slice(5);
            outputText += "\n";
        }

        // console.log(outputText)

        outputElem.value = outputText;
    })

    copyButton.addEventListener("click",()=>{
        if(!navigator.clipboard){
            alert("利用できません。")
        }

        navigator.clipboard.writeText(outputElem.value);
    })
}

window.addEventListener("load",onWindowLoad);