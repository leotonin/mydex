/**
 * MyDex frontend manager and utility functions.
 * 
 * @version 1.0
 * @author Antonio Leonardo G.
 */

// (Constant) Amount of Pokémon to show for each page
const PKMN_LIMIT_PER_PAGE = 12;

const SUPPORTED_LANGUAGES = ["en", "es"];

// Language settings set by the user
var languageSettings = {
    preferred: "en",
    fallback: "en"
}

// Language-specific error messages
var errorMsg = {
    requestFailed: {
        "es":
            "Error al intentar obtener la información. Por favor, inténtalo de nuevo más tarde.",
        "en":
            "Error trying to retrieve the information. Please try again later."
    },
    descUnavailable: {
        "es": "(Descripción no disponible)",
        "en": "(Description unavailable)"
    }
}

// Language-specific messages
var frontendMsg = {
    nextPage: {
        "es": "Cargar más Pokémon",
        "en": "Load more Pokémon"
    },
    heightTitle: {
        "es": "Altura: ",
        "en": "Height: "
    },
    weightTitle: {
        "es": "Peso: ",
        "en": "Weight: "
    }
}

// Page manager settings
var pagManager = {
    currentPage: 0,
    currentOffset: 0
};

// Cache with information about each type
var cachePkmnTypeInfo = {
    "names": {
        "es": {},
        "en": {}
    }
};

// Cache with Pokémon information that has been collected already
// (Useful for not overloading the API with unnecessary calls)
var cachePkmnInfo = {};

/**
 * Retrieves all information for a Pokémon.
 * 
 * @param {*} id Pokémon ID
 * @returns An object containing the detailed information for the Pokémon
 */
async function getPkmnInfo(id) {
    // Perform the Pokémon request
    const pkmnResp = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!pkmnResp.ok)
        return {"success": false, "respCode": pkmnResp.status};
    // Perform the species request
    const speciesResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (!speciesResp.ok)
        return {"success": false, "respCode": pkmnResp.status};
    // Retrieve the corresponding JSON for each request
    const pkmnJson = await pkmnResp.json();
    const speciesJson = await speciesResp.json();
    return {
        "success": true,
        "respCode": 200,
        "result": {
            "name": (
                speciesJson.names.some(n => n.language.name == languageSettings.preferred) ?
                    speciesJson.names.findLast(n => n.language.name == languageSettings.preferred).name :
                    speciesJson.names.findLast(n => n.language.name == languageSettings.fallback).name
            ),
            "num": id,
            "types": pkmnJson.types,
            "desc": (
                speciesJson.flavor_text_entries.some(n => n.language.name == languageSettings.preferred) ?
                    speciesJson.flavor_text_entries.findLast(n => n.language.name == languageSettings.preferred).flavor_text :
                    errorMsg.descUnavailable[languageSettings.preferred]
            ),
            "height": pkmnJson.height,
            "weight": pkmnJson.weight,
            "img": pkmnJson.sprites.other["official-artwork"].front_default
        }
    };
}

/**
 * Retrieves a collection of Pokémon using a retriever function on each ID in the
 * corresponding range.
 * 
 * @param {*} offset Offset for the API call 
 * @param {*} limit Limit for the API call
 * @param {*} retriever Asynchronous retriever function to apply to each ID
 */
async function getPkmnCollection(offset, limit, retriever) {
    let pkmnList = [];
    for (let i = offset + 1; i <= offset + limit; i++) {
        let pkmnInfo = await retriever(i);
        pkmnList.push(pkmnInfo);
    }
    return pkmnList;
}

/**
 * Formats an integer so that it has exactly n digits, padding with zeros to the left.
 * @param {*} n The integer to format
 * @param {*} numDigits The number of digits the integer should have
 * @returns 
 */
function formatInt(n, numDigits) {
    return ("0".repeat(numDigits - 1) + n).slice(-numDigits)
}

/**
 * Creates a Pokémon card with the given information.
 * @param {*} pkmnInfo The information about the Pokémon
 */
function createPkmnCard(pkmnInfo) {
    /*
     * We need to create the following structure:
     *
     *  <div class="pokemon-card" data-pkmn-name=pkmnInfo.name data-pkmn-id=pkmnInfo.num>
     *      <a href="#" class="pokemon-card-img-clickable">
     *          <img class="pokemon-card-img" src=pkmnInfo.img />
     *      </a>
     *      <div class="pokemon-card-info">
     *          <p class="pokemon-card-name">pkmnInfo.name</p>
     *          <p class="pokemon-card-num">`#${formatInt(pkmnInfo.num, 3)}`</p>
     *      </div>
     *  </div>
     */
    //  <div class="pokemon-card" data-pkmn-name=pkmnInfo.name data-pkmn-id=pkmnInfo.num>
    let pkmnCard = document.createElement("div");
    pkmnCard.setAttribute("class", "pokemon-card");
    pkmnCard.setAttribute("data-pkmn-name", pkmnInfo.name);
    pkmnCard.setAttribute("data-pkmn-id", pkmnInfo.num);
    //      <a href="#" class="pokemon-card-img-clickable">
    let pkmnCardImgClickable = document.createElement("a");
    pkmnCardImgClickable.setAttribute("href", "#");
    pkmnCardImgClickable.setAttribute("class", "pokemon-card-img-clickable");
    //          <img class="pokemon-card-img" src=pkmnInfo.img loading="lazy" />
    let pkmnCardImg = document.createElement("img");
    pkmnCardImg.setAttribute("class", "pokemon-card-img");
    pkmnCardImg.setAttribute("src", pkmnInfo.img);
    pkmnCardImg.setAttribute("loading", "lazy");
    pkmnCardImgClickable.appendChild(pkmnCardImg);
    //      </a>
    pkmnCard.appendChild(pkmnCardImgClickable);  
    //      <div class="pokemon-card-info">
    let pkmnCardInfo = document.createElement("div");
    pkmnCardInfo.setAttribute("class", "pokemon-card-info");
    //          <p class="pokemon-card-name">
    let pkmnCardName = document.createElement("p");
    pkmnCardName.setAttribute("class", "pokemon-card-name");
    //              pkmnInfo.name
    pkmnCardName.textContent = pkmnInfo.name;
    //          </p>
    pkmnCardInfo.appendChild(pkmnCardName);
    //          <p class="pokemon-card-num">
    let pkmnCardNum = document.createElement("p");
    pkmnCardNum.setAttribute("class", "pokemon-card-num");
    //              `#${formatInt(pkmnInfo.num, 3)}`
    pkmnCardNum.textContent = `#${formatInt(pkmnInfo.num, 3)}`;
    //          </p>
    pkmnCardInfo.appendChild(pkmnCardNum);
    //      </div>
    pkmnCard.appendChild(pkmnCardInfo);
    //  </div>
    return pkmnCard;
}

/**
 * Creates a Pokémon info container with the given information.
 * @param {*} pkmnInfo The information about the Pokémon
 */
function createPkmnDetailsContainer(pkmnInfo) {
    /*
     * We need to create the following structure:
     *
     *  <div class="pokemon-details-container">
     *      <div class="pokemon-details-img-container">
     *          <img class="pokemon-details-img" src=pkmnInfo.img loading="lazy"/>
     *      </div>
     *      <div class="pokemon-details-data">
     *          <span class="pokemon-details-name">pkmnInfo.name</span>
     *          <span class="pokemon-details-num">
     *              `#${formatInt(pkmnInfo.num, 3)}`
     *          </span>
     *          <div class="pokemon-details-types">
     *              {% for t in pkmnInfo.types %}
     *              <span class=`pokemon-type pokemon-type-${}`>
     *                  t.
     *              </span>
     *              {% endfor %}
     *          </div>
     *          <div class="pokemon-details-desc">
     *              <p>pkmnInfo.desc</p>
     *          </div>
     *          <div class="pokemon-details-stats">
     *              <p>
     *                  <span class="pokemon-details-stat-name">Altura:</span>
     *                  <span>pkmnInfo.height / 10</span>
     *              <p>
     *              <p>
     *                  <span class="pokemon-details-stat-name">Peso:</span>
     *                  <span>pkmnInfo.weight / 10</span>
     *              </p>
     *          </div>
     *      </div>
     *  </div>
     */
    //  <div class="pokemon-details-container">
    let pkmnDetailsContainer = document.createElement("div");
    pkmnDetailsContainer.setAttribute("class", "pokemon-details-container");
    //      <div class="pokemon-details-img-container">
    let pkmnDetailsImgContainer = document.createElement("div");
    pkmnDetailsImgContainer.setAttribute("class", "pokemon-details-img-container");
    //          <img class="pokemon-details-img" src=pkmnInfo.img loading="lazy"/>
    let pkmnDetailsImg = document.createElement("img");
    pkmnDetailsImg.setAttribute("class", "pokemon-details-img");
    pkmnDetailsImg.setAttribute("src", pkmnInfo.img);
    pkmnDetailsImg.setAttribute("loading", "lazy");
    pkmnDetailsImgContainer.appendChild(pkmnDetailsImg);
    //      </div>
    pkmnDetailsContainer.appendChild(pkmnDetailsImgContainer);
    //      <div class="pokemon-details-data">
    let pkmnDetailsData = document.createElement("div");
    pkmnDetailsData.setAttribute("class", "pokemon-details-data");
    //          <div class="pokemon-details-header">
    let pkmnDetailsHeader = document.createElement("div");
    pkmnDetailsHeader.setAttribute("class", "pokemon-details-header");
    //              <span class="pokemon-details-name">
    let pkmnDetailsName = document.createElement("span");
    pkmnDetailsName.setAttribute("class", "pokemon-details-name");
    //                  pkmnInfo.name
    pkmnDetailsName.textContent = pkmnInfo.name;
    //              </span>
    pkmnDetailsHeader.appendChild(pkmnDetailsName);
    //              <span class="pokemon-details-num">
    let pkmnDetailsNum = document.createElement("span");
    pkmnDetailsNum.setAttribute("class", "pokemon-details-num");
    //                  `#${formatInt(pkmnInfo.num, 3)}`
    pkmnDetailsNum.textContent = `#${formatInt(pkmnInfo.num, 3)}`;
    //              </span>
    pkmnDetailsHeader.appendChild(pkmnDetailsNum);
    //          </div>
    pkmnDetailsData.appendChild(pkmnDetailsHeader);
    //          <div class="pokemon-details-types">
    let pkmnDetailsTypes = document.createElement("div");
    pkmnDetailsTypes.setAttribute("class", "pokemon-details-types");
    //              {% for t in pkmnInfo.types %}
    //              <span class=`pokemon-type pokemon-type-${t.name}`>
    //                  cachePkmnTypeInfo.names[t.name]
    //              </span>
    pkmnInfo.types.forEach(t => {
        let currentPkmnType = document.createElement("span");
        currentPkmnType.classList.add("pokemon-type");
        currentPkmnType.classList.add(`pokemon-type-${t.type.name}`);
        console.log(cachePkmnTypeInfo.names[languageSettings.preferred][t.type.name]);
        currentPkmnType.textContent =
            cachePkmnTypeInfo.names[languageSettings.preferred][t.type.name];
        pkmnDetailsTypes.appendChild(currentPkmnType);
    });
    //          </div>
    pkmnDetailsData.appendChild(pkmnDetailsTypes);
    //          <div class="pokemon-details-desc">
    let pkmnDetailsDescContainer = document.createElement("div");
    pkmnDetailsDescContainer.setAttribute("class", "pokemon-details-desc");
    //              <p>
    let pkmnDetailsDesc = document.createElement("p");
    //                  pkmnInfo.desc
    pkmnDetailsDesc.textContent = pkmnInfo.desc;
    //              </p>
    pkmnDetailsDescContainer.appendChild(pkmnDetailsDesc);
    //          </div>
    pkmnDetailsData.appendChild(pkmnDetailsDescContainer);
    //          <div class="pokemon-details-stats">
    let pkmnDetailsStats = document.createElement("div");
    pkmnDetailsStats.setAttribute("class", "pokemon-details-stats");
    //              <p>
    let pkmnDetailsHeight = document.createElement("p");
    //                  <span class="pokemon-details-stat-title">
    let pkmnDetailsHeightTitle = document.createElement("span");
    pkmnDetailsHeightTitle.setAttribute("class", "pokemon-details-stat-title");
    //                      Altura:
    pkmnDetailsHeightTitle.textContent = frontendMsg.heightTitle[languageSettings.preferred];
    //                  </span>
    pkmnDetailsHeight.appendChild(pkmnDetailsHeightTitle);
    //                  <span>
    let pkmnDetailsHeightValue = document.createElement("span");
    //                      `${pkmnInfo.height / 10} m`
    pkmnDetailsHeightValue.textContent = `${(pkmnInfo.height / 10).toLocaleString()} m`;
    //                  </span>
    pkmnDetailsHeight.appendChild(pkmnDetailsHeightValue);
    pkmnDetailsHeight.appendChild(pkmnDetailsHeightValue);
    //              </p>
    pkmnDetailsStats.appendChild(pkmnDetailsHeight);
    //              <p>
    let pkmnDetailsWeight = document.createElement("p");
    //                  <span class="pokemon-details-stat-title">
    let pkmnDetailsWeightTitle = document.createElement("span");
    pkmnDetailsWeightTitle.setAttribute("class", "pokemon-details-stat-title");
    //                      Altura:
    pkmnDetailsWeightTitle.textContent = frontendMsg.weightTitle[languageSettings.preferred];
    //                  </span>
    pkmnDetailsWeight.appendChild(pkmnDetailsWeightTitle);
    //                  <span>
    let pkmnDetailsWeightValue = document.createElement("span");
    //                      `${pkmnInfo.height / 10} m`
    pkmnDetailsWeightValue.textContent = `${(pkmnInfo.weight / 10).toLocaleString()} kg`;
    //                  </span>
    pkmnDetailsWeight.appendChild(pkmnDetailsWeightValue);
    //              </p>
    pkmnDetailsStats.appendChild(pkmnDetailsWeight);
    //          </div>
    pkmnDetailsData.appendChild(pkmnDetailsStats);
    //      </div>
    pkmnDetailsContainer.appendChild(pkmnDetailsData);
    //  </div>
    return pkmnDetailsContainer;
}

/**
 * Adds a Pokémon list to the corresponding container.
 * @param {*} pkmnList The list to display
 * @param {*} container The container for the Pokémon cards
 */
function addPkmnListTo(pkmnList, container) {
    pkmnList.forEach(pkmn => {
        let pkmnCard = createPkmnCard(pkmn.result);
        container.appendChild(pkmnCard);
        let pkmnCardImgClickable = pkmnCard.querySelector(".pokemon-card-img-clickable");
        // 4.1. Add the corresponding event to each clickable link
        pkmnCardImgClickable.addEventListener("click", async (evt) => {
            let pkmnDetails = document.getElementById("pokemon-details");
            pkmnDetails.classList.remove("hidden");
            let topSpinnerCont = document.getElementById("details-spinner-container");
            let topSpinner = createSpinner();
            topSpinnerCont.appendChild(topSpinner);
            let id = evt.currentTarget.parentElement.getAttribute("data-pkmn-id");
            let pkmnInfo;
            pkmnDetails.childNodes.forEach(n => {
                pkmnDetails.removeChild(n);
            });
            if (id in cachePkmnInfo) {
                pkmnInfo = cachePkmnInfo[id];
                let pkmnDetailsContainer = createPkmnDetailsContainer(pkmnInfo);
                pkmnDetails.appendChild(pkmnDetailsContainer);
            }
            else {
                let pkmnInfoReq = await getPkmnInfo(id);
                if (pkmnInfoReq.success) {
                    pkmnInfo = pkmnInfoReq.result;
                    cachePkmnInfo[id] = pkmnInfo;
                    let pkmnDetailsContainer = createPkmnDetailsContainer(pkmnInfo);
                    pkmnDetails.appendChild(pkmnDetailsContainer);
                }
                else {
                    let errorMsg = document.createElement("p");
                    errorMsg.setAttribute("class", "error-msg"); 
                    pkmnDetails.appendChild(errorMsg);
                    return;
                }
            }
            topSpinnerCont.removeChild(topSpinner);
            scrollTo("top");
        });
    });
}

/**
 * Creates a spinner, with its corresponding container.
 */
function createSpinner() {
    /*
     * We need to create the following structure:
     * 
     *  <div class="spinner">
     *      <i class="fa-solid fa-spinner"></i>
     *  </div>
     */
    //  <div class="spinner">
    let spinnerContainer = document.createElement("div");
    spinnerContainer.setAttribute("class", "spinner");
    //      <i class="fa-solid fa-spinner">
    let spinnerIcon = document.createElement("i");
    spinnerIcon.classList.add("fa-solid", "fa-spinner");
    //      </i>
    spinnerContainer.appendChild(spinnerIcon);
    //  </div>
    return spinnerContainer;
}

function scrollTo(id) {
    document.getElementById(id).scrollIntoView({behavior: "smooth"}, true);
}

window.onload = async () => {
    let htmlMain = document.getElementsByClassName("main")[0];
    // 1. Retrieve the types and fill the `pkmnTypesInfo` object with its names
    let pkmnListTypesReq = await fetch("https://pokeapi.co/api/v2/type");
    if (pkmnListTypesReq.ok) {
        let pkmnListTypes = await pkmnListTypesReq.json();
        pkmnListTypes.results.forEach(async t => {
            let pkmnTypeReq = await fetch(`https://pokeapi.co/api/v2/type/${t.name}`);
            if (pkmnTypeReq.ok) {
                let pkmnType = await pkmnTypeReq.json(); 
                let pkmnTypeName = (pkmnType.names.some(n => n.language.name == languageSettings.preferred) ?
                    pkmnType.names.findLast(n => n.language.name == languageSettings.preferred).name :
                    pkmnType.names.findLast(n => n.language.name == languageSettings.fallback).name);
                cachePkmnTypeInfo.names[languageSettings.preferred][t.name] = pkmnTypeName;
            }
            else {
                let errorMsg = document.createElement("p");
                errorMsg.setAttribute("class", "error-msg");
                htmlMain.appendChild(errorMsg);
                return;
            }
        });
    }
    else {
        let errorMsg = document.createElement("p");
        errorMsg.setAttribute("class", "error-msg");
        htmlMain.appendChild(errorMsg);
        return;
    }
    // 2. Retrieve the Pokémon list
    let pkmnList = await getPkmnCollection(
        pagManager.currentOffset,
        PKMN_LIMIT_PER_PAGE,
        getPkmnInfo
    );
    // 3. Remove spinner
    let mainSpinnerCont = document.getElementById("main-spinner-container");
    htmlMain.removeChild(mainSpinnerCont);
    // 4. Create the corresponding cards
    let pkmnCardContainer = document.getElementById("pokemon-cards-container");
    addPkmnListTo(pkmnList, pkmnCardContainer);
    // 5. Add the "next page" button
    let nextPageBtn = document.getElementById("next-page-btn");
    nextPageBtn.textContent = `${frontendMsg.nextPage[languageSettings.preferred]} →`;
    nextPageBtn.addEventListener("click", async () => {
        let htmlMain = document.getElementsByClassName("main")[0];
        let pkmnCardContainer = document.getElementById("pokemon-cards-container");
        let spinner = createSpinner();
        htmlMain.appendChild(spinner);
        pagManager.currentPage++;
        pagManager.currentOffset += PKMN_LIMIT_PER_PAGE;
        let pkmnList = await getPkmnCollection(
            pagManager.currentOffset,
            PKMN_LIMIT_PER_PAGE,
            getPkmnInfo
        );
        addPkmnListTo(pkmnList, pkmnCardContainer);
        htmlMain.removeChild(spinner);
    });
}
