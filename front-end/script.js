/* Constants declarations */
// Please set domain value after running backend app
const PORT = "8080"
const DOMAIN =  "127.0.0.1:"+PORT
const BASE_URL = "https://"+DOMAIN+"/api/"
const USPS_URL = "https://addver.postgrid.com/api/verifications"
const ENDPOINTS = {
    SAVE_ADDRESS: "create.php"
}
const DEFAULT_COUNTRY = "US"

// list of states
const STATES = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
]

// object to store original address
var originalAddress = {}

// object to store usps address
var apiAddress = {}

/* Color constants*/

const ACTIVE_BG_COLOR = "#0D6FED",
    ACTIVE_COLOR = "#FFFFFF",
    IN_ACTIVE_BG_COLOR = "#e4eaf8",
    IN_ACTIVE_COLOR = "#0D6FED";

/* DOM IDs*/

const ADDRESS_1_ID = 'address1',
    ADDRESS_2_ID = 'address2',
    CITY_ID = 'city',
    ZIP_ID = 'zip',
    STATE_ID = 'state',
    ADDRESS_PREVIEW_ID = 'addressPreview',
    LOADER_ID = 'loader',
    SUBMITTED = 'submitButton',
    SAVE_ADDRESS_ID = 'saveAddressButton',
    ALERT_BOX_ID = 'alertBox'

/* DOM variables */

var addressInput1,
    addressInput2,
    cityInput,
    postalCodeInput,
    stateInput,
    addressPreview,
    loader,
    submitButon,
    saveAddressButton,
    alertBox;

var allFormFields = [],
    requiredFormFields = []
var defaultValidation = {
    required: true
}

/* Html util functions */

// show input field error
function showError(element) {
    element.style.borderColor = "red"
}

// hide input field error
function hideError(element) {
    element.style.borderColor = "#dee2e6"
}

// check form values on every change
function verifyFormValues() {

    submitButon.disabled = false

    for (let i = 0; i < requiredFormFields.length; i++) {
        if (requiredFormFields[i].hasError || !requiredFormFields[i].value) {
            submitButon.disabled = true
            return
        }
    }

}

// reset form fields
function resetForm() {
    for (let i = 0; i < allFormFields.length; i++) {
        allFormFields[i].value = ''
    }
    closePreviewModel()
}

// add listeners to form field for validation
function makeValidatableField(id, validations = {}) {
    var element = document.getElementById(id)
    element.onblur = () => {
        if (validations.required && !element.value) {
            element.hasError = true
            showError(element)
        } else {
            element.hasError = false
            hideError(element)
        }
        verifyFormValues()
        populateFormValue()
    }
    element.oninput = verifyFormValues
    element.onfocus = verifyFormValues
    return element
}

// add an option to select field
function appendOptionForSelect(select, label, value) {
    const options = document.createElement('option')
    options.value = value
    options.innerHTML = label
    select.appendChild(options)
}

// populate options to select filed from json array
function populateSelectOptions(select, options) {
    for (let i = 0; i < options.length; i++) {
        appendOptionForSelect(select, options[i], options[i])
    }
}

// toggling button
function toggleButton(id, enabled) {
    const button = document.getElementById(id)
    button.style.background = enabled ? ACTIVE_BG_COLOR : IN_ACTIVE_BG_COLOR
    button.style.color = enabled ? ACTIVE_COLOR : IN_ACTIVE_COLOR
}

// populate data to preview modal
function previewAddress(data) {
    const {
        address,
        address2,
        city,
        prov,
        postal
    } = data
    addressPreview.innerHTML = `
        <span>Address Line 1:${address}<span>
        <br>
        <span>Address Line,  2:${address2}<span>
        <br>
        <span>City:${city}<span>
        <br>
        <span>State:${prov}<span>
        <br>
        <span>Zip Code:${postal}<span>
    `

    openPreviewModel()
}

// show preview modal
function openPreviewModel() {
    $('#previewModal').modal('show');
}

// hide preview modal
function closePreviewModel() {
    $('#previewModal').modal('hide');
}

// switching between address preview
function switchAdderessPreview(b1, b2) {
    const type = b1 == "switchBtn1" ? 'original' : 'api'
    toggleButton(b1, true)
    toggleButton(b2, false)
    previewAddress(type === 'original' ? originalAddress : apiAddress)
}

// show loading
function showLoading() {
    loader.style.display = "inline-block"
}

// hide loading
function hideLoading() {
    loader.style.display = "none"
}

// show success alert box
function showSuccessAlert(message) {
    alertBox.style.display = 'block'
    alertBox.innerHTML = message
    alertBox.className = "alert alert-success mt-3"

    setTimeout(hideAlert, 40000)

}

// show error alert box
function showErrorAlert(message) {
    alertBox.style.display = 'block'
    alertBox.innerHTML = message
    alertBox.className = "alert alert-danger mt-3"

    setTimeout(hideAlert, 40000)
}

// hide alert box
function hideAlert() {
    alertBox.style.display = 'none'
}

// poulate original address object from form fields
function populateFormValue() {
    originalAddress.address = addressInput1.value;
    originalAddress.address2 = addressInput2.value;
    originalAddress.city = cityInput.value;
    originalAddress.postal = postalCodeInput.value;
    originalAddress.prov = stateInput.value;
}


/* API call service */

// parsing json with exception handling
function parseJson(data) {

    try {
        const parsed = JSON.parse(data)
        return parsed
    } catch (err) {
        return data
    }
}

// common api call function
function apiCall(endpoint, method = "GET", data, ignoreHeader) {
    showLoading()
    return new Promise((resolve) => {
        const xhrForm = new XMLHttpRequest();
        xhrForm.open(method, endpoint);
        if (!ignoreHeader)
            xhrForm.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhrForm.onreadystatechange = () => {
            if (xhrForm.readyState === 4) {
                const response = parseJson(xhrForm.response)
                const status = response.statusText;
                hideLoading()
                resolve(response, status)
            }
        }
        const body = data ? JSON.stringify(data) : null
        xhrForm.send(body)
    })

}

// validating address using usps api call
function validateAddressWithUSPS(event) {
    event.preventDefault();

    const data = {
        "country": "us",
        "address": originalAddress.address,
        "address2": originalAddress.address2,
        "city": originalAddress.city,
        "prov": originalAddress.prov,
        "postal": originalAddress.postal
    }

    apiCall(USPS_URL, "POST", data)
        .then((response) => {

            apiAddress = {
                ...response,
                prov: response.provState,
                postal: response.postalZip
            }

            previewAddress(originalAddress)

            saveAddressButton.disabled = response.valid !== "C"

            if (response.valid !== "C") {
                showErrorAlert("Address is not valid.")
            } else {
                showSuccessAlert("Address validated successfully.")
            }
        })

}

// save address to our database
function saveAddress() {
    let data = {
        "country": "us",
        "address": originalAddress.address,
        "address2": originalAddress.address2,
        "city": originalAddress.city,
        "prov": originalAddress.prov,
        "postal": originalAddress.postal
    }
    apiCall(BASE_URL + ENDPOINTS.SAVE_ADDRESS, "POST", data, true)
        .then((status) => {
            if (status) {
                resetForm()
            }
        })

}

// application initialization
function initForm() {
    addressInput1 = makeValidatableField(ADDRESS_1_ID, defaultValidation)
    addressInput2 = makeValidatableField(ADDRESS_2_ID)
    cityInput = makeValidatableField(CITY_ID, defaultValidation);
    postalCodeInput = makeValidatableField(ZIP_ID, defaultValidation);
    stateInput = makeValidatableField(STATE_ID, defaultValidation);
    addressPreview = document.getElementById(ADDRESS_PREVIEW_ID)
    loader = document.getElementById(LOADER_ID)
    submitButon = document.getElementById(SUBMITTED)
    saveAddressButton = document.getElementById(SAVE_ADDRESS_ID)
    alertBox = document.getElementById(ALERT_BOX_ID)
    requiredFormFields = [addressInput1, cityInput, postalCodeInput, stateInput]
    allFormFields = [addressInput1, addressInput2, cityInput, postalCodeInput, stateInput]

    populateSelectOptions(stateInput, STATES)
    verifyFormValues()
}

// call application initialization on document successfully loaded
document.addEventListener("DOMContentLoaded", initForm);