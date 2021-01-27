 // Get any saved cities from local storage.
 var savedCities = JSON.parse(localStorage.getItem("savedCities"));

 // build the side menu.

 // This .on("click") function will trigger the AJAX Call
 $("#search-button").on("click", function(event) {

   event.preventDefault();

   // Display the current date in header.
   var todaysDate = moment().format("M/D/YYYY");
   var temp;
   var humidity;
   var windSpeed;
   var uvIndex;
   var weatherIcon;
   var latitude;
   var longitude;
   var uvIndexBGColor;
   var city = $("#search-city").val();

   // Capitalize first letter of city.
   city = city[0].toUpperCase() + city.substring(1).toLowerCase();

   // Set the API key for OpenWeather app.
   var APIKey = "d9e6975ed0304582f03c3687d8d7dc74";
   var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + APIKey;

   // Create an AJAX call.
   $.ajax({
     url: queryURL,
     method: "GET"
   }).then(function(response) {
     // Get the location of the weather icon and put it in an img tag.
     weatherIcon = " <img src=\"" + "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png\">";

     // The header for the city being searched for is the city name, today's date, and the current weather icon.
     $("#current-city-header").html(city + " (" + todaysDate + ")" + weatherIcon);

     // Get the temperature from the response object.
     temp = (response.main.temp).toFixed(1);
     $("#cityTemp").text("Temperature: " + temp.toString() + "\xB0F");

     // Get the humidity.
     humidity = response.main.humidity;
     $("#cityHumidity").text("Humidity: " + humidity.toString() + "%");

     // GEt the wind speed.
     windSpeed = (response.wind.speed).toFixed(1);
     $("#cityWindSpeed").text("Wind Speed: " + windSpeed.toString() + " MPH");

     // Get the longitute and latitude in order to determine the UV Index.
     longitude = response.coord.lon;
     latitude = response.coord.lat;

     // Get the UV information.
     queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIKey;
     $.ajax({
       url: queryURL,
       method: "GET"
     }).then(function(responseUV) {
       $("#cityUV").text("UV Index: ");

       var uvIndex = responseUV.value;

       $("#uvIndex").text(uvIndex.toString());
       $("#uvIndex").attr("style", getUVIndexColor(uvIndex));
     });

     getFiveDayForecast(city, APIKey);
   });

   function getUVIndexColor(uvIndex) {
     var style;

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

   function getFiveDayForecast(city, APIKey) {
     // Get the 5 day forecast
     var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&cnt=40&units=imperial&appid=" + APIKey;

     $.ajax({
       url: queryURL,
       method: "GET"
     }).then(function(response) {

       for (i = 0 ; i < 5; i++) {
       //response.list.forEach(function(day, index) {
       
       var cardDate = response.list[i * 8].dt_txt;

       cardDate = moment(cardDate).format("M/D/YYYY");

       var dayIcon = "http://openweathermap.org/img/wn/" + response.list[i * 8].weather[0].icon + "@2x.png\"";

       var fiveeDayCard = "<div class=\"col\">" + 
                             "<div class=\"card\">" +
                                 "<div class=\"card-body day-card\">" +
                                   "<h5 class=\"card-title\">" + cardDate.toString() + "</h5>" + 
                                   "<img src=\"" + dayIcon + "\">" +
                                   "<p class=\"card-text\">Temp: " + response.list[i * 8].main.temp.toString() + "\xB0F</p>" + 
                                   "<p class=\"card-text\">Humidity: " + response.list[i * 8].main.humidity.toString() + "%</p>" +
                                 "</div>" +
                               "</div>" + 
                             "</div>";

         $("#five-days").append(fiveeDayCard);
       };
     });
   }
 })