const API =
    "https://api.open-meteo.com/v1/forecast";


let latitude = null;
let longitude = null;


const locationElement =
    document.getElementById("location");

const statusElement =
    document.getElementById("status");

const temperatureElement =
    document.getElementById("temperature");

const windElement =
    document.getElementById("wind");

const directionElement =
    document.getElementById("direction");

const pressureElement =
    document.getElementById("pressure");

const conditionsElement =
    document.getElementById("conditions");

const lastUpdateElement =
    document.getElementById("lastUpdate");

const button =
    document.getElementById("checkButton");



function getDirection(degrees) {

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    return directions[
        Math.round(degrees / 45) % 8
    ];

}



function getCondition(code) {

    const conditions = {

        0: "Clear",

        1: "Mostly Clear",

        2: "Partly Cloudy",

        3: "Cloudy",

        45: "Fog",

        48: "Fog",

        51: "Light Drizzle",

        53: "Drizzle",

        55: "Heavy Drizzle",

        61: "Light Rain",

        63: "Rain",

        65: "Heavy Rain",

        71: "Light Snow",

        73: "Snow",

        75: "Heavy Snow",

        80: "Rain Showers",

        81: "Heavy Showers",

        82: "Violent Showers",

        95: "Thunderstorm",

        96: "Thunderstorm + Hail",

        99: "Thunderstorm + Heavy Hail"

    };

    return conditions[code] || "Unknown";

}



function getStatus(wind, code) {

    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {

        return "THUNDERSTORM";

    }


    if (wind >= 90) {

        return "EXTREME";

    }


    if (wind >= 60) {

        return "DANGER";

    }


    if (wind >= 40) {

        return "CAUTION";

    }


    return "SAFE";

}



function setStatus(status) {

    statusElement.className =
        "status " +
        status.toLowerCase();

    statusElement.textContent =
        status;

}



function showError(message) {

    setStatus("ERROR");

    conditionsElement.textContent =
        message;

}



function getLocation() {

    if (!navigator.geolocation) {

        showError(
            "GPS is not supported"
        );

        return;

    }


    locationElement.textContent =
        "Requesting GPS permission...";


    navigator.geolocation.getCurrentPosition(

        function(position) {

            latitude =
                position.coords.latitude;

            longitude =
                position.coords.longitude;


            locationElement.textContent =
                `${latitude.toFixed(4)}, ` +
                `${longitude.toFixed(4)}`;


            checkWeather();

        },

        function(error) {

            locationElement.textContent =
                "Location permission denied";

            showError(
                "Allow location access"
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 60000

        }

    );

}



async function checkWeather() {

    if (
        latitude === null ||
        longitude === null
    ) {

        getLocation();

        return;

    }


    button.disabled = true;

    button.textContent =
        "CHECKING...";


    try {

        const url =
            `${API}` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=` +
            `temperature_2m,` +
            `wind_speed_10m,` +
            `wind_direction_10m,` +
            `pressure_msl,` +
            `weather_code` +
            `&wind_speed_unit=kmh`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather service unavailable"
            );

        }


        const data =
            await response.json();


        const weather =
            data.current;


        const temperature =
            weather.temperature_2m;

        const wind =
            weather.wind_speed_10m;

        const windDirection =
            weather.wind_direction_10m;

        const pressure =
            weather.pressure_msl;

        const code =
            weather.weather_code;


        const status =
            getStatus(
                wind,
                code
            );


        setStatus(status);


        temperatureElement.textContent =
            `${temperature}°C`;


        windElement.textContent =
            `${wind} km/h`;


        directionElement.textContent =
            `${getDirection(windDirection)} ` +
            `(${windDirection}°)`;


        pressureElement.textContent =
            `${pressure} hPa`;


        conditionsElement.textContent =
            getCondition(code);


        const now =
            new Date();


        lastUpdateElement.textContent =
            "Last update: " +
            now.toLocaleTimeString();


    }

    catch (error) {

        showError(
            "Could not get weather"
        );

    }

    finally {

        button.disabled = false;

        button.textContent =
            "CHECK NOW";

    }

}



getLocation();


// Refresh every 5 minutes

setInterval(
    checkWeather,
    5 * 60 * 1000
);
