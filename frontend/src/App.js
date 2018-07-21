import React, { Component } from "react";
import { render } from "react-dom";

import { StaticMap } from "react-map-gl";
import DeckGL, { LineLayer, GeoJsonLayer } from "deck.gl";
import GL from "luma.gl/constants";
import * as RemoteData from "./remote-data";
import "./app.css";

const DATA_URL = {
  ROUTES: "/mock-data.json"
};

export const INITIAL_VIEW_STATE = {
  latitude: 48.7665,
  longitude: 11.4258,
  zoom: 8,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const { REACT_APP_MAPBOX_TOKEN } = process.env;

const buildLineSegments = routes => {
  return routes.map(route => {
    const { data } = route;
    const { waypoints } = data;
    const segments = waypoints
      .slice(0, waypoints.length - 1)
      .map((start, i) => {
        const end = waypoints[i + 1];
        return {
          start: [start.longitude, start.latitude],
          end: [end.longitude, end.latitude]
        };
      });
    return {
      ...route,
      data: {
        ...data,
        segments
      }
    };
  });
};

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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteData: RemoteData.loading(),
      hoveredObject: null
    };
  }

  componentWillMount() {
    fetch(DATA_URL.ROUTES)
      .then(r => r.json())
      .then(d =>
        this.setState({ remoteData: RemoteData.loaded(buildLineSegments(d)) })
      )
      .catch(e =>
        this.setState({
          remoteData: RemoteData.error(`Error Loading Data: ${e}`)
        })
      );
  }

  onHover = ({ x, y, object }) => {
    this.setState({ hoveredObject: { x, y, object } });
  };

  renderTooltip = () => {
    if (this.state.hoveredObject) {
      const { x, y, object } = this.state.hoveredObject;
      console.log(x, y);
      return (
        <div className="tooltip" style={{ left: x, top: y }}>
          <div>testtestset</div>
        </div>
      );
    }
    return null;
  };


  renderData = data => {
    const { viewState } = this.props;
    const lineLayers = data.map(({ data: d }) => {
      console.log(d);
      console.log(d.segments);
      return new LineLayer({
        id: d.name,
        pickable: true,
        data: d.segments,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        strokeWidth: 5,
        getColor: d => [255, 0, 0, 255],
        onHover: this.onHover
      });
    });

    return (
      <DeckGL
        layers={lineLayers}
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
