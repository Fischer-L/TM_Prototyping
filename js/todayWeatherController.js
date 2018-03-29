$(function(){
  var DATA_SOURCE_URL = "http://api.openweathermap.org/data/2.5/weather";

  var controller = {

    WEATHER_ICON_MAP: {
      "1": "app-weather-icon--clear-sky",
      "2": "app-weather-icon--few-clouds",
      "3": "app-weather-icon--scattered-clouds",
      "4": "app-weather-icon--broken-clouds",
      "9": "app-weather-icon--shower-rain",
      "10": "app-weather-icon--rain",
      "11": "app-weather-icon--thunderstorm",
      "13": "app-weather-icon--snow",
      "50": "app-weather-icon--mist"
    },

    init: function () {
      this._inputCity = $("#app-weather-input-city");
      this._inputCountry = $("#app-weather-input-country");
      this._weatherLoc = $("#app-weather-location");
      this._weatherIcon = $("#app-weather-icon");
      this._weatherState = $("#app-weather-state");
      this._weatherDesc = $("#app-weather-descrption");
      this._weatherTempMin = $("#app-weather-temp--min");;
      this._weatherTempMax = $("#app-weather-temp--max");
      this._weatherHumid = $("#app-weather-humidity--perc");
      this._subInfo = $(".app-weather__sub-info");

      this.handleEvent = (function (e) {
        if ((e.type !== "click" || e.target.id !== "app-weather-search-btn") &&
            (e.type !== "keyup" || e.key.toLowerCase() !== "enter")) {
          return;
        }
        var city = this._inputCity.val();
        var country = this._inputCountry.val();
        if (!city || !country) {
          return;
        }
        var onOK = this.onFetchOK.bind(this);
        var onError = this.onFetchError.bind(this);
        var loc = city.toUpperCase() + ", " + country.toUpperCase();
        this._weatherLoc.text(loc);
        this._weatherDesc.text("Looking for the weather info...");
        this._weatherIcon.removeClass().addClass("app-loading");
        this._subInfo.addClass("app-display-no");
        this._fetchWeather(city, country, onOK, onError);
      }).bind(this);
      $("#app-weather-panel").on("click", this.handleEvent);
      $("#app-weather-panel").on("keyup", this.handleEvent);
    },

    onFetchOK: function (resp) {
      try {
        var weather = resp.weather && resp.weather[0];
        var state = weather ? weather.main : null;
        var desc = weather ? weather.description : null;
        var subInfo = resp.main;
        var tempMin = subInfo ? subInfo.temp_min : null;
        var tempMax = subInfo ? subInfo.temp_max : null;
        var humidity = subInfo ? subInfo.humidity : null;

        // Let's pick the icon for weather
        var icon = null;
        // First try to find the clue from the description
        if (desc) {
          if (desc.indexOf("clear") >= 0) {
            icon = "app-weather-icon--clear";
          } else if (desc.indexOf("rain") >= 0) {
            icon = "app-weather-icon--raining";
          } else if (desc.indexOf("cloud") >= 0) {
            icon = "app-weather-icon--cloudy";
          }
        }
        // If unable to pick one from the description,
        // try the icon code based on https://openweathermap.org/weather-conditions
        if (weather && !icon) {
          icon = this.WEATHER_ICON_MAP[parseInt(weather.icon)] || null;
        }
        // Go "n/a" if unable to pick any.
        if (!icon) {
          icon = "app-weather-icon--na";
        }

        if (state && desc && tempMin && tempMax && humidity) {
          this._weatherState.text(state);
          this._weatherDesc.text(desc);
          this._weatherTempMin.text(tempMin);
          this._weatherTempMax.text(tempMax);
          this._weatherHumid.text(humidity);
          this._weatherIcon.removeClass().addClass(icon);
          this._subInfo.removeClass("app-display-no");
          return;
        }
      } catch (e) {
        console.error(e);
      }
      this.onFetchError();
    },

    onFetchError: function () {
      this._weatherIcon.removeClass().addClass("app-weather-icon--na");
      this._weatherState.text("");
      this._weatherDesc.text("Can not find the weather info for this place!");
      this._subInfo.addClass("app-display-no");
    },

    _fetchWeather: function (city, country, onOK, onError) {
      var querys = [
        "q=" + city + "," + country,
        "units=metric",
        "appid=a5f1336170c05f660351fae39c9ed457"
      ];
      var url = DATA_SOURCE_URL + "?" + querys.join("&");
      $.get(url, onOK).fail(onError);
    },
  };
  controller.init();
});