encodeURIComponent("ö");
const getLocationBtn = document.getElementById("getLocation");
const geonamesBaseUrl = "http://api.geonames.org/searchJSON?q=";
const geonamesUsername = "&username=petermagdy";

let wordword = "";

//get today's date with format matching input date value
let today = new Date();
let dd = String(today.getDate()).padStart(2, "0");
let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
let yyyy = today.getFullYear();
today = `${yyyy}-${mm}-${dd}`;
const todayDate = new Date(today);

//initialize date input by today's date
const dateSelector = document.getElementById("date");
dateSelector.value = today;

const forecastFragment = document.createDocumentFragment();
const galleryFragment = document.createDocumentFragment();
const locationDetailsSelector = document.querySelector(".locationDetails");

const galleryListSelector = document.querySelector(".galleryList");
const forecastListSelector = document.querySelector(".forecastList");

const weatherbitAPIKey = "af218464b2044147aaaed437217d1a54";
const pixabayAPIKey = "17532044-e9be917745d1b06b6659e834a";

const eventHandler = getLocationBtn.addEventListener("click", handleSubmit);

let APIType = "";

export function handleSubmit(e) {
  e.preventDefault();
  const country = document.getElementById("country").value;
  wordword = country;
  const dateHolder = document.getElementById("date").value;
  let selectedDate = new Date(dateHolder);
  let dayDifference = getDaysDifference(selectedDate);

  dayDifference < 7 ? (APIType = "current") : (APIType = "forecast/daily");

  if (country !== "") {
    getCountryLocation(geonamesBaseUrl, country, geonamesUsername)
      .then(function (data) {
        let geoLocation = {
          lat: data.lat,
          lng: data.lng,
        };
        return geoLocation;
      })
      .then((newData) => {
        let weatherObject = getCurrentWeatherForecast(newData.lat, newData.lng);
        return weatherObject;
      })
      .then((weatherData) => {
        const userData = postData("http://localhost:2711/add", { weatherData });
        return userData;
      })
      .then((collectedData) => {
        console.log(collectedData);
        getLocationImages(pixabayAPIKey, wordword).then((images) => {
          updateUI(collectedData, images);
        });
      });
  }
}

// definition of getting lats lngs
export let getCountryLocation = async (base, q, acc) => {
  const res = await fetch(base + q + acc);
  try {
    const data = await res.json();
    return data.geonames[0];
  } catch (error) {
    console.log(error);
  }
};

// definition of getting lats lngs
export let getCurrentWeatherForecast = async (lat, lng) => {
  let watherbitAPIKey = generateWeatherbitURL(lat, lng);
  const res = await fetch(watherbitAPIKey);
  try {
    const data = await res.json();
    return data.data[0];
  } catch (error) {
    console.log(error);
  }
};

// definition of getting lats lngs
export let getLocationImages = async (key, word) => {
  let pixabayURL = generatePixabayURL(key, word);
  const res = await fetch(pixabayURL);
  try {
    const data = await res.json();
    if (data.total === 0) {
      data.hits.push({ previewURL: "https://via.placeholder.com/150" });
    }
    return data.hits;
  } catch (error) {
    console.log(error);
  }
};

//definition of getting different days between today and the selected day
export let getDaysDifference = (sd) => {
  let diffTime = Math.abs(sd - todayDate);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export let generateWeatherbitURL = (lat, lng) => {
  let apiKey = `https://api.weatherbit.io/v2.0/${APIType}?lat=${lat}&lon=${lng}&key=${weatherbitAPIKey}`;
  return apiKey;
};

export let generatePixabayURL = (k, w) => {
  let apiKey = `https://pixabay.com/api/?key=${k}&q=${w}&image_type=photo&per_page=3`;
  return apiKey;
};

export function updateUI(result, imgs) {
  locationDetailsSelector.classList.add("show");
  galleryListSelector.innerHTML = "";
  forecastListSelector.innerHTML = "";

  const detailsItem = document.createElement("li");
  detailsItem.innerHTML = `<div><span>day:</span> ${result.date}</div>
    <div><span>Temperature:</span> ${result.temperature} °C</div>`;
  forecastFragment.appendChild(detailsItem);
  for (let img of imgs) {
    const galleryItem = document.createElement("li");
    galleryItem.innerHTML = `<img src="${img.previewURL}"/>`;
    galleryFragment.appendChild(galleryItem);
  }
  forecastListSelector.appendChild(forecastFragment);
  galleryListSelector.appendChild(galleryFragment);
}

// Function postData to POST data to our local server
export const postData = async (url = "", data = {}) => {
  console.log("data", data);
  const req = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      date: data.weatherData.datetime,
      temperature: data.weatherData.temp,
    }),
  });
  try {
    const userData = await req.json();
    return userData;
  } catch (error) {
    console.log("error", error);
  }
};

export { eventHandler };
