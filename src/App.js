import React, { useState, useRef, useEffect } from 'react';
import ReactMapGL, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl'
import Pin from './Pin'
import Geocoder from 'react-map-gl-geocoder'
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
function App() {
  const [location, setLocation] = useState({
    address: '',
    street: '',
    city: '',
    country: '',
    lat: '',
    lan: ''
  });
  const { address, street, city, lat, lan, country } = location;
  const [viewport, setViewport] = useState({
    // latitude: 27.727131,
    // longitude: 85.345673,
    latitude: 27.74,
    longitude: 85.37,
    width: '100%',
    height: '400px',
    zoom: 15,
  });
  const [searchresult, setSearchResult] = useState(null);
  const [marker, setMarker] = useState({
    latitude: 27.74,
    longitude: 85.37,
  });
  const [events, setEvents] = useState({})
  const [selected, setSelected] = useState(false);
  const [geo, setGeo] = useState({});
  const mapRef = useRef();
  const geocoderContainerRef = useRef();

  const logdragevents = (name, event) => {
    setEvents({
      ...events,
      [name]: event.lngLat
    });
  }
  const markerdragstart = e => {
    logdragevents('onDragStart', e);
    setSelected(false);
  }
  const markerdrag = e => {
    logdragevents('onDrag', e);
  }
  const markerdragend = e => {
    logdragevents('onDragEnd', e);
    setMarker({
      latitude: e.lngLat[1],
      longitude: e.lngLat[0]
    });

    setLocation({
      ...location,
      lat: e.lngLat[1],
      lan: e.lngLat[0]
    });
  }

  const fullscreenControlStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '10px'
  };
  const navStyle = {
    position: 'absolute',
    top: 36,
    left: 0,
    padding: '10px'
  };

  const handleChange = e => {
    setLocation({
      ...location,
      [e.target.name]: e.target.value
    })
  }
  const handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };
    setViewport({
      ...viewport,
      ...geocoderDefaultOverrides,
      viewport
    })
  }
  const handleOnResult = event => {
    console.log(event);
    setMarker({
      ...marker,
      latitude: event.result.center[1],
      longitude: event.result.center[0]
    });
  }

  useEffect(() => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${marker.longitude},${marker.latitude}.json?access_token=${process.env.REACT_APP_MAP_TOKEN}&country=np`)
      .then(res => res.json())
      .then(data => {
        let featurescontext = data.features;
        let country = '';
        let district = '';
        let state = '';
        let address = '';
        let locality = '';
        let city = '';
        let street = '';
        for (let fct of featurescontext) {
          let id = fct.id.split('.')[0];
          if (id === 'country') {
            country = fct.text;
          }
          if (id === 'district') {
            district = fct.text;
            city = fct.text;
          }
          if (id === 'region') {
            state = fct.text;
          }
          if (id === 'locality') {
            locality = fct.text;
          }
          if (id === 'place') {
            address = fct.place_name;
            street = fct.text
          }
        }
        setLocation({
          ...location,
          address,
          city,
          country,
          street,
          lat: marker.latitude,
          lan: marker.longitude
        })
      })
      .catch(err => console.log(err));
  }, [marker])
  return (
    <div className="App">
      <ReactMapGL
        ref={mapRef}
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAP_TOKEN}
        mapStyle="mapbox://styles/suprim/ck8pd2ye40csc1ik7173sf3a7"
        onViewportChange={(viewport) => { setViewport(viewport) }}
      >
        <div style={navStyle}>
          <NavigationControl onViewportChange={(viewport) => { setViewport(viewport) }} />
        </div>
        <div style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>
        <Marker
          latitude={marker.latitude}
          longitude={marker.longitude}
          offsetTop={-20}
          offsetLeft={-10}
          draggable={true}
          onDragStart={markerdragstart}
          onDragEnd={markerdragend}
          onDrag={markerdrag}
        >
          <Pin></Pin>
        </Marker>

        <Geocoder
          mapRef={mapRef}
          containerRef={geocoderContainerRef}
          onViewportChange={handleGeocoderViewportChange}
          onResult={handleOnResult}
          countries='np'
          reverseGeocode={true}
          mapboxApiAccessToken={process.env.REACT_APP_MAP_TOKEN}></Geocoder>


      </ReactMapGL>

      <form className="primary-form">
        <div className="form-group">
          <input type="text" name="address" value={address} onChange={handleChange} placeholder="Enter your address"></input>
        </div>
        <div className="form-group">
          <input type="text" name="street" value={street} onChange={handleChange} placeholder="Enter your street"></input>
        </div>
        <div className="form-group">
          <input type="text" name="city" value={city} onChange={handleChange} placeholder="Enter your city"></input>
        </div>
        <div className="form-group">
          <input type="text" name="country" value={country} onChange={handleChange} placeholder="Enter your country"></input>
        </div>
        <div className="form-group">
          <input type="text" name="lat" value={lat} onChange={handleChange} placeholder="Enter your country"></input>
        </div>
        <div className="form-group">
          <input type="text" name="lan" value={lan} onChange={handleChange} placeholder="Enter your country"></input>
        </div>
        <button type="submit" className="form-btn">Submit</button>
      </form>
    </div >
  );
}

export default App;
