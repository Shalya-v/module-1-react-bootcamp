"use strict"

const exchangeDateInput = document.querySelector('#exchange-date');
const currencySelect = document.querySelector("#currency");
const today = new Date().toISOString().split("T")[0];
const localStorageDate = localStorage.getItem('date');

// Disable entering date in future
exchangeDateInput.max = today;

exchangeDateInput.addEventListener("change", fetchAndRenderCurrencies);
document.querySelector("button").addEventListener("click", convert);

// Use date saved in local storage for fetch ...
if (localStorageDate) {
    exchangeDateInput.value = localStorageDate;
} else { // ... or today by default
    exchangeDateInput.value = today;
}

// Fetch currencies and render table on load
fetchAndRenderCurrencies();

/**
 * Getting currencies for user input date and place them on the page. Save user input to local storage.
 */
async function fetchAndRenderCurrencies() {
    const UIDate = exchangeDateInput.value;
    const currencies = await fetchRate(UIDate);
    renderTable(currencies);
    renderSelect(currencies);
    localStorage.setItem("date", UIDate);
    // Select option that was used for the last time
    currencySelect.selectedIndex = localStorage.getItem("lastConverted");
}

/**
 * Get currencies with rate from NBU service.
 * @param {str} date - Rate request date in ISO format.
 * @returns {Object[]} Array of curencies.
 */
async function fetchRate(date) {
    date = date.replaceAll("-", "");
    const response = await fetch(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${date}&json`);

    if (!response.ok) {
        throw new Error(`Could not fetch https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${date}&json, status: ${response.status}`)
    }
    return await response.json();
}

/**
 * Transform currencies object into table and place it on the page.
 * @param {Object[]} currencies - Array of currencies objects.
 */
function renderTable(currencies) {
    const currenciesTable = currencies.map(currency => `
    <tr>
        <td>${currency.txt}</td>
        <td>${currency.cc}</td>
        <td>${currency.rate}</td>
    </tr>`).join("");
    document.querySelector('tbody').innerHTML = currenciesTable;
}

/**
 * Get all available currencies and fill options for calculator's select.
 * @param {Object[]} currencies - Array of currencies objects.
 */
function renderSelect(currencies) {
    const options = currencies.map(currency => `
    <option value="${currency.rate}">${currency.txt}</option>`).join("");
    currencySelect.innerHTML = options;
}

/**
 * Get UAH amount from calculator's input. Throw error if value is incorrect.
 * @returns {Number} UAH amount from user input.
 */
function getUAHInput() {
    const UAHValue = +document.querySelector("#UAH-input").value;
    if (UAHValue <= 0 || isNaN(UAHValue)) {
        throw new Error("Incorrect Value");
    }
    return UAHValue;
}

/**
 * Conver UAH to selected currency and place result on the page.
 */
function convert() {
    let result;
    const resultOutput = document.querySelector(".result p");
    try {
        result = getUAHInput() / currencySelect.value;
    } catch (err) {
        resultOutput.innerHTML = "Результат";
        alert("Отакої! Введіть числове значення більше за 0 🥺")
        return
    }
    resultOutput.innerHTML = +result.toFixed(4);
    // Save selected currency to localStorage
    localStorage.setItem("lastConverted", currencySelect.selectedIndex);
}