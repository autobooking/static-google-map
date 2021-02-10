var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function urlBuilder(property, value, separator) {
  if (value) {
    return '' + property + separator + value;
  }

  return null;
}

function locationBuilder(location) {
  var urlParts = [];

  if (Array.isArray(location)) {
    var arrParts = location.map(function (val) {
      return locationBuilder(val);
    });
    urlParts.push.apply(urlParts, toConsumableArray(arrParts));
  }

  if (typeof location === 'string' || typeof location === 'number') {
    urlParts.push(location);
  }

  if ((typeof location === 'undefined' ? 'undefined' : _typeof(location)) === 'object' && location.lat && location.lng) {
    urlParts.push(location.lat + ',' + location.lng);
  }

  return urlParts.join('%7C');
}

var mapStrategy = function mapStrategy(props) {
  var rootURL = 'https://maps.googleapis.com/maps/api/staticmap';
  var size = props.size,
      zoom = props.zoom,
      scale = props.scale,
      style = props.style,
      center = props.center,
      format = props.format,
      client = props.client,
      region = props.region,
      visible = props.visible,
      channel = props.channel,
      maptype = props.maptype,
      language = props.language,
      signature = props.signature,
      key = props.key,
      map_id = props.map_id;


  var urlParts = [];

  urlParts.push(urlBuilder('size', size, '='));
  urlParts.push(urlBuilder('zoom', zoom, '='));
  urlParts.push(urlBuilder('scale', scale, '='));
  urlParts.push(urlBuilder('style', style, '='));
  urlParts.push(urlBuilder('center', center, '=')); // Todo: Allow Objects.
  urlParts.push(urlBuilder('format', format, '='));
  urlParts.push(urlBuilder('client', client, '='));
  urlParts.push(urlBuilder('region', region, '='));
  urlParts.push(urlBuilder('visible', visible, '='));
  urlParts.push(urlBuilder('channel', channel, '='));
  urlParts.push(urlBuilder('maptype', maptype, '='));
  urlParts.push(urlBuilder('language', language, '='));
  urlParts.push(urlBuilder('signature', signature, '='));
  urlParts.push(urlBuilder('key', key, '='));
  urlParts.push(urlBuilder('map_id', map_id, '='));

  var parts = urlParts.filter(function (x) {
    return x;
  }).join('&');

  return rootURL + '?' + parts;
};

var markerStrategy = function markerStrategy(props, mapProps) {
  var size = props.size,
      color = props.color,
      label = props.label,
      anchor = props.anchor,
      iconURL = props.iconURL,
      location = props.location,
      scale = props.scale;


  if (!location) {
    throw new Error('Marker expects a valid location prop');
  }

  var urlParts = [];

  urlParts.push(urlBuilder('size', size, ':'));
  urlParts.push(urlBuilder('color', color, ':'));
  urlParts.push(urlBuilder('label', label, ':'));
  urlParts.push(urlBuilder('anchor', anchor, ':'));
  urlParts.push(urlBuilder('scale', scale, ':'));
  urlParts.push(urlBuilder('icon', iconURL, ':'));
  urlParts.push(urlBuilder('', locationBuilder(location), ''));

  var url = urlParts.filter(function (x) {
    return x;
  }).join('%7C');

  return 'markers=' + url;
};

var markerGroupStrategy = function markerGroupStrategy(props, mapProps) {
  var size = props.size,
      color = props.color,
      label = props.label,
      anchor = props.anchor,
      iconURL = props.iconURL,
      markers = props.markers,
      scale = props.scale;


  var location = markers.map(function (marker) {
    return marker.location;
  });

  return markerStrategy({ size: size, color: color, label: label, anchor: anchor, iconURL: iconURL, location: location, scale: scale }, mapProps);
};

var pathStrategy = function pathStrategy(props, mapProps) {
  var weight = props.weight,
      color = props.color,
      fillcolor = props.fillcolor,
      geodesic = props.geodesic,
      points = props.points;


  if (!points) {
    throw new Error('Path expects a valid points prop');
  }

  var urlParts = [];

  urlParts.push(urlBuilder('color', color, ':'));
  urlParts.push(urlBuilder('weight', weight, ':'));
  urlParts.push(urlBuilder('fillcolor', fillcolor, ':'));
  urlParts.push(urlBuilder('geodesic', geodesic, ':'));
  urlParts.push(urlBuilder('', locationBuilder(points), ''));

  var url = urlParts.filter(function (x) {
    return x;
  }).join('%7C');

  return 'path=' + url;
};

var pathGroupStrategy = function pathGroupStrategy(props, mapProps) {
  var weight = props.weight,
      color = props.color,
      fillcolor = props.fillcolor,
      geodesic = props.geodesic,
      paths = props.paths;


  var points = paths.map(function (path) {
    return path.points;
  });

  return pathStrategy({ weight: weight, color: color, fillcolor: fillcolor, geodesic: geodesic, points: points });
};

function nativeStrategy(data) {
  if (!window || !window.google) {
    throw new Error('The `native` directions strategy can only be used in the browser with the Google Maps API loaded. Set the `requestStrategy` property `fetch` to use standard JS fetch or pass your own promise.');
  }

  var origin = data.origin,
      destination = data.destination,
      travelMode = data.travelMode;


  var originLocation = void 0;
  var destinationLocation = void 0;

  if ((typeof origin === 'undefined' ? 'undefined' : _typeof(origin)) === 'object' && origin.lat && origin.lng) {
    originLocation = new window.google.maps.LatLng(origin);
  } else {
    originLocation = origin;
  }

  if ((typeof destination === 'undefined' ? 'undefined' : _typeof(destination)) === 'object' && destination.lat && destination.lng) {
    destinationLocation = new window.google.maps.LatLng(destination);
  } else {
    destinationLocation = destination;
  }

  var DirectionsService = new window.google.maps.DirectionsService();
  return new Promise(function (resolve, reject) {
    DirectionsService.route({
      origin: originLocation,
      destination: destinationLocation,
      travelMode: travelMode && travelMode.toUpperCase()
    }, function (result, status) {
      if (status === window.google.maps.DirectionsStatus.OK) {
        resolve(result.routes[0].overview_polyline);
      }

      reject(status);
    });
  });
}

function fetchStrategy(data) {
  var baseURL = 'https://maps.googleapis.com/maps/api/directions/json';

  var key = data.key,
      origin = data.origin,
      destination = data.destination;


  var options = {
    method: 'GET',
    mode: 'cors',
    cache: 'default'
  };

  var originLocation = void 0;
  var destinationLocation = void 0;

  if ((typeof origin === 'undefined' ? 'undefined' : _typeof(origin)) === 'object' && origin.lat && origin.lng) {
    originLocation = origin.lat + ',' + origin.lng;
  } else {
    originLocation = origin;
  }

  if ((typeof destination === 'undefined' ? 'undefined' : _typeof(destination)) === 'object' && destination.lat && destination.lng) {
    destinationLocation = destination.lat + ',' + destination.lng;
  } else {
    destinationLocation = destination;
  }

  var URL = baseURL + '?origin=' + originLocation + '&destination=' + destinationLocation + '&key=' + key;

  return fetch(URL, options).then(function (res) {
    return res.json();
  }).then(function (res) {
    if (res.status === 'OK') {
      return res.routes[0].overview_polyline.points;
    } else {
      return Promise.reject(res);
    }
  });
}

var directionStrategy = function directionStrategy(props, mapProps, requestStrategy) {
  var origin = props.origin,
      destination = props.destination,
      key = props.key,
      waypoints = props.waypoints,
      avoid = props.avoid,
      travelMode = props.travelMode,
      transitMode = props.transitMode,
      transitRoutingPreference = props.transitRoutingPreference,
      weight = props.weight,
      color = props.color,
      fillcolor = props.fillcolor,
      geodesic = props.geodesic,
      rest = objectWithoutProperties(props, ['origin', 'destination', 'key', 'waypoints', 'avoid', 'travelMode', 'transitMode', 'transitRoutingPreference', 'weight', 'color', 'fillcolor', 'geodesic']);


  if (!origin) {
    throw new Error('Origin prop is required');
  }
  if (!destination) {
    throw new Error('Destination prop is required');
  }

  // Use the parent's API key if one isn't set here.
  var apiKey = key ? key : mapProps ? mapProps.key : '';

  var data = _extends({
    key: apiKey,
    origin: origin,
    destination: destination,
    waypoints: waypoints,
    avoid: avoid,
    travelMode: travelMode,
    transitMode: transitMode,
    transitRoutingPreference: transitRoutingPreference
  }, rest);

  var pathPromise = void 0;

  if (typeof requestStrategy !== 'string') {
    pathPromise = requestStrategy(data);
  } else {
    switch (requestStrategy) {
      case 'native':
        pathPromise = nativeStrategy(data);
        break;
      case 'fetch':
        pathPromise = fetchStrategy(data);
        break;
      default:
        throw new Error('Specify a Request strategy to get directions from');
    }
  }

  return pathPromise.then(function (path) {
    return pathStrategy({
      weight: weight,
      color: color,
      fillcolor: fillcolor,
      geodesic: geodesic,
      points: 'enc:' + path
    }, mapProps);
  });
};

var staticMapUrl = function staticMapUrl(props) {
  var markers = props.markers,
      markerGroups = props.markerGroups,
      paths = props.paths,
      pathGroups = props.pathGroups,
      directions = props.directions,
      mapProps = objectWithoutProperties(props, ['markers', 'markerGroups', 'paths', 'pathGroups', 'directions']);


  if (directions) {
    throw new Error('Use the `asyncStaticMapUrl` function when using directions');
  }

  var mainUrlParts = mapStrategy(mapProps);
  var childrenUrlParts = [];

  if (markers && Array.isArray(markers) && markers.length) {
    var markerUrlParts = markers.map(function (marker) {
      return markerStrategy(marker, mapProps);
    });
    childrenUrlParts.push.apply(childrenUrlParts, toConsumableArray(markerUrlParts));
  }

  if (markerGroups && Array.isArray(markerGroups) && markerGroups.length) {
    var markerGroupUrlParts = markerGroups.map(function (markerGroup) {
      return markerGroupStrategy(markerGroup, mapProps);
    });
    childrenUrlParts.push.apply(childrenUrlParts, toConsumableArray(markerGroupUrlParts));
  }

  if (paths && Array.isArray(paths) && paths.length) {
    var pathUrlParts = paths.map(function (path) {
      return pathStrategy(path, mapProps);
    });
    childrenUrlParts.push.apply(childrenUrlParts, toConsumableArray(pathUrlParts));
  }

  if (pathGroups && Array.isArray(pathGroups) && pathGroups.length) {
    var pathGroupUrlParts = pathGroups.map(function (pathGroup) {
      return pathGroupStrategy(pathGroup, mapProps);
    });
    childrenUrlParts.push.apply(childrenUrlParts, toConsumableArray(pathGroupUrlParts));
  }

  var childURL = childrenUrlParts.filter(function (part) {
    return part;
  }).join('&');

  return mainUrlParts + '&' + childURL;
};
var asyncStaticMapUrl = function asyncStaticMapUrl(props) {
  var requestStrategy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'native';

  return new Promise(function (resolve, reject) {
    var markers = props.markers,
        markerGroups = props.markerGroups,
        paths = props.paths,
        pathGroups = props.pathGroups,
        directions = props.directions,
        mapProps = objectWithoutProperties(props, ['markers', 'markerGroups', 'paths', 'pathGroups', 'directions']);


    if (!directions) {
      resolve(staticMapUrl(props));
    }

    var childrenUrlParts = [];

    if (Array.isArray(directions) && directions.length) {
      Promise.all(directions.map(function (direction) {
        return directionStrategy(direction, mapProps, requestStrategy);
      })).then(function (directionUrlParts) {
        childrenUrlParts.push.apply(childrenUrlParts, toConsumableArray(directionUrlParts));

        var dirs = props.directions,
            synchProps = objectWithoutProperties(props, ['directions']);

        var mainUrlParts = staticMapUrl(synchProps);
        var childURL = childrenUrlParts.filter(function (part) {
          return part;
        }).join('&');

        resolve(mainUrlParts + '&' + childURL);
      }).catch(reject);
    }
  });
};

export { staticMapUrl, asyncStaticMapUrl };
