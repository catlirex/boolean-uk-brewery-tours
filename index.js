let state = {
    breweries:[]
}

function getAPIdata(){
   return fetch("https://api.openbrewerydb.org/breweries")
    .then(function (response) {
    return response.json()
    })
}

function pushCleanDataToState(data){
    console.log("data:", data)

    for (brewery of data){
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
}

function composeList(){
    let articleEl = document.querySelector("article")

    let breweriesUl = document.createElement("ul")
    breweriesUl.setAttribute("class","breweries-list")

    articleEl.append(breweriesUl)  
    
}

function renderBreweries(arrayOfBreweries){
    arrayOfBreweries.map(renderBrewery)
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
        removeCurrentDisplayList()

        filteredByStateArray = state.breweries.filter(function(brewery){
            return brewery.state.toLowerCase() === formInput.value.toLowerCase()
        })

        renderBreweries(filteredByStateArray)
    })
}

function removeCurrentDisplayList(){
    let breweriesUl = document.querySelector(".breweries-list")
    let allBreweriesLi = breweriesUl.querySelectorAll("li")
    allBreweriesLi.forEach(removeLi)  
}

function removeLi(liEl){
    liEl.remove()
}

function runPage(){
    getAPIdata()
    .then(function (data) {
        pushCleanDataToState(data)
        composeMain()
        composeSearchBar()
        composeList()
    })
    .then(function(){
        renderBreweries(state.breweries)
    })
}



runPage()
filterByState()




