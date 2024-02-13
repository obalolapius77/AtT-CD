/*
*   Author: Michael A. Karr, NIC Maryland
*   Year: 2014
*   Copyright: NIC Maryland for the State of Maryland. All Rights Reserved.
*/

ewfRequire.define("lib/geolocation", ["ewfJquery", "modernizr", "lib/storage"], function ($, Modernizr, simpleStorage) {
    
    var mdGovUserGeo = function (callback, options) {

        var $this = this;

        // Instance Settings
        this.settings = {
            debug: false,
            defaultLocation: "Annapolis, MD",
            enableHighAccuracy: true, // Triangulation
            timeout: 5000, // 5 seconds
            maximunAge: 60000, // 60 seconds
            noLocationMsg: "This website can use your location to provide local information. However, we were unable to determine your location.",
            useFallback: true,
            ignoreCache: false,
            validLocations: [],
            locationTtl: 3600000 // 1 Hour
        };

        // Geolocation lookup results codes
        this.locationResultCodes = [
            { code: 0, message: "OK" },
            { code: 1, message: "OUT_OF_STATE" },
            { code: 2, message: "NOT_FOUND" },
            { code: 3, message: "UNKNOWN" }
        ];

        // Extended with instance options
        if (typeof options == "object") {
            $.extend(this.settings, options);
        }

        // Location Cache
        this.location = simpleStorage.get("userLocation");

        // Create deferred promises
        this.geoPositionObtained = new $.Deferred();
        this.geoCodingComplete = new $.Deferred();

        // Default user geolocation settings
        this.defaultUserGeoSettings = {
            allowGeoLocation: false // Default to false to provide opt-in geolocation
        };

        // Store user's geolocation settings in cache (either default or from cache)
        this.userGeoSettings = this.getUserGeoSettings();
        simpleStorage.set("userGeoSettings", this.userGeoSettings);

        // Initialize MDGovUserGeo
        $this.init(callback);

    };

    // Initialization
    mdGovUserGeo.prototype.init = function (callback) {

        // Store reference to MDGovUserGeo for callback contexts
        var $this = this;

        // When the geo position is obtained and geocoded, populate data and fire callback
        $.when($this.geoPositionObtained).then(function (position) {
            // Fire callback with cached data when geocoding is completed
            $.when($this.geoCodingComplete).then(function () {
                $this.log($this.location, "Geocoding Completed");
                if (typeof (callback) == "function") {
                    callback($this.location);
                }
            });
            // Save location and geocode. Resolves geoCodingComplete promise when complete
            $this.saveUserLocationFromGeopositionResults(position);
        }).fail(function (error) {
            // If allowGeoLocation is false, geolocation is rejected and sent here
            // Use fallback
            if (error != "nogeolocation" && $this.settings.useFallback) {
                $this.fallback(callback);
            } else {
                if (!$this.location) {
                    // Use default location
                    $this.geocode($this.settings.defaultLocation, function (results) {
                        // Save location to storage with expiry
                        $this.saveUserLocationFromGeocodeResults(results, "manual", true);
                        if (typeof (callback) == "function") {
                            callback($this.location);
                        }
                    });
                }
            }
        });

        // Check cache first
        if ($this.location != null && !$this.settings.ignoreCache) {
            $this.location.cached = true;
            $this.log("Retrieving cached userLocation");
            if (typeof (callback) == "function") {
                callback($this.location);
            }
        } else {
            // This is always true until the user denies GeoLocation and/or Zip code fallback
            $this.getPosition();
        }

    };

    // Clear user location cache
    mdGovUserGeo.prototype.clearUserLocation = function () {
        this.log("Clearing userLocation from storage");
        // Remove from storage
        simpleStorage.deleteKey("userLocation");
        // Remove from instance
        this.location = this.oLocation;
    };

    // Retrieve user geolocation settings
    mdGovUserGeo.prototype.getUserGeoSettings = function () {
        var $this = this;
        var settings = simpleStorage.get("userGeoSettings");
        if (typeof settings == "undefined") {
            return $this.defaultUserGeoSettings;
        }
        return settings;
    };

    // Disable geolocation
    mdGovUserGeo.prototype.disableGeoLocation = function () {
        this.updateUserGeoSettings({ allowGeoLocation: false });
    };

    // Enable geolocation
    mdGovUserGeo.prototype.enableGeoLocation = function () {
        this.updateUserGeoSettings({ allowGeoLocation: true });
    };

    // Updates user geolocation settings
    mdGovUserGeo.prototype.updateUserGeoSettings = function (newSettings) {
        var $this = this;
        var currSettings = simpleStorage.get("userGeoSettings", $this.userGeoSettings);
        // Merge current settings with new settings
        $.extend(currSettings, newSettings);
        // Update instance settings
        $this.userGeoSettings = currSettings;
        // Resave settings to storage
        simpleStorage.set("userGeoSettings", $this.userGeoSettings);
    };

    // In the event a location cannot be obtained, use a zip code fallback
    mdGovUserGeo.prototype.fallback = function (callback) {
        var $this = this;
        $this.getUserInput($this.settings.noLocationMsg, function (query) {
            // We have a valid zip code
            // Get location data from zip code
            $this.geocode(query, function (results) {
                // Save location to storage with expiry
                $this.saveUserLocationFromGeocodeResults(results, "manual");
                if (typeof (callback) == "function") {
                    callback($this.location);
                }
            }, function (error) {
                if (error == window.google.maps.GeocoderStatus.ZERO_RESULTS) {
                    $this.fallback(callback);
                }
            });
        });
    };

    // Persist Geocode-derived location to storage
    mdGovUserGeo.prototype.saveUserLocationFromGeocodeResults = function (results, type, isDefault) {
        this.location = {
            data: results,
            latitude: results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng(),
            formatted_address: results[0].formatted_address,
            isDefault: isDefault || false,
            response: this.validateLocation(results),
            cached: false,
            type: type || "manual",
            error: null
        };
        simpleStorage.set("userLocation", this.location, { TTL: this.settings.locationTtl });
        this.geoCodingComplete.resolve();
    }

    // Persist Geoposition-derived location to storage
    mdGovUserGeo.prototype.saveUserLocationFromGeopositionResults = function (position) {
        var $this = this;
        // Reverse Geocode to get city/state, etc...
        $this.geocode_reverse(position.coords.latitude, position.coords.longitude, function (results) {
            $this.saveUserLocationFromGeocodeResults(results, "satellite");
        });
    }

    // Geocoder
    mdGovUserGeo.prototype.geocode = function (query, success, error) {
        if (window.google && window.google.maps) {
            var geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ 'address': query }, function (results, status) {
                if (status == window.google.maps.GeocoderStatus.OK) {
                    if (results != null) {
                        // Fire success callback and pass LatLng
                        if (typeof (success) == "function") {
                            success(results);
                        }
                    } else {
                        if (typeof (error) == "function") {
                            error(status);
                        }
                    }
                } else {
                    if (typeof (error) == "function") {
                        error(status);
                    }
                }
            });
        } else {
            if (typeof (error) == "function") {
                error("Geocoder unavailable. Please try again later.");
            }
        }
    };

    // Reverse Geocoder
    mdGovUserGeo.prototype.geocode_reverse = function (lat, lng, success, error) {

        if (window.google && window.google.maps) {

            var latlng = new window.google.maps.LatLng(lat, lng);
            var geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == window.google.maps.GeocoderStatus.OK) {
                    if (results != null) {
                        // Fire success callback and pass results
                        if (typeof (success) == "function") {
                            success(results);
                        }
                    } else {
                        if (typeof (error) == "function") {
                            error(status);
                        }
                    }
                } else {
                    if (typeof (error) == "function") {
                        error(status);
                    }
                }
            });

        } else {
            if (typeof (error) == "function") {
                error("Geocoder unavailable. Please try again later.");
            }
        }

    };

    // Gets user position using triangulation or gps and returns to success callback
    mdGovUserGeo.prototype.getPosition = function () {

        // Store reference to MDGovUserGeo for callback contexts
        var $this = this;

        // If the user allows geolocation and it's available
        if ($this.userGeoSettings.allowGeoLocation) {
            if (window.Modernizr.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    $this.log("Geoposition Obtained, Resolving Promise.");
                    $this.geoPositionObtained.resolve(position);
                }, function (err) {
                    $this.geoPositionObtained.reject(err);
                }, {
                    // Options object
                    enableHighAccuracy: $this.settings.enableHighAccuracy,
                    timeout: $this.settings.timeout,
                    maximunAge: $this.settings.maximunAge
                });
            } else {
                // Either geolocation is unavailable or allowGeoLocation is false
                $this.geoPositionObtained.reject("Geolocation unavailable.");
            }
        } else {
            // Reject promise with instructions to not get user's location
            $this.geoPositionObtained.reject("nogeolocation");
        }

    };

    // Prompts the user for their zip code with optional message
    mdGovUserGeo.prototype.getUserInput = function (message, success, failure) {

        var query = prompt(message);

        function successCallback() {
            if (typeof success == "function") {
                success(query);
            }
        }

        function failureCallback() {
            if (typeof failure == "function") {
                failure("User canceled operation.");
            }
        }

        if (query != null) {
            successCallback(query);
        } else {
            failureCallback();
        }
    };

    // Validates whether the location is valid
    mdGovUserGeo.prototype.validateLocation = function (location) {

        var validLocs = this.settings.validLocations,
            result = this.locationResultCodes[0],
            state;

        if (validLocs) {
            // Restrict to state
            state = this.getStateFromGeocodeData(location);
            var found = false;
            for (var i in validLocs) {
                if (validLocs[i].toLowerCase() == state.toLowerCase()) {
                    result = this.locationResultCodes[0];
                    found = true;
                    break;
                }
            }
            if (!found) {
                result = this.locationResultCodes[1];
            }
        }

        return result;

    };

    mdGovUserGeo.prototype.getStateFromGeocodeData = function (data) {
        var state = null,
            components = data[0].address_components;

        if (components) {
            for (var i = 0; i < components.length; i++) {
                var types = components[i].types;
                for (var j = 0; j < types.length; j++) {
                    if (types[j] == "administrative_area_level_1") {
                        state = components[i].short_name;
                        break;
                    }
                }
            }
        }
        return state;
    };

    mdGovUserGeo.prototype.log = function (msg, prefix) {
        if (this.settings.debug === true) {
            if (typeof (msg) != "string") {
                if (prefix) {
                    console.log(">>> " + prefix);
                }
                console.log(msg);
            } else {
                if (prefix) {
                    console.log("    ********** " + msg);
                } else {
                    console.log("********** " + msg);
                }
            }
        }
    };

    return mdGovUserGeo;

});