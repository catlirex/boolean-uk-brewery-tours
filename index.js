let state = {
    breweries:[],
    cities:[]
}

function getBreweriesByState(state){
   return fetch(`https://api.openbrewerydb.org/breweries?by_state=${state}`)
    .then(function (response) {
    return response.json()
    })
}

function pushCleanDataToState(data){
    console.log("data:", data)

    let usefulBrewery = data.filter(function(brewery){
        return brewery.brewery_type ===  "micro" || brewery.brewery_type === "regional" || brewery.brewery_type === "brewpub"
    })

    for (brewery of usefulBrewery){
    let cleanedData = {}

    cleanedData.id = brewery.id
    cleanedData.name = brewery.name
    cleanedData.brewery_type = brewery.brewery_type
    cleanedData.street = brewery.street
    if (cleanedData.street === null) cleanedData.street = "N/A"
    cleanedData.city = brewery.city
    cleanedData.state = brewery.state
    cleanedData.postal_code = brewery.postal_code
    cleanedData.phone = brewery.phone
    if (cleanedData.phone === null) cleanedData.phone = "N/A"
    cleanedData.website_url = brewery.website_url

    state.breweries.push(cleanedData)
    }
    console.log(state.breweries)
}

function composeMain(){
    let mainEl = document.querySelector("main")
        mainEl.style.visibility = "hidden"
     

    let filterSection = document.createElement("aside")
    filterSection.setAttribute("class", "filters-section")

    let h1El = document.createElement("h1")
    h1El.innerText = "List of Breweries"

    let searchBar = document.createElement("header")
    searchBar.setAttribute("class", "search-bar")

    let articleEl = document.createElement("article")
    
    mainEl.append(filterSection, h1El, searchBar, articleEl)
}

function composeSearchBar(){
    let headerEl = document.querySelector(".search-bar")
    let searchForm = document.createElement("form")
    searchForm.setAttribute("id","search-breweries-form")
    searchForm.setAttribute("autocomplete","off")
    headerEl.append(searchForm)

    let searchLabel = document.createElement("label")
    searchLabel.setAttribute("for", "search-breweries")
    searchLabel.innerHTML = "<h2>" + "Search breweries:" + "</h2>"

    let searchInput = document.createElement("input")
    searchInput.setAttribute("id", "search-breweries")
    searchInput.setAttribute("name", "search-breweries")
    searchInput.setAttribute("type", "text")
    searchForm.append(searchLabel, searchInput)

    searchForm.addEventListener("submit", function(event){
        event.preventDefault()
        removeCurrentDisplayList()

        matchedResultArray = state.breweries.filter(function(brewery){
            let lowercaseName = brewery.name.toLowerCase()
            let lowercaseState = brewery.state.toLowerCase()
            let lowercaseAddress = brewery.street.toLowerCase()
        
            let lowercaseSearchInput = searchInput.value.toLowerCase()
            return lowercaseName.includes(lowercaseSearchInput) || lowercaseState.includes(lowercaseSearchInput) || lowercaseAddress.includes(lowercaseSearchInput)
        })

        renderBreweries(matchedResultArray)
        searchForm.reset()
    })
}

function composeTypeFilter(){
    let filtersAside = document.querySelector(".filters-section")
    let h2El = document.createElement("h2")
    h2El.innerText = "Filter By:"

    let typeForm = document.createElement("form")
    typeForm.setAttribute("id", "filter-by-type-form")
    typeForm.setAttribute("autocompete", "off")
    

    let typeLabel = document.createElement("label")
    typeLabel.setAttribute("for", 'filter-by-type')
    typeLabel.innerHTML = '<h3>Type of Brewery</h3>'

    let typeSelect = document.createElement("select")
    typeSelect.setAttribute("name", 'filter-by-type')
    typeSelect.setAttribute("id", 'filter-by-type')

    let emptyOption = document.createElement("option")
    emptyOption.setAttribute("value", "")
    emptyOption.innerText = "Select a type..."

    let microOption = document.createElement("option")
    microOption.setAttribute("value", "micro")
    microOption.innerText = "Micro"

    let regionalOption = document.createElement("option")
    regionalOption.setAttribute("value", "regional")
    regionalOption.innerText = "Regional"
    
    let brewpubOption = document.createElement("option")
    brewpubOption.setAttribute("value", "brewpub")
    brewpubOption.innerText = "Brewpub"

    typeForm.append(typeLabel,typeSelect)
    typeSelect.append(emptyOption, microOption, regionalOption, brewpubOption)

    let cityHeadDiv = document.createElement("div")
    cityHeadDiv.setAttribute("class", "filter-by-city-heading")

    let h3El = document.createElement("h3")
    h3El.innerText = "Cities"

    let clearBtn = document.createElement("button")
    clearBtn.setAttribute("class", "clear-all-btn")
    clearBtn.innerText = "Clear all"
    cityHeadDiv.append(h3El, clearBtn)

    filtersAside.append(h2El, typeForm, cityHeadDiv)
}

function composeCityFilter(){
    let perviousForm = document.querySelector("#filter-by-city-form")
    if (perviousForm !== null)perviousForm.remove()

    let filtersAside = document.querySelector(".filters-section")

    let cityForm = document.createElement("form")
    cityForm.setAttribute("id", "filter-by-city-form")

    for(city of state.cities){
       let checkboxEls = createCityCheckbox(city)
       cityForm.append(checkboxEls[0], checkboxEls[1])
    }
    
    filtersAside.append(cityForm)
}

function createCityCheckbox(city){
    let cityFilterInput = document.createElement("input")
    cityFilterInput.setAttribute("type", "checkbox")
    cityFilterInput.setAttribute("name", city)
    cityFilterInput.setAttribute("value", city)

    let cityFilterLabel = document.createElement("label")
    cityFilterLabel.setAttribute("for", city)
    cityFilterLabel.innerText = city
    
    return [cityFilterInput , cityFilterLabel]
}

function pushCitiesToState(){
    for (brewery of state.breweries){
        indexCheck = state.cities.findIndex(function(city){
            brewery.city === city
        })

        if (indexCheck === -1){
            state.cities.push(brewery.city)
        }
    }
}

function renderBreweries(arrayOfBreweries){
    let perviousList = document.querySelector("ul")
    if (perviousList !== null)perviousList.remove()

    let articleEl = document.querySelector("article")
    let breweriesUl = document.createElement("ul")
    breweriesUl.setAttribute("class","breweries-list")

    articleEl.append(breweriesUl) 

    firstTenBreweries = arrayOfBreweries.slice(0, 10)
    firstTenBreweries.map(renderBrewery)
}

function renderBrewery(brewery){
    let breweriesUl = document.querySelector("ul")
    let liEl = document.createElement("li")
    breweriesUl.append(liEl)

    let nameH2 = document.createElement("h2")
    nameH2.innerText = brewery.name

    let typeDiv = document.createElement("div")
    typeDiv.setAttribute("class", "type")
    typeDiv.innerText = brewery.brewery_type

    let addressSection = document.createElement("section")
    addressSection.setAttribute("class", "address")

    let h3El = document.createElement("h3")
    h3El.innerText = "Address:"
    let addressText = document.createElement("p")
    addressText.innerText = brewery.street
    let postCodeText = document.createElement("p")
    postCodeText.innerHTML = "<strong>"+ brewery.state + " , " + brewery.postal_code +  "</strong>"
    addressSection.append(h3El, addressText, postCodeText)

    liEl.append(nameH2, typeDiv, addressSection)
}

function filterByState(){
    let selectStateForm = document.querySelector("#select-state-form")
    let formInput = document.querySelector("#select-state")
    selectStateForm.addEventListener("submit", function(event){
        event.preventDefault()
        clearState()
        
        let mainEl = document.querySelector("main")
        mainEl.style.visibility = "visible"

        getBreweriesByState(formInput.value)
        .then(function(breweries){
            pushCleanDataToState(breweries)
            
        })
        .then(function(){
            pushCitiesToState()
            renderBreweries(state.breweries)
            composeCityFilter()
        })

        selectStateForm.reset()
    })
}

function clearState(){
    state = {
        breweries:[],
        cities:[]
    }
}

function removeCurrentDisplayList(){
    let breweriesUl = document.querySelector(".breweries-list")
    let allBreweriesLi = breweriesUl.querySelectorAll("li")
    allBreweriesLi.forEach(removeLi)  
}

function removeLi(liEl){
    liEl.remove()
}

function clearCityAndListOnPage (){

}

function runPage(){
    composeMain()
    composeSearchBar()
    composeTypeFilter()
    filterByState()
}
    
runPage()









