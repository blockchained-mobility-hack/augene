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
  bearing: 0
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
      hoveredObject: null
    };
  }

  componentWillMount() {
    fetch("/mock-data.json")
      .then(r => r.json())
      .then(d => this.setState({ remoteData: RemoteData.loaded(d) }))
      .catch(e => this.setState({remoteData: RemoteData.error(`Error Loading Data: ${e}`)}))
    ;
  }

  _onHover = ({x, y, object}) => {
    
     this.setState({hoveredObject: {x, y, object}});
  }

  _renderTooltip = () => {
    if(this.state.hoveredObject){
          const { x, y, object } = this.state.hoveredObject;
console.log(x, y);
          return (
                <div className="tooltip" style={{left: x, top: y}}>
                  <div>testtestset</div>
                </div>
          )
    }
    return null;
  }
  
  renderData = (data) => {
    const { viewState } = this.props;

    //console.log(data);
    const layers = [
      new LineLayer({
        id: 'line-layer',
        data: dataDemo,
        pickable: true,
        getStrokeWidth: 12,
        getSourcePosition: d => {
          console.log(d);
          return d.from.coordinates
        } ,
        getTargetPosition: d => d.to.coordinates,
        getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0],
        onHover: this._onHover
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
