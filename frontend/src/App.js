import React, { Component } from "react";
import { render } from "react-dom";

import { StaticMap } from "react-map-gl";
import DeckGL, { LineLayer, GeoJsonLayer } from "deck.gl";
import GL from "luma.gl/constants";
import * as RemoteData from "./remote-data";
import './app.css';

const DATA_URL = {
  ROUTE: "/route.geo.json"
};

export const INITIAL_VIEW_STATE = {
  latitude: 48.7665,
  longitude: 11.4258,
  zoom: 8,
  maxZoom: 16,
  pitch: 50,
  bearing: 20
};




const { REACT_APP_MAPBOX_TOKEN } = process.env



var dataDemo = [
      {
        inbound: 72633,
        outbound: 74735,
        from: {
          name: '19th St. Oakland (19TH)',
          coordinates: [11.62095, 48.21061]
        },
        to: {
          name: '12th St. Oakland City Center (12TH)',
          coordinates: [11.62095, 48.41061]
       },
     }
    ];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteData: RemoteData.loading(),
      hoveredObject: null,
      viewState: INITIAL_VIEW_STATE
    };
    var t=setInterval(this._updateView,10);
    console.log(props);
  }

  _updateView = () => {
      this.setState({ viewState: {
  latitude: 48.7665,
  longitude: 11.4258,
  zoom: 8,
  maxZoom: 16,
  pitch: 50,
  bearing: this.state.viewState.bearing+0.1
} 

       })
      

     // console.log("update");

  }

  componentWillMount() {
    fetch("/mock-data.json")
      .then(r => r.json())
      .then(d => this.setState({ remoteData: RemoteData.loaded(d) }))
      .catch(e => this.setState({remoteData: RemoteData.error(`Error Loading Data: ${e}`)}))
    ;
  }

  _onHover = ({x, y, object}) => {
    //console.log(object);
      if(object == undefined) {
        console.log('set null')
           this.setState({hoveredObject: null});
      } else {
        this.setState({hoveredObject: {x, y, object}});
      }
    
  }

  _renderTooltip = () => {
    if(this.state.hoveredObject){
          const { x, y, object } = this.state.hoveredObject;
          return (
                <div className="tooltip" style={{left: x, top: y}}>
                  {object.to.name}
                </div>
          )
    }

    return null;
  }

  _changeColor = () => {
    if(this.state.hoveredObject) {
      return [255, 0, 0, 255];
    } else {
      return [255, 0, 0, 155];
    }
  }

  _changeStrokeWidth = () => {
    if(this.state.hoveredObject) {
      return 10;
    } else {
      return 2;
    }
  }
  
  renderData = (data) => {
    const { viewState } = this.state;
   

    //console.log(data);
    const layers = [
      new LineLayer({
        id: 'line-layer',
        data: dataDemo,
        pickable: true,
        getStrokeWidth: this._changeStrokeWidth,
        getSourcePosition: d => {
          return d.from.coordinates
        } ,
        getTargetPosition: d => d.to.coordinates,
        getColor: this._changeColor,
        onHover: this._onHover,
        updateTriggers: {
          getColor: {
           value: this.state.hoveredObject
          },
          getStrokeWidth: {
           value: this.state.hoveredObject
          }
        }
      })
      // new GeoJsonLayer({
      //   id: "geojson-layer",
      //   data,
      //   pickable: true,
      //   stroked: false,
      //   filled: true,
      //   extruded: true,
      //   lineWidthScale: 20,
      //   lineWidthMinPixels: 2,
      //   getFillColor: d => [255, 0, 0, 255],
      //   getLineColor: d => [255, 0, 0, 255],
      //   getRadius: 100,
      //   getLineWidth: 1,
      //   getElevation: 30
      //   // onHover: ({object}) => setTooltip(object.properties.name || object.properties.station)
      // })
    ];

    return (
      <DeckGL
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}

        viewState={viewState}
        controller={true}
        pickingRadius={5}
        parameters={{
          blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
          blendEquation: GL.FUNC_ADD
        }}
      >
        <StaticMap
          reuseMaps
          mapStyle="mapbox://styles/mapbox/dark-v9"
          preventStyleDiffing={true}
          mapboxApiAccessToken={REACT_APP_MAPBOX_TOKEN}
        />
       {this._renderTooltip}
      </DeckGL>

    );
  }

  render() {
    const { remoteData } = this.state;
    switch(remoteData.state){
        case RemoteData.LOADING:
          return <div>Loading...</div>
        case RemoteData.ERROR:
          return <div>{remoteData.value}</div>
        case RemoteData.LOADED:
          return this.renderData(remoteData.value);
    }
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
