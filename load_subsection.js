import {UL_kernel} from "./UL_kernel.js";
import {Display} from "./Display.js"

var UL = new UL_kernel();
var display;
const canvas = document.getElementById('UL_kernel');

window.onload = init

const asyn_subsection = async (path) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            //console.log(path)
            var ret = doGET(path).then(handleFileData)
            resolve(ret)
        });
    });
};

var chapterNames = [
    "Rules of Operators",
    "Rules of Three Fundamental Relationships",

    // "Addition",
    // "Next Order Induction",
    // "Rules of Relationship of Node Connectivity",
    // "Swap Theorems of the Same Operand",
    // "Theorems of Assign Operator",
    // "Theorems of Delete Node Function Del(j)",
    // "Theorems of Insert Node Function Ins(t;j)",
    // "Theorems of Operators and Relationships",
    // "Theorems of Relationship of Node Null Comparison",
    // "Theorems of Relationship of Node Value Comparison",
    // "Tree Order Induction",
    // "Axioms of Assign Operator",
    // "Function Cpo(r)",
    // "Multiplication",
    // "Next Order Induction",
    // "paradox",
    // "Previous Order Induction",
    // "Recursive Function R_(i)",
    // "Recursive Function R(i)",
    // "Recursive Function Rc(i;j)",
    // "Recursive Function Rcpm(i;j;r)",
    // "Recursive Function Rcpo(i;r)",
    // "Rules of Assign Operator in Temporary Space",
    // "Rules of Empty Branch Function",
    // "Rules of Node Ring",
    // "Rules of Number Equal Relationship",
    // "Rules of Number More Than and Less Than Relationship",
]

const parsedChapters = []
var sub_section_index = {}

for(let i = 0; i <= chapterNames.length-1; i++){
    parsedChapters.push(await asyn_subsection("./database/latex/" +chapterNames[i]+".tex"))
}
// console.log(parsedChapters)
create_sections(parsedChapters)

let btns = document.getElementsByTagName("button")
    //console.log(btns)
    for (var i = 0; i < btns.length; i++)
    {
        btns[i].onclick = function()
        {
            document.getElementById("section-name").innerHTML = this.innerHTML
            console.log(this.innerHTML)
            console.log(document.getElementById("section-name").innerHTML)

            init()         
        };
}


function init() {

    console.log("window loaded")
    
    //UL.StringTable = rule_of_operator
    //let parsed_strTable

    let btnTitle = document.getElementById("section-name").innerHTML

    //extract subsection to parsed_strTable
    let add = false

    //reset stringtable
    UL.StringTable = []
    UL.subsectionsIndex = []
    UL.subsubsectionsIndex = []
    let numSubSec = 0
    let numSubSubSec = 0
    //console.log(parsedChapters)
    for(let i = 0; i < parsedChapters.length; i++){

        let chapter = parsedChapters[i]
        console.log(chapter.length)
        let subsection = [];
        let subsubsection = [];
        let offset;
        let sectionFound= false;
        let index = 0;
        let j = 0;
        
        for(; j < chapter.length; j ++,index ++) {
            let line = chapter[j]
            console.log(line)
            offset = numSubSubSec+numSubSec+2
            if(line[0] === "#"){
                console.log(line)
                if(line.includes(btnTitle)){
                    UL.title = line.slice(1,line.length)
                    console.log(UL.title)
                    //detect section title
                    add = !add
                    sectionFound = true;
                    index = 1
                    continue
                }
                if(add){
                    console.log("break")
                    //if already adding, then finished parsing section
                    break;
                }
            }
            else if(sectionFound){
                if(line[0] === "%"){
                    // console.log(line,subsubsection)
                    numSubSubSec += 1
                    if(subsubsection.length===0){
                        subsubsection.push(line.slice(1,line.length))
                        subsubsection.push(index-(offset))    
                    }
                    else if(subsubsection.length===2){
                        subsubsection.push(index-(offset))
                        UL.subsubsectionsIndex.push(subsubsection)
                        subsubsection = []
                        subsubsection.push(line.slice(1,line.length))
                        subsubsection.push(index-(offset))
                    }
                    else{
                        console.log("parsing subsubsection error")
                    }
                }
                else if(line[0] === "$"){
                    // console.log(numSubSubSec,numSubSec)
                    console.log(line, subsection)
                    numSubSec += 1
                    if(subsection.length===0){
                        //should -2 because chapter name and section name
                        subsection.push(line.slice(1,line.length))
                        subsection.push(index-(offset))
                    }
                    else if(subsection.length===2){
                        subsection.push(index-(offset))
                        UL.subsectionsIndex.push(subsection)
                        subsection = []
                        subsection.push(line.slice(1,line.length))
                        subsection.push(index-(offset))
                        // console.log(line, subsection)

                    }
                    
                    else{
                        console.log("parsing subsection error")
                    }
                }
                else if(add) {
                    //console.log("here")
                    // console.log(line)
                    UL.StringTable.push(line)
                }
            }
            else{
                console.log("not found")
            }
        }
        if(j === chapter.length && sectionFound){
            // console.log("here", UL.subsectionsIndex, j)
            //console.log("here",j,chapter.length)
            //edge cases
            if(subsection.length === 2) {
                subsection.push(index-(offset))
                UL.subsectionsIndex.push(subsection)
                subsection = []
            }
            if(subsubsection.length === 2) {
                subsubsection.push(index-(offset))
                UL.subsubsectionsIndex.push(subsubsection)
                subsubsection = []
            }   
            break;
        }
    }

    console.log(UL.subsectionsIndex,UL.subsubsectionsIndex)
    //display title
    document.title = UL.title
    document.getElementById('title').innerHTML = UL.title

    UL.init()
    display = new Display(UL, canvas)
    display.init()    
}

async function doGET(path) {
    const promise = new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                // The request is done; did it work?
                if (xhr.status == 200) {
                    // ***Yes, use `xhr.responseText` here***
                    xhr.onload = () => {
                        resolve(xhr.responseText)
                    }
                    //var a = callback(xhr.responseText);                        
                } else {
                    // ***No, tell the callback the call failed***
                    //callback(null);
                }
            }
        };
        
        xhr.send();
    })
    return promise;
}


function handleFileData(fileData) {
    //console.log("handling data")

    let beginMath = false
    
    if (!fileData) {
        // Show error
        return;
    }
    const tempTable = []
    const theorems = fileData.split('\n')
    //console.log(theorems)
    for(const line of theorems) {
        // console.log(line.length)
        var parsed_line = ""

        if(line.includes("\\begin{math}")){
            beginMath = true
            continue
        }
        if(line.includes("\\end{math}")) {
            beginMath = false
            continue
        }

        parsed_line = line
        let i = parsed_line.length-1
        let j = 0
        while(i > 0 && (parsed_line[i] === "\\" || parsed_line[i] === " ")){
            i--
        }
        while(j < parsed_line.length-1 && parsed_line[j] === " "){
            j++
        }
        parsed_line = parsed_line.slice(j,i+1)
        // console.log(parsed_line)

        if(parsed_line.length <= 1) {continue}
        else if((parsed_line.includes("\\[") && parsed_line.includes("\\]"))){
            tempTable.push(parsed_line)
        }
        else if(parsed_line.toLowerCase().includes("chapter")){
            parsed_line = parsed_line.replace("\\chapter","@").replace("{","").replace("}","")
            tempTable.push(parsed_line)
            //console.log(parsed_line)
        }
        else if(parsed_line.toLowerCase().includes("subsubsection")){
            parsed_line = parsed_line.replace("\\subsubsection","%").replace("{","").replace("}","")
            tempTable.push(parsed_line)
        }
        else if(parsed_line.toLowerCase().includes("subsection")){
            parsed_line = parsed_line.replace("\\subsection","$").replace("{","").replace("}","")
            tempTable.push(parsed_line)
        }
        else if(parsed_line.toLowerCase().includes("section")){
            parsed_line = parsed_line.replace("\\section","#").replace("{","").replace("}","")
            tempTable.push(parsed_line)
        }
        else if(beginMath){
            //add in \\[\\]
            // parsed_line = "\\[" + parsed_line + "\\]"
            // tempTable.push(parsed_line)
        }
        else {continue}

    }
    //console.log("done")
    // for(const o of theorems) {
    //     console.log(o, o.length)
    // }
    return tempTable;
}

function create_sections(parsed_chapters){

    //section is list of section name 
    // get toc_ul
    var toc_ul = document.getElementById("toc-ul");
    //console.log(toc_ul)

    for(let i = 0; i < parsed_chapters.length;i++) {
        let chapter = parsed_chapters[i]
        //console.log(chapter)
        var chapterName = ""

        var drop_down;
        //look for chapter name if not found return error
        for(let j = 0 ; j < chapter.length; j++ ) {
            let name = chapter[j]
            
            //console.log(name)
            var span;
            var span2;

            //dectect chapter name
            if(name[0] === "@"){
                chapterName = name.slice(1,name.length)
                //console.log(chapterName)

                //create chapter name span 
                drop_down = document.createElement("div");
                drop_down.classList.add("dropdown")
            
                span = document.createElement("span")
                span2 = document.createElement("span")
                span2.innerHTML = chapterName                
            }

            //detect section name
            if(name[0] === "#"){
                var sectionName = name.slice(1,name.length)
                //console.log(sectionName)

                if(span === undefined || span2 === undefined || drop_down ===undefined) {
                    console.log("chapter name not found!")
                }
                //create section name button
                var section = document.createElement("div");
                section.classList.add("dropdown-content")
            
                var button = document.createElement("button");
                button.innerHTML = sectionName;
                button.classList.add("center")

                section.appendChild(button)

                //append to chapter span
                span.appendChild(section)
                span2.appendChild(span)
                drop_down.appendChild(span2)

                sub_section_index[sectionName] = String(i) + "_" + String(j)
            }
        }
    
    
        if(drop_down === undefined) {
            console.log("no chapter!")
        }
        var li = document.createElement("li")
        li.classList.add("align-left")
        li.appendChild(drop_down)
        toc_ul.appendChild(li)
    }
}