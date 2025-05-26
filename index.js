function onWindowLoad(){
    let inputElem = document.getElementById("input");
    let outputElem = document.getElementById("output");
    let plOutputElem = document.getElementById("pls_out")
    let submitButton = document.getElementById("submit");
    let copyButton = document.getElementById("copy");
    let donwloadButton = document.getElementById("download");
    let uploadFileElem = document.getElementById("up_file");
    let uploadButton = document.getElementById("up_btn");
    
    let perser = new DOMParser();

    submitButton.addEventListener("click",()=>{
        // console.log("clicked");

        let inputText = inputElem.value;
        let html = perser.parseFromString(inputText,"text/html")

        // console.log(html.body.children[0].children)

        let paragraphs = html.body.children;

        let outputText = "";

        let players = [];

        for(let paragraph of paragraphs){

            let plname = paragraph.children[1].innerText;
            let chat = paragraph.children[2].innerText.trim();

            if(!players.includes(plname)){
                players.push(plname);
            }

            outputText += plname;
            outputText += ",";

            // ""

            outputText += chat;
            outputText += "\n";
        }

        // console.log(outputText)

        outputElem.value = outputText;

        plOutputElem.value = players.toString().replaceAll(",","\n");
    })

    copyButton.addEventListener("click",()=>{
        if(!navigator.clipboard){
            alert("利用できません。")
        }

        navigator.clipboard.writeText(outputElem.value);
    })

    donwloadButton.addEventListener("click",()=>{
        let text = outputElem.value;
        let blob = new Blob([text],{type:"text/csv"});
        let url = URL.createObjectURL(blob);
		
		let a = document.createElement("a");
		a.href = url;
        let now = new Date();

		a.download = `CCF_CSV_${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}.csv`;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
    })

    uploadButton.addEventListener("click",()=>{
        if(!(uploadFileElem.files.length > 0)){
			alert("no FILE")
			return false;
		}

        let file = uploadFileElem.files[0]
		let reader = new FileReader()
		reader.readAsText(file)

        function load(){
            
            inputElem.value = reader.result;
            reader.removeEventListener("load",load)
        }

        reader.addEventListener("load",load)
    })
}

window.addEventListener("load",onWindowLoad);