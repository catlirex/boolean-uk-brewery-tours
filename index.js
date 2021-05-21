let state = {
    breweries:[],
    cities:[],
    cityFilteredBreweries:[],
    typeFilteredBreweries:[],
    endIndex:0
};

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

        let lowercaseSearchInput = searchInput.value.toLowerCase()
        let searchResult=[]

        if(state.cityFilteredBreweries !== undefined) {
            searchResult = createSearchResultBreweries(lowercaseSearchInput, state.cityFilteredBreweries)
        }
        else if (state.typeFilteredBreweries !== undefined){
            searchResult = createSearchResultBreweries(lowercaseSearchInput, state.typeFilteredBreweries)
        }
        else {
            searchResult = createSearchResultBreweries(lowercaseSearchInput, state.breweries)
        }

        renderBreweries(searchResult)
        searchForm.reset()
    })
}

function createSearchResultBreweries(lowercaseSearchInput, currentShowBreweries){
    let matchedResultArray = currentShowBreweries.filter(function(brewery){
        let lowercaseName = brewery.name.toLowerCase()
        let lowercaseState = brewery.state.toLowerCase()
        let lowercaseAddress = brewery.street.toLowerCase()

        return lowercaseName.includes(lowercaseSearchInput) || lowercaseState.includes(lowercaseSearchInput) || lowercaseAddress.includes(lowercaseSearchInput)
    })

    return matchedResultArray
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
    typeSelect.addEventListener('change', function(event){
        event.preventDefault()

        if(event.target.value === ""){
            renderBreweries(state.breweries)
            state.typeFilteredBreweries = undefined
        }
        else{
            state.typeFilteredBreweries = state.breweries.filter(function(brewery){
                return brewery.brewery_type === event.target.value
            })
            renderBreweries(state.typeFilteredBreweries)
        }
        clearAllCityCheckbox()
    })

    let emptyOption = document.createElement("option")
    emptyOption.setAttribute("value", "")
    emptyOption.innerText = "Select a type..."
    typeSelect.append(emptyOption)

    let typesArray = ["micro", "regional", "brewpub"]
    for(type of typesArray){
        let typeOption = document.createElement("option")
        typeOption.setAttribute("value", type)
        typeOption.innerText = type[0].toUpperCase() + type.substring(1)

        typeSelect.append(typeOption)
    }
    
    typeForm.append(typeLabel,typeSelect)
    filtersAside.append(h2El, typeForm)
}

function clearAllCityCheckbox(){
    let cityForm = document.getElementById("filter-by-city-form")
    let allCheckBox = cityForm.querySelectorAll("input")
    allCheckBox.forEach(uncheckBox)
    state.cityFilteredBreweries = undefined
}

function composeCityFilterHead(){
    let filtersAside = document.querySelector(".filters-section")

    let cityHeadDiv = document.createElement("div")
    cityHeadDiv.setAttribute("class", "filter-by-city-heading")

    let h3El = document.createElement("h3")
    h3El.innerText = "Cities"

    let clearBtn = document.createElement("button")
    clearBtn.setAttribute("class", "clear-all-btn")
    clearBtn.innerText = "Clear all"
    clearBtn.addEventListener("click", function(){
        clearAllCityCheckbox()

        if (state.typeFilteredBreweries !== undefined){
            renderBreweries(state.typeFilteredBreweries)
        }
        else{
            renderBreweries(state.breweries)
        }
    })

    cityHeadDiv.append(h3El, clearBtn)
    filtersAside.append(cityHeadDiv)
}

function uncheckBox(input){
    input.checked = false
}

function composeCityFilter(){
    let perviousForm = document.querySelector("#filter-by-city-form")
    if (perviousForm !== null)perviousForm.remove()

    let filtersAside = document.querySelector(".filters-section")

    let cityForm = document.createElement("form")
    cityForm.setAttribute("id", "filter-by-city-form")
    cityForm.addEventListener("change", function(event){
        
        if (event.target.checked === true){
            addCheckedCity(event.target.value)
        } else{
            removeCheckedCity(event.target.value)
        }
        
        console.log(event.target.checked, event.target.value)

    })

    for(city of state.cities){
       let checkboxEls = createCityCheckbox(city)
       cityForm.append(checkboxEls[0], checkboxEls[1])
    }
    
    filtersAside.append(cityForm)
}

function addCheckedCity(checkedCity){
    let cityMatchedBreweries = []

    if (state.typeFilteredBreweries !== undefined){
        cityMatchedBreweries = state.typeFilteredBreweries.filter(function(brewery){
            return brewery.city === checkedCity}) 
    }else{
        cityMatchedBreweries = state.breweries.filter(function(brewery){
            return brewery.city === checkedCity}) 
    }
    
    if(state.cityFilteredBreweries === undefined){
        state.cityFilteredBreweries = cityMatchedBreweries
    }
    else{
        state.cityFilteredBreweries.push.apply(state.cityFilteredBreweries, cityMatchedBreweries)
    }

    renderBreweries(state.cityFilteredBreweries)
}

function removeCheckedCity(checkedCity){
    state.cityFilteredBreweries = state.cityFilteredBreweries.filter(function(brewery){
        return brewery.city !== checkedCity}) 

    renderBreweries(state.cityFilteredBreweries)

    if (state.cityFilteredBreweries.length === 0){
        if (state.typeFilteredBreweries !== undefined){
            renderBreweries(state.typeFilteredBreweries)
        }
        else{
            renderBreweries(state.breweries)
        }
        state.cityFilteredBreweries = undefined
    }
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
    if (perviousList !== null) perviousList.remove()

    let pageBtn = document.querySelectorAll(".page-button")
    if (pageBtn !== null) pageBtn.forEach(removeLi)

    let articleEl = document.querySelector("article")
    let breweriesUl = document.createElement("ul")
    breweriesUl.setAttribute("class","breweries-list")
    articleEl.append(breweriesUl) 

    state.endIndex = 10
    currentShowsBreweries = arrayOfBreweries.slice(0, 10)
    currentShowsBreweries.map(renderBrewery)
    
    if(arrayOfBreweries.length > state.endIndex)
    nextPage(arrayOfBreweries, state.endIndex)
}

function nextPage(arrayOfBreweries, endIndex){
    
    let nextPageBtn = document.createElement("button")
    nextPageBtn.setAttribute("class", "page-button")
    nextPageBtn.innerText = "Next"
    
    let articleEl = document.querySelector("article")
        articleEl.after(nextPageBtn)

    nextPageBtn.addEventListener("click", function(){
        
        let perviousList = document.querySelector("ul")
        perviousList.remove()
        nextPageBtn.remove()

        let articleEl = document.querySelector("article")
        let breweriesUl = document.createElement("ul")
        breweriesUl.setAttribute("class","breweries-list")
        articleEl.append(breweriesUl) 
        
        currentShowsBreweries = arrayOfBreweries.slice(endIndex, endIndex+10)
        state.endIndex = endIndex +10

        currentShowsBreweries.map(renderBrewery)
        
        perviousPage(arrayOfBreweries, state.endIndex)
        if(arrayOfBreweries.length > state.endIndex) nextPage(arrayOfBreweries, state.endIndex)
        })    
        
    
        
}

function perviousPage(arrayOfBreweries, endIndex){

    let perviousPageBtn = document.createElement("button")
    perviousPageBtn.setAttribute("class", "page-button")
    perviousPageBtn.innerText = "Pervious"

    let articleEl = document.querySelector("article")
        articleEl.after(perviousPageBtn)

    perviousPageBtn.addEventListener("click", function(){
        let perviousList = document.querySelector("ul")
        perviousList.remove()
        perviousPageBtn.remove()

        let articleEl = document.querySelector("article")
        let breweriesUl = document.createElement("ul")
        breweriesUl.setAttribute("class","breweries-list")
        articleEl.append(breweriesUl) 
        
        currentShowsBreweries = arrayOfBreweries.slice(endIndex-20, endIndex-10)
        state.endIndex = endIndex - 10

        currentShowsBreweries.map(renderBrewery)
        
        nextPage(arrayOfBreweries, state.endIndex) 
        if(state.endIndex >= 20) perviousPage(arrayOfBreweries, state.endIndex)
    })         

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

    let checkBtn = document.createElement("button")
    checkBtn.setAttribute("class", "check-availability")
    checkBtn.innerText = "Check availability"
    checkBtn.addEventListener("click", function(event){
        bookingForm.style.visibility= "visible"
    })


    let bookingForm = document.createElement("form")
    bookingForm.setAttribute("id", "booking-form")
    bookingForm.style.visibility= "hidden"
    bookingForm.addEventListener("submit", function(event){
        event.preventDefault()
        alert("Connecting to payment page...")
        bookingForm.reset()
    })

    let dateLabel = document.createElement("label")
    dateLabel.innerText = "Tour Date"
    let dateInput = document.createElement("input")
    dateInput.setAttribute("type", "date")
    dateInput.required = true

    let timeLabel = document.createElement("label")
    timeLabel.innerText = "Time"
    let timeInput = document.createElement("select")
    timeInput.setAttribute("name", 'tour-time')
    timeInput.setAttribute("id", 'tour-time')
    timeInput.required = true
    let bookNowBtn = document.createElement("button")
    bookNowBtn.setAttribute("type","submit")
    bookNowBtn.innerText = "BookNow"

    let emptyDiv = document.createElement("div")
    
    bookingForm.append(dateLabel, dateInput, timeLabel, timeInput, emptyDiv, bookNowBtn)

    let emptyOption = document.createElement("option")
    emptyOption.setAttribute("value", "")
    emptyOption.innerText = "Select meetup time"
    timeInput.append(emptyOption)
    

    let timeOptions = ["08:00", "10:00", "13:00","15:00"]
    for (time of timeOptions){
        let timeOption = document.createElement("option")
        timeOption.setAttribute("value", time)
        timeOption.innerText = time
        timeInput.append(timeOption)
    }

    liEl.append(nameH2, typeDiv, addressSection, bookingForm, checkBtn)
}

function filterByState(){
    let selectStateForm = document.querySelector("#select-state-form")
    let formInput = document.querySelector("#select-state")
    selectStateForm.addEventListener("submit", function(event){
        event.preventDefault()
        clearStateData()
        
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

function clearStateData(){
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

function runPage(){
    composeMain()
    composeSearchBar()
    composeTypeFilter()
    composeCityFilterHead()
    filterByState()
    
}
    
runPage()









