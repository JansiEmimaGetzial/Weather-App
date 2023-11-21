const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-button");
const locationButton = document.querySelector(".location-button");
const currentweatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "5e82316ec1362477a95e710a1cd4c101";

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind : ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity : ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon"> 
                    <h4>Temp : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind : ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity : ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        
        cityInput.value = "";
        currentweatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";


        
        fiveDaysForecast.forEach((weatherItem, index)  => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if(index === 0) {
                currentweatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

    }).catch(() => {
        alert("An error occured while fetching the weather forecast!");

    });
} 


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(cityName === "") return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No Coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);

    }).catch(() => {
        alert("An error occured while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude , longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
        
            }).catch(() => {
                alert("An error occured while fetching the coordinates!");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please allow Geolocation to access your current location. ")
            }else {
                alert("Geolocation request error. Please reset location settings")
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());