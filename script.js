// All elements of Seachbox
let searchBox = document.getElementById("search"),
    searchedWord = searchBox.value,
    clearSearchBtn = document.getElementById("clear_search"),
    searchBtn = document.getElementById("search_btn");


// Function to toggle the visibility of any item
function buttonVisibility(isTrue, elemToHide) {
    if (isTrue) {
        elemToHide.style.opacity = "0";
        elemToHide.style.pointerEvents = "none";
    } else {
        elemToHide.style.opacity = "1";
        elemToHide.style.pointerEvents = "all";
    }
}

// Call buttonVisibility() for Clear Button
buttonVisibility(searchBox.value == "", clearSearchBtn);


// Call buttonVisibility() for Clear Button oninput on seach input
searchBox.addEventListener('input', () => {
    buttonVisibility(searchBox.value == "", clearSearchBtn);
})

// clearSearchBtn onclick, clear the value of search input
clearSearchBtn.onclick = () => searchBox.value = "";



////////////////////////////////////////////////////////
// ///////////////////// FETCHING THE DATA

// Searched word status (found or not) display element
let mainWrap = document.querySelector(".word-data-wrapper");


let searched_word_container = `<span id="searched_text">${searchedWord}</span>`;

// HTML ELements to hold data and display data
let searchStatusBox = document.getElementById("status_box");

let phoneticWrap = document.querySelector(".phonetic-wrapper");
let similarWrap = document.querySelector(".similar-wrapper");
let oppositeWrap = document.querySelector(".opposite-wrapper");
let definitionWrap = document.querySelector(".definition-section");

similarWrap.style.border = "none"
oppositeWrap.style.border = "none"

// FUNCTION TO FETCH ALL THE DATA
getData = (word) => {
    // Dictionary API Url
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    searchStatusBox.innerHTML = "Searching..."

    // Fetch url
    fetch(url).then((response) => {
        // If responded 404 i.e. the word not found
        if (response.status >= 400) {
            mainWrap.classList.add("word-error");
            // Show status that the word not found 

            searchStatusBox.className = "word-error";
            searchStatusBox.innerHTML = `<img src="images/illus-error.svg" alt="">
            <br> Sorry, couldn't find "<span id="searched_word">${searchedWord}</span>". <br> Try searching a different word.`

            // And just return false
            return false;
        } else {
            mainWrap.classList.remove("word-error");
            // The word found and show success status
            searchStatusBox.className = "word-success";
            searchStatusBox.innerHTML = `<span id="searched_word">${searchedWord}</span>`;

            similarWrap.style.border = `1px solid var(--text)`;
            oppositeWrap.style.border = `1px solid var(--text)`;

            // Return response.json();
            return response.json();
        }
    }).then((data) => {
        // an array was return but with only one element
        // Stored json data in data 
        data = data[0];
        if (data == undefined) {
            return false;
        } else {
            // Class to store all the terms of Data
            // class WordTerms STARTS
            class WordTerms {
                constructor() {
                    // Take only required data from json objects and arrays compliated structures
                    this.word = data.word;
                    this.phonetic = data.phonetics;
                    this.phonetic.forEach(item => {
                        if (item.text != undefined) {
                            this.phonetic = item.text;
                        }
                    })
                    this.meanings = data.meanings;
                    // data.meanings contain
                    /*
                    data.meanings = [
                        {
                            antonymsA: []
                            synonymsA: []
                            partOfSpeech:
                            definitions: [
                                {
                                    definition: ""
                                    antonym: []
                                    synonym: []
                                }
                            ]
                        },
                        {...}, {...}
                    ]
                    */

                    // Taking all the antonyms array in data.meaning objects and their children
                    this.antonyms = [];
                    this.antonyms = destructArrays(this.meanings, this.antonyms, antonymsFromObj);

                    // Taking all the synonym array in data.meaning objects and their children
                    this.synonyms = [];
                    this.synonyms = destructArrays(this.meanings, this.synonyms, synonymsFromObj);

                    // A function to return a final array having all the direct items from the arrays in objects and child objects
                    function destructArrays(originalStruc, finalArray, toGet) {
                        // Makig array of arrays from child
                        let nestedArray = [];
                        toGet(originalStruc, nestedArray);
                        // Output = [[x, x, x], [x, x, x], [x, x, x]]

                        // Destructuring each array from the arrays
                        for (let i = 0; i < nestedArray.length; i++) {
                            let oneNestedArray = nestedArray[i]
                            for (let j = 0; j < oneNestedArray.length; j++) {
                                finalArray.push(oneNestedArray[j]);
                            }
                        }
                        // Output = [x, x, x, x, x, x, x, x, x]
                        finalArray = removeDup(finalArray);
                        return finalArray;
                    }

                    // Function to remove all duplicates from an array
                    function removeDup(original) {
                        let unique = []
                        original.forEach(item => {
                            if (!unique.includes(item)) {
                                unique.push(item);
                            }
                        })
                        return unique;
                    }

                    // Collect all synonyms from the objects and childs
                    function synonymsFromObj(originalStruc, nestedArray) {
                        for (let i = 0; i < originalStruc.length; i++) {
                            nestedArray.push(
                                originalStruc[i].synonyms
                            );
                        }
                    }

                    // Collect all antonyms from the objects and childs
                    function antonymsFromObj(originalStruc, nestedArray) {
                        for (let i = 0; i < originalStruc.length; i++) {
                            nestedArray.push(
                                originalStruc[i].antonyms
                            );
                        }
                    }


                    // List out definitions and partOfSpeech in an array of objects
                    this.definitions = [];
                    /* meanings = [
                        partOfSpeech: ""
                        definition: []
                    ]
                    */
                    data.meanings.forEach(meaningBox => {

                        let definitionObj = {
                            partOfSpeech: meaningBox.partOfSpeech,
                            definitions: meaningBox.definitions
                        }
                        this.definitions.push(definitionObj)

                    });
                    // Output - this.definition = [{partOfSpeech: string, definition: array}, {...}, {...}]
                    this.definitions = removeDup(this.definitions)
                    console.log(this.definitions);
                }

            }
            // class WordTerms ENDS

            // Create an object to to store all the data
            let obj = new WordTerms();

            phoneticWrap.innerHTML = `  <!-- Pronounce Button -->
            <button id="pronounce_btn" class="phonetic-illus">
                <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 50 50"><path d="M14.25 36V12h3v24Zm8.25 8V4h3v40ZM6 28v-8h3v8Zm24.75 8V12h3v24ZM39 28v-8h3v8Z"/></svg>
            </button>

            <p class="phonetic">
                ${obj.phonetic}
            </p>
`;

            function termsDisplay(obj, wrapper, termName, errorText) {
                if (obj.length == 0) {
                    wrapper.className = `${termName}-wrapper no-${termName}`
                    wrapper.innerHTML = `
        <h3>${errorText}</h3>
        `
                } else {
                    let simiStr = "";
                    obj.forEach(item => {
                        simiStr += `<button class="${termName}-word">${item}</button>`
                    })
                    wrapper.innerHTML = `<h2>${termName}</h2><div class="${termName}-box">${simiStr}</div>`
                }

            }

            termsDisplay(obj.synonyms, similarWrap, `similar`, `No similar words`);
            termsDisplay(obj.antonyms, oppositeWrap, `opposite`, `No opposite words`);


            // Putting all definitions
            console.log();
            if (obj.definitions.length == 0) {
                definitionWrap.className = `definition-section no-definitions`
                definitionWrap.innerHTML = `
                <img src="images/illus-definition-error.svg">
        <h2>No Definitions</h2>
        `
            } else {
                obj.definitions.forEach((item) => {
                    defNode = document.createElement('div')
                    defNode.className = `definition-wrapper`
                    partOfSpeechWrap = document.createElement('h3')
                    partOfSpeechWrap.innerHTML = item.partOfSpeech;
                    partOfSpeechWrap.className = `part-of-speech`
                    defNode.append(partOfSpeechWrap);

                    switch (item.partOfSpeech) {
                        case "noun":
                        case "interjection":
                            defNode.style.backgroundColor = "var(--noun-interjection)";
                            break;
                        case "verb":
                        case "preposition":
                            defNode.style.backgroundColor = "var(--verb-preposition)";
                            break;
                        case "adjective":
                        case "conjunction":
                            defNode.style.backgroundColor = "var(--adjective-conjuction)";
                            break;
                        case "adverb":
                        case "exclamation":
                            defNode.style.backgroundColor = "var(--adverb-exclamation)";
                            break;
                        case "pronoun":
                            defNode.style.backgroundColor = "var(--pronoun)";
                            break;

                        default:

                            console.log(defNode);
                            break;
                    }

                    defListBox = document.createElement('ol')
                    defListBox.className = 'definition-box';
                    defNode.append(defListBox);
                    let str = "";
                    item.definitions.forEach((elem) => {
                        str += `<li class="definition">${elem.definition}</li>`
                    })
                    defListBox.innerHTML = `${str}`;
                    definitionWrap.append(defNode);
                })
            }

            return obj;
        }
    })
}


searchBtn.addEventListener('click', () => {
    searchedWord = searchBox.value;
    getData(searchedWord);
})