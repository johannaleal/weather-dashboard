// Get any saved cities from local storage.
//var savedCities = JSON.parse(localStorage.getItem("savedCities"));
var savedCities;
var city;

// Build the left menu nav with saved city searches.
buildLeftMenu();

// Function to disply all the city weather and 5-day forecast
function getCityWeather(city) {
  // Declare variables for output
  var temp;
  var humidity;
  var windSpeed;
  var weatherIcon;
  var latitude;
  var longitude;

  // Display the current date in header.
  var todaysDate = moment().format("M/D/YYYY");

  // Set the API key and URL for OpenWeather app.
  var APIKey = "d9e6975ed0304582f03c3687d8d7dc74";
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + APIKey;

  // Capitalize first letter of city.
  city = capitalize_Words(city);
  
  // Empty the five day header and any cards from a previous city search.
  $("#forecast-header").empty();
  $("#five-days").empty();

  // Create an AJAX call to get weather data.
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    // Save the city and add it to the left menu.
    saveCitySearch(city);
    buildLeftMenu();
    
    // Get the location of the weather icon and put it in an img tag.
    weatherIcon = " <img src=\"" + "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png\">";

    // The header for the city being searched for includes the city name, today's date, and the current weather icon.
    $("#current-city-header").html(city + " (" + todaysDate + ")" + weatherIcon);

    // Get and set the temperature.
    temp = (response.main.temp).toFixed(1);
    $("#cityTemp").text("Temperature: " + temp.toString() + "\xB0F");

    // Get and set the humidity.
    humidity = response.main.humidity;
    $("#cityHumidity").text("Humidity: " + humidity.toString() + "%");

    // Get and set the wind speed.
    windSpeed = (response.wind.speed).toFixed(1);
    $("#cityWindSpeed").text("Wind Speed: " + windSpeed.toString() + " MPH");

    // Get the longitute and latitude in order to determine the UV Index.
    longitude = response.coord.lon;
    latitude = response.coord.lat;

    // Get the UV information. This requires another API call which will get the UV information.
    queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIKey;
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(responseUV) {
      // Get and set the UV index and the font and background colors of the element to display it.
      $("#cityUV").text("UV Index: ");

      var uvIndex = responseUV.value;
      $("#uvIndex").text(uvIndex.toString());
      $("#uvIndex").attr("style", getUVIndexColor(uvIndex));
    });

    // Get the 5-day forecast for the city.
    getFiveDayForecast(city, APIKey);
  })
  .fail (function() {
    alert("This city is not found. Please try another.");
  });
}

// This function capitalizes the first letter of each word. Found it on w3resource.com.
function capitalize_Words(inString) {
  return inString.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + 
    txt.substr(1).toLowerCase();});
}

// This function builds out the left nav bar menu with saved city searches.
function buildLeftMenu() {
  // Get the saved cities from local storage.
  savedCities = JSON.parse(localStorage.getItem("savedCities"));

  // Before building out the left menu delete any existing cities. Otherwise, duplicates
  // will display.
  $("#city-list").empty();

  // If there are saved searches, display them as a vertical menu on the left.
  if (savedCities) {
    // Go through the savedCities array and build out the menu as <a> tags.
    for (i = 0; i < savedCities.length; i++) {
      var newCityLink = $("<a>");
      newCityLink.html(savedCities[i]).attr("class", "list-group-item list-group-item-action");
      newCityLink.attr("aria-current", "true");
      newCityLink.attr("href", "#");
      $("#city-list").append(newCityLink);
      
      // Build out the on click events for the anchor tags.
      $(newCityLink).on("click", function(event) {
        // Preventing the buttons default behavior when clicked
        event.preventDefault();

        // Get the weather data from the city link clicked.
        getCityWeather($(this).html());
      });
    };
  };
}

function saveCitySearch(city) {
  // Save city in the city array and local storage if it is 
  // not saved yet.
  if ($.inArray(city, savedCities) < 0) {
    savedCities = savedCities || [];
    savedCities.push(city);
    localStorage.removeItem("savedCities");
    localStorage.setItem("savedCities", JSON.stringify(savedCities));
  };
}

// Function to get the UV index font and background colors
function getUVIndexColor(uvIndex) {
  var style;

  // Depending on the range of the index it will display a 
  // different font and background color.
  if ((uvIndex >= 0) && (uvIndex <= 2)) {
    style = "color: white; background-color: green";
  }
  else if ((uvIndex >= 3) && (uvIndex <= 5)) {
    style = "color: black; background-color: yellow";
  }
  else if ((uvIndex >= 6) && (uvIndex <= 7)) {
    style = "color: black; background-color: orange";
  }
  else if ((uvIndex >= 8) && (uvIndex <= 10)) {
    style = "color: white; background-color: red";
  }
  else if (uvIndex >= 11) {
    style = "color: white; background-color: purple";
  };

  return style;
};

// Function to get the 5-day forecast
function getFiveDayForecast(city, APIKey) {
  // Get the 5 day forecast

  // API call string
  var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&cnt=40&units=imperial&appid=" + APIKey;

  // Set the section header.
  $("#forecast-header").text("5-Day Forecast");

  // AJAX call to get data using API call
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    // Loop through the response object to grab the information for
    // the 5-day forecast.
    for (i = 0 ; i < 5; i++) {
      // Get the forecast date.
      var cardDate = response.list[i * 8].dt_txt;
      cardDate = moment(cardDate).format("M/D/YYYY");

      // Get the forecast date weather icon.
      var dayIcon = "https://openweathermap.org/img/wn/" + response.list[i * 8].weather[0].icon + "@2x.png\"";

      // Set the data in a div and append to the main "five-days" div.
      var fiveDayCard = "<div class=\"col\">" + 
                            "<div class=\"card\">" +
                                "<div class=\"card-body day-card\">" +
                                  "<h5 class=\"card-title\">" + cardDate.toString() + "</h5>" + 
                                  "<img src=\"" + dayIcon + "\">" +
                                  "<p class=\"card-text\">Temp: " + response.list[i * 8].main.temp.toString() + "\xB0F</p>" + 
                                  "<p class=\"card-text\">Humidity: " + response.list[i * 8].main.humidity.toString() + "%</p>" +
                                "</div>" +
                              "</div>" + 
                            "</div>";

        $("#five-days").append(fiveDayCard);
    };
  });
}

// Set the search button's click event.
$("#search-button").on("click", function(event) {
  event.preventDefault();
  
  // Get the city entered in the search bar.
  city = $("#search-city").val();

  // If a city was entere call the function to display the city's weather 
  // conditions. Else display an error message.
  if (city) {
    getCityWeather(city);
  }
  else {
    alert("You must enter a city.");
  }
});
