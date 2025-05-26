/** @type HTMLElement | null */
let inputElem

/** @type HTMLElement | null */
let outputElem

/** @type HTMLElement | null */
// let plOutputElem

/** @type HTMLElement | null */
let submitButton

/** @type HTMLElement | null */
let copyButton

/** @type HTMLElement | null */
let donwloadButton

/** @type HTMLElement | null */
let uploadFileElem

/** @type HTMLElement | null */
let uploadButton

/** @type HTMLElement | null */
let charactersOutputElem;

let perser = new DOMParser();

let chat = [];
let characters = [];
let excludeCharacters = [];

/**@type HTMLTableElement */
let charactersOutputTable

function onWindowLoad(){
    inputElem = document.getElementById("input");
    outputElem = document.getElementById("output");
    // plOutputElem = document.getElementById("pls_out")
    submitButton = document.getElementById("submit");
    copyButton = document.getElementById("copy");
    donwloadButton = document.getElementById("download");
    uploadFileElem = document.getElementById("up_file");
    uploadButton = document.getElementById("up_btn");
	charactersOutputElem = document.getElementById("ch_out");

    submitButton.addEventListener("click",()=>{
        // console.log("clicked");

		chat = []
		characters = []

        let inputText = inputElem.value;
        let html = perser.parseFromString(inputText,"text/html")

        let paragraphs = html.body.children;

        for(let paragraph of paragraphs){

            let chName = paragraph.children[1].innerText.replaceAll(","," ");
            let chatText = paragraph.children[2].innerText.trim().replaceAll(","," ");

            if(!characters.includes(chName)){
                characters.push(chName);
            }

			chat.push([chName,chatText])
        }


        outputElem.value = generateCSVText(chat);

        // plOutputElem.value = characters.toString().replaceAll(",","\n");

		charactersOutputTable?.remove();
		charactersOutputTable = generateCharacterListHTML(characters);
		charactersOutputElem.appendChild(charactersOutputTable);

		console.log(chat)
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

/**
 * 
 * @param {string[][]} chatArr 
 * @param {string[]} excludeCharacters 
 */
function generateCSVText(chatArr,excludeCharacters = []){
	let outputText = "";
	
	chatArr.forEach((val)=>{
		let name = val[0];
		let chatText = val[1];

		name = name.trim();
		chatText = chatText.trim();

		if(excludeCharacters.includes(name))return;

		name.replaceAll(","," ");
		chatText.replaceAll(","," ");

		outputText += name;
		outputText += ",";
		outputText += chatText;
		outputText += "\n";
	})

	return outputText;
}

/**
 * 
 * @param {string[]} characters 
 */
function generateCharacterListHTML(characters){
	let tableNode = document.createElement("table");

	let firstTr = document.createElement("tr");
	let th1 = document.createElement("th")
	th1.innerText = "Name"
	firstTr.appendChild(th1)
	tableNode.appendChild(firstTr);

	characters.forEach((val)=>{
		let tr2 = document.createElement("tr");

		let nameTd = document.createElement("td");
		nameTd.innerText = val;
		tr2.appendChild(nameTd);
		tableNode.appendChild(tr2);
	})


	return tableNode;
}