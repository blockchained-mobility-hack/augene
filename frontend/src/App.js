import React, { Component } from "react";
import { render } from "react-dom";

import { StaticMap } from "react-map-gl";
import DeckGL, { PathLayer } from "deck.gl";
import GL from "luma.gl/constants";
import * as RemoteData from "./remote-data";
import "./app.css";

const DATA_URL = {
  ROUTES: "/mock-data.json"
};

export const INITIAL_VIEW_STATE = {
  latitude: 51.1657,
  longitude: 10.4515,
  zoom: 6,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const { REACT_APP_MAPBOX_TOKEN } = process.env;

var dataDemo = [
  {
    inbound: 72633,
    outbound: 74735,
    from: {
      name: "19th St. Oakland (19TH)",
      coordinates: [11.62095, 48.21061]
    },
    to: {
      name: "12th St. Oakland City Center (12TH)",
      coordinates: [11.62095, 48.41061]
    }
  }
];

// const formatData = (data) => {
//   console.log("formatData:",data);
// }

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteData: RemoteData.loading(),
      hoverState: null,
      viewState: INITIAL_VIEW_STATE
    };
    // var t = setInterval(this._updateView, 10);
    // console.log(props);
  }

  _updateView = () => {
    this.setState({
      viewState: {
        latitude: 48.7665,
        longitude: 11.4258,
        zoom: 8,
        maxZoom: 16,
        pitch: 50,
        bearing: this.state.viewState.bearing + 0.1
      }
    });
  };

  componentWillMount() {
    fetch(DATA_URL.ROUTES)
      .then(r => r.json())
      .then(d => this.setState({ remoteData: RemoteData.loaded(d) }))
      .catch(e =>
        this.setState({
          remoteData: RemoteData.error(`Error Loading Data: ${e}`)
        })
      );
  }

  onHover = ({ x, y, object }) => {
    // console.log("hovered object", object);
    if (object == undefined) {
      this.setState({ hoverState: null });
    } else {
      this.setState({ hoverState: { x, y, object } });
    }
  };

  renderTooltip = () => {
    if (this.state.hoverState) {
      const { x, y, object } = this.state.hoverState;
      return (
        <div className="tooltip" style={{ left: x, top: y }}>
          {object.data.name}
        </div>
      );
    }
    return null;
  };

  renderData = data => {
    const { viewState } = this.props;
    const { hoverState } = this.state;
    const pathLayer = new PathLayer({
      id: "path-layer",
      pickable: true,
      data,
      getColor: d => hoverState && hoverState.object.data.name === d.data.name ? [255, 0, 0, 255] : [255, 0, 0, 155],
      getWidth: d => hoverState && hoverState.object.data.name === d.data.name ? 1000 : 200,
      widthMinPixels: 2,
      getPath: ({ data: route }) => route.waypoints.map(wp => [wp.longitude, wp.latitude]),
      onHover: this.onHover,
      updateTriggers: {
        getColor: {
          value: this.state.hoverState
        },
        getWidth: {
          value: this.state.hoverState
        }
      }
    });
    return (
      <DeckGL
        layers={pathLayer}
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
        {this.renderTooltip}
      </DeckGL>
    );
  };

  render() {
    const { remoteData } = this.state;
    switch (remoteData.state) {
      case RemoteData.LOADING:
        return <div>Loading...</div>;
      case RemoteData.ERROR:
        return <div>{remoteData.value}</div>;
      case RemoteData.LOADED:
        return this.renderData(remoteData.value);
    }
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
