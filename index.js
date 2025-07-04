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

/** @type HTMLInputElement | null */
let uploadFileElem

/** @type HTMLElement | null */
let uploadButton

/** @type HTMLElement | null */
let charactersOutputElem;

/** @type HTMLElement | null */
let YMMPDownloadButton;

/** @type HTMLSelectElement */
let colorOptionSelectElement;

/** @type HTMLSelectElement */
let typeOptionSelectElement;

/** @type HTMLInputElement */
let scriptFileNameOptionElement;

/** @type HTMLInputElement */
let divideCountOptionElement;

let perser = new DOMParser();

let chat = [];
let characters = [];
let characterInfos = [];
let replaceCharacters = {}
let excludeCharacters = [];

/**@type HTMLTableElement */
let charactersOutputTable

let divideCount = 0;

let type = "csv"

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
	YMMPDownloadButton = document.getElementById("dl_ymmp");

	colorOptionSelectElement = document.getElementById("opt_color")
	typeOptionSelectElement = document.getElementById("opt_type")

	scriptFileNameOptionElement = document.getElementById("opt_sc_fn")
	divideCountOptionElement = document.getElementById("opt_divc")

    submitButton.addEventListener("click",()=>{
        // console.log("clicked");

		chat = []
		characters = []
		characterInfos = []
		replaceCharacters = {}
		excludeCharacters = []

        let inputText = inputElem.value;
        let html = perser.parseFromString(inputText,"text/html")

		type = typeOptionSelectElement.value;

		/**@type HTMLParagraphElement[] */
        let paragraphs = html.body.children;

        for(let paragraph of paragraphs){

			let c = paragraph.style.color.substring(4).slice(0,-1).split(",");
			let color = "#";
			c.forEach((v)=>{
				let int = parseInt(v);
				let str = int.toString(16);
				if(str.length == 1){
					str = "0" + str;
				}
				console.log(int,str)
				color+= str
			})

			// console.log(color);

            let chName = paragraph.children[1].innerText.replaceAll(","," ");
            let chatText = paragraph.children[2].innerText.trim().replaceAll(","," ");

            if(!characters.includes(chName)){

				if(colorOptionSelectElement.value == "default"){
					color = "#888888"
				}

                characters.push(chName);
				characterInfos.push({
					name: chName,
					color: color
				});
            }else{
				if(colorOptionSelectElement.value == "last"){
					console.log(characters.indexOf(chName))
					characterInfos[characters.indexOf(chName)].color = color;
					console.log(characterInfos[characters.indexOf(chName)])
				}
			}

			chat.push([chName,chatText])
        }

		// console.log(charactersInfos);

        outputElem.value = generateScriptText();

        // plOutputElem.value = characters.toString().replaceAll(",","\n");

		charactersOutputTable?.remove();
		charactersOutputTable = generateCharacterListHTML(characterInfos);
		charactersOutputElem.appendChild(charactersOutputTable);

		// console.log(chat)
    })

    copyButton.addEventListener("click",()=>{
        if(!navigator.clipboard){
            alert("利用できません。")
        }

        navigator.clipboard.writeText(outputElem.value);
    })

    donwloadButton.addEventListener("click",()=>{
        let text = outputElem.value;

		let arr = generateScriptArray();

		let now = new Date();
		let dateStr = `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`

		let ext = "";
		let mimeType = "";

		switch (type) {
			case "csv":
				ext = "csv"
				mimeType = "text/csv"
				break;
		
			case "tsv":
				ext = "tsv"
				mimeType = "text/tab-separated-values"
				break;

			case "txt":
				ext = "txt"
				mimeType = "text/plain"
				break;

			default:
				break;
		}

		let fileName = scriptFileNameOptionElement.value;
		if(!fileName){
			fileName = `CCF_CSV_${dateStr}`
		}
		
		if(divideCount > 0){
			let count = 0;

			while(arr.length > 0){

				count++;

				let out = "";

				for(let c = 0;c < divideCount;c++){
					out += arr.shift();

					if(arr.length == 0)break;
				}

				let blob = new Blob([out],{type:mimeType});
        		let url = URL.createObjectURL(blob);

				let a = document.createElement("a");
				a.href = url;
        	
				a.download = `${fileName}_${count}.${ext}`;
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			}
		}else{
			let blob = new Blob([text],{type:mimeType});
        	let url = URL.createObjectURL(blob);

			let a = document.createElement("a");
			a.href = url;
        	
			a.download = `${fileName}.${ext}`;
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		}

		

        
    })

    uploadButton.addEventListener("click",()=>{
        if(!(uploadFileElem.files.length > 0)){
			alert("no FILE")
			return false;
		}

        let file = uploadFileElem.files[0]
		
		let fileName = file.name;
		let fileNameSplit = fileName.split(".");
		if(fileNameSplit.at(-1) == "html"){
			fileNameSplit.splice(-1,1);
		}
		fileName = fileNameSplit.join(".");
		scriptFileNameOptionElement.value = fileName;

		let reader = new FileReader()
		reader.readAsText(file)

        function load(){
            
            inputElem.value = reader.result;
			
            reader.removeEventListener("load",load)
        }

        reader.addEventListener("load",load)
    })

	YMMPDownloadButton.addEventListener("click",()=>{
        let text = JSON.stringify(generateCharacterYMMPJson());
        let blob = new Blob([text],{type:"application/json"});
        let url = URL.createObjectURL(blob);
		
		let a = document.createElement("a");
		a.href = url;
        let now = new Date();

		a.download = `CCF_YMMP_${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}.ymmp`;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
    })

	divideCountOptionElement.addEventListener("change",()=>{
		divideCount = parseInt(divideCountOptionElement.value);
		if(divideCount < 0)divideCount = 0;
		if(isNaN(divideCount))divideCount = 0;
	})
}

window.addEventListener("load",onWindowLoad);

//CSVテキストを生成する
function generateScriptText(){

	let arr = generateScriptArray();
	let outTxt = "";
	for(let v of arr){
		outTxt += v;
	}

	return outTxt;
}

/**
 * 
 * @returns string[]
 */
function generateScriptArray(){
	/** @type string[] */
	let outputArr = [];
	
	chat.forEach((val)=>{
		let name = val[0];
		let chatText = val[1];

		name = name.trim();
		chatText = chatText.trim();

		if(excludeCharacters.includes(name))return;

		if(replaceCharacters[name]){
			name = replaceCharacters[name];
		}

		// name = name.replaceAll(","," ");
		// name = name.replaceAll('"'," ")
		// chatText = chatText.replaceAll(","," ");
        // chatText = chatText.replaceAll('"'," ");

		

		let txt = "";

		switch (type) {
			case "csv":
				name = CSVEscape(name);
				chatText = CSVEscape(chatText);
				txt += name;
				txt += ",";
				txt += chatText;	
				break;
		
			case "tsv":
				name = TSVEscape(name);
				chatText = TSVEscape(chatText);
				txt += name;
				txt += "	";
				txt += chatText;	
				break;

			case "txt":
				name = TXTEscape(name);
				chatText = TXTEscape(chatText);
				txt += name;
				txt += "「";
				txt += chatText;
				txt += "」";	
				break;

			default:
				break;
		}

		txt += "\n";
		outputArr.push(txt);
	})

	return outputArr;
}

/**
 * 
 * @param {string} text 
 * @returns 
 */
function CSVEscape(text){
	return text.replaceAll(","," ").replaceAll('"'," ")
}

/**
 * 
 * @param {string} text 
 * @returns 
 */
function TSVEscape(text){
	return text.replaceAll("	"," ")
}

/**
 * 
 * @param {string} text 
 * @returns 
 */
function TXTEscape(text){
	return text.replaceAll("「"," ").replaceAll("」"," ")
}

//キャラクターリストのDOMを作成する
function generateCharacterListHTML(){
	let tableNode = document.createElement("table");

	let firstTr = document.createElement("tr");

	let excludeTh = document.createElement("th");
	excludeTh.innerText = "除外する"

	let replaceTh = document.createElement("th");
	replaceTh.innerText = "置換"

	let nameTh = document.createElement("th");
	nameTh.innerText = "キャラクター名"

	let colorTh = document.createElement("th");
	colorTh.innerText = "色"

	firstTr.appendChild(excludeTh)
	firstTr.appendChild(nameTh)
	firstTr.appendChild(replaceTh)
	firstTr.appendChild(colorTh)
	tableNode.appendChild(firstTr);

	characterInfos.forEach((val,index)=>{
		let tr = document.createElement("tr");

		let excludeTd = document.createElement("td");
		let excludeCheckBox = document.createElement("input");
		excludeCheckBox.type = "checkbox";
		excludeCheckBox.addEventListener("click",()=>{
			if(excludeCheckBox.checked){
				excludeCharacters.push(val.name);
			}else{
				excludeCharacters.splice(excludeCharacters.indexOf(val.name),1);
			}
			outputElem.value = generateScriptText(chat,excludeCharacters);
		})

		excludeTd.appendChild(excludeCheckBox);

		let nameTd = document.createElement("td");
		nameTd.innerText = val.name;

		let replaceTd = document.createElement("td");
		let replaceInput = document.createElement("input");
		replaceInput.type = "text"
		replaceInput.addEventListener("input",()=>{
			console.log(replaceInput.value)
			replaceCharacters[val.name] = replaceInput.value;
			outputElem.value = generateScriptText(chat,excludeCharacters,replaceCharacters);
		})
		replaceTd.appendChild(replaceInput);

		let colorTd = document.createElement("td");
		// colorTd.innerText = val.color;
        let colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = val.color;
        colorInput.addEventListener("input",()=>{
            characterInfos[index].color = colorInput.value;
            // console.log(charactersInfos[index].color);
        })
        colorTd.appendChild(colorInput);

		tr.appendChild(excludeTd);
		tr.appendChild(nameTd);
		tr.appendChild(replaceTd);
		tr.appendChild(colorTd);
		tableNode.appendChild(tr);
	})

	return tableNode;
}

/**
 * 
 * @returns 
 */
function generateCharacterYMMPJson(){

	let ymmp = new YMMP();

	characterInfos.forEach((val)=>{

		let name = val.name;
		let color = val.color;

		if(excludeCharacters.includes(name))return;
		if(name in replaceCharacters)name = replaceCharacters[name];

		let ycs = new YMMCharacterSettings()
		ycs.Name = name;
		ycs.Color = val.color;
		
		ycs.StyleColor = val.color;

		ymmp.Characters.push(ycs)
	})

	return ymmp;
}

class YMMP{
	/** @type YMMCharacterSettings[] */
	Characters = []
}

class YMMCharacterSettings{
	Name = "Name"
	GroupName = "CCF-YMM-DEFAULT"
	Color = "#FFFFFF00"
	// Layer = 0
	// KeyGesture = {
	// 	"Key" : 75,
	// 	"Modifiers" : 2
	// }
	Voice = {
		"API" : "AquesTalk",
		"Arg" : "f1"
	}
	Volume = {
		"Values" : [
			{
				"Value" : 100.0
			}
		],
		"Span" : 0.0,
		"AnimationType": "なし"
	}
	Pan = {
		"Values" : [
			{
				"Value" : 0.0
			}
		],
		"Span" : 0.0,
		"AnimationType": "なし"
	}
	PlaybackRate = 100.0
	VoiceParameter = {
        "$type": "YukkuriMovieMaker.Voice.AquesTalk1VoiceParameter, YukkuriMovieMaker",
    	"Speed": 130,
    	"EngineVersion": "V1_7"
    }
	AdditionalTime = 0.1

	X = {
		"Values": [
            {
            	"Value": 0.0
            }
        ],
        "Span": 0.0,
        "AnimationType": "なし"
	}
	Y = {
		"Values": [
            {
            	"Value": 500
            }
        ],
        "Span": 0.0,
        "AnimationType": "なし"
	}
	Z = {
		"Values": [
            {
            	"Value": 0.0
            }
        ],
        "Span": 0.0,
        "AnimationType": "なし"
	}

	FontSize = {
		"Values": [
            {
            	"Value": 50.0
            }
        ],
        "Span": 0.0,
        "AnimationType": "なし"
	}

	WordWrap = "WholeWord"
	MaxWidth = {
		"Values": [
            {
            	"Value": 1900.0
            }
        ],
        "Span": 0.0,
        "AnimationType": "なし"
	}

	BasePoint = "CenterBottom"
	FontColor = "#FFFFFFFF"
	Style = "Border"
	StyleColor = "#FFFF0000"
	JimakuVideoEffects = []

}