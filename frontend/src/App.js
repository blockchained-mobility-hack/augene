import React, { Component } from "react";
import { render } from "react-dom";

import { StaticMap } from "react-map-gl";
import DeckGL, { PathLayer, IconLayer } from "deck.gl";
import GL from "luma.gl/constants";
import * as RemoteData from "./remote-data";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./app.css";
import { Easing, Tween, autoPlay } from "es6-tween";

const SERVER_ADDRESS = "http://178.128.206.215:5000";

const URLS = {
  DATA: `${SERVER_ADDRESS}/routes`,
  // DATA: `/mock-data.json`,
  TRIGGER_SIMULATION: `${SERVER_ADDRESS}/simulation`,
  SIMULATION_STATE: `${SERVER_ADDRESS}/state`,
  ROUTES: `${SERVER_ADDRESS}/routes`
};

export const INITIAL_VIEW_STATE = {
  latitude: 50.1657,
  longitude: 10.4515,
  zoom: 6,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const { REACT_APP_MAPBOX_TOKEN } = process.env;

const getBatteryCharge = (d) => {
  return d.data.waypoints[d.data.waypoints.length - 1].battery_state_of_charge;
}

const getColorForBatteryCharge = (ch) => {
  if(ch < 0) {
    return [220, 0, 80, 255]
  } else if(ch < 10) {
    return [255, 165, 0, 255]
  } else {
    return [80, 220, 100, 255]
  }
}

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteData: RemoteData.loading(),
      hoverState: null,
      clickState: null,
      viewState: INITIAL_VIEW_STATE
    };
    var t = setInterval(this._updateView, 10);

    autoPlay(true);
  }

  _updateView = () => {
    if (this.state.clickState != null) {
      const newViewState = {
        ...this.state.viewState,
        bearing: this.state.viewState.bearing + 0.05
      };

      this.setState({
        viewState: newViewState
      });
    }
  };

  componentWillMount() {
    fetch(URLS.DATA)
      .then(r => r.json())
      .then(d => this.setState({ remoteData: RemoteData.loaded(d) }))
      .catch(e =>
        this.setState({
          remoteData: RemoteData.error(`Error Loading Data: ${e}`)
        })
      );
  }

  onHover = ({ x, y, object }) => {
    if (object == undefined) {
      this.setState({ hoverState: null });
    } else {
      this.setState({ hoverState: { x, y, object } });
    }
  };

  onClickHandler = ({ x, y, object }) => {
    this.setState({ clickState: { x, y, object } });
    this._animateIn({ object });
  };

  _animateIn = ({ object }) => {
    var that = this;

    var halfway = Math.round(object.data.waypoints.length / 2);
    let tween = new Tween(this.state.viewState)
      .to(
        {
          latitude: object.data.waypoints[halfway].latitude,
          longitude: object.data.waypoints[halfway].longitude,
          zoom: 8,
          pitch: 50,
          bearing: 20
        },
        2000
      )
      .on("update", ({ latitude, longitude, zoom, pitch, bearing }) => {
        that.setState({
          viewState: {
            latitude: latitude,
            longitude: longitude,
            zoom: zoom,
            maxZoom: 16,
            pitch: pitch,
            bearing: bearing
          }
        });
      })
      .start();
  };

  _animateOut = () => {
    var that = this;
    let tween2 = new Tween(that.state.viewState)
      .to(
        {
          latitude: 50.1657,
          longitude: 10.4515,
          zoom: 6,
          pitch: 50,
          bearing: 0
        },
        2000
      )
      .on("update", ({ latitude, longitude, zoom, pitch, bearing }) => {
        that.setState({
          viewState: {
            latitude: latitude,
            longitude: longitude,
            zoom: zoom,
            maxZoom: 16,
            pitch: pitch,
            bearing: bearing
          }
        });
      })
      .start();
  };

  closeMetaView = () => {
    this.setState({ clickState: null });

    // this.setState({
    //  viewState: INITIAL_VIEW_STATE
    // });
    this._animateOut();
  };

  renderMetaView = () => {
    var classed = "metaview";
    if (this.state.clickState != null) {
      classed = "metaview active";
    }
    return (
      <div className={classed}>
        <div className="container">
          <div className="closebutton" onClick={this.closeMetaView}>
            Close
          </div>
          {this.state.clickState != null && (
            <div>
              <div>Name : {this.state.clickState.object.data.name}</div>
              <div>From : {this.state.clickState.object.data.from}</div>
              <div>To : {this.state.clickState.object.data.to}</div>
              <div>
                Hash :{" "}
                <a href={this.state.clickState.object.data.hash}>
                  {this.state.clickState.object.data.hash}
                </a>
              </div>
              <div>
                Proof :{" "}
                <a href={this.state.clickState.object.data.proof_link}>
                  {this.state.clickState.object.data.proof_link}
                </a>
              </div>
              <div>
                Consumption percentage :{" "}
                {this.state.clickState.object.data.consumption_percentage}
              </div>
              <div>
                Vehicle type : {this.state.clickState.object.data.vehicle_type}
              </div>
              <div>
                waypoints : {this.state.clickState.object.data.waypoints.length}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  renderTooltip = () => {
    if (this.state.hoverState) {
      const { x, y, object } = this.state.hoverState;
      return (
        <div className="tooltip" style={{ left: x, top: y }}>
          <div>{object.data.name}</div>
          <div>Consumption percentage <b>{object.data.consumption_percentage}</b></div>
        </div>
      );
    }
    return null;
  };
  


  renderData = data => {
    const { viewState } = this.state;
    const { hoverState } = this.state;
    // consol.elog
    console.log(data.map(getBatteryCharge));
    const pathLayer = new PathLayer({
      id: "path-layer",
      pickable: true,
      data,
      getColor: d => {
        const [r, g, b] = getColorForBatteryCharge(d);
        const a = hoverState && hoverState.object.data.name === d.data.name ? 255 : 150;
        return [r, g, b, a];
      },
      getWidth: d =>
        hoverState && hoverState.object.data.name === d.data.name ? 1000 : 200,
      widthMinPixels: 2,
      getPath: ({ data: route }) =>
        route.waypoints.map(wp => [wp.longitude, wp.latitude]),
      onHover: this.onHover,
      onClick: this.onClickHandler,
      updateTriggers: {
        getColor: {
          value: this.state.hoverState
        },
        getWidth: {
          value: this.state.hoverState
        }
      }
    });

    const iconLayer = new IconLayer({
      id: "icon-layer",
      data,
      iconAtlas: "/icon-atlas.png",
      pickable: true,
      iconMapping: {
        marker: {
          x: 0,
          y: 0,
          width: 128,
          height: 128,
          anchorY: 128,
          mask: true
        }
      },
      sizeScale: 10,
      getPosition: ({data: route}) => {
        const last = route.waypoints[route.waypoints.length - 1];
        console.log(last);
        return [last.longitude, last.latitude]
      },
      getIcon: d => "marker",
      getSize: d => 5,
      getColor:  getColorForBatteryCharge
    });

    return (
      <DeckGL
        layers={[pathLayer, iconLayer]}
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
        {this.renderMetaView}
        <div className="banner">
            <div>AuGeNe Explore &nbsp;&nbsp;&nbsp; Overcome your range anxiety 🏁</div>
            <div>Powered by IOTA Tangle</div>
        </div>
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

const mockFetch = url => {
  switch (url) {
    case "/state": {
      return Promise.resolve({
        routes: 20,
        available_route_proofs: 7
      });
    }
  }
};

class Publish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // hasTriggeredSimulation: false,
      hasTriggeredSimulation: false,
      // simulationState: null,
      simulationState: null
    };
  }

  triggerSimulation = () => {
    console.log("tigerring");
    fetch(URLS.TRIGGER_SIMULATION, {
      method: "POST",
      mode: "cors"
    })
      .then(() =>
        this.setState({
          hasTriggeredSimulation: true
        })
      )
      .catch(e => {
        console.log(e);
      });
  };

  fetchSimulationState = () => {
    fetch(URLS.SIMULATION_STATE)
      .then(res => res.json())
      .then(state => {
        this.setState({
          simulationState: state
        });
      })
      .catch(e => {
        // console.log(e);
      });
  };

  componentDidMount() {
    this.fetchSimulationState();
    this.polling = setInterval(this.fetchSimulationState, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  render() {
    if (!this.state.simulationState) {
      return <div>Loading...</div>;
    }

    if (!this.state.hasTriggeredSimulation) {
      return (
        <div className="publish-page">
          <div className="button" onClick={this.triggerSimulation}>
            DO IT
          </div>
        </div>
      );
    }
    return (
      <div className="publish-page">
        <div className="stats">
          <div className="stat">
            <div>Total Routes:</div>
            <div>{this.state.simulationState.routes}</div>
          </div>
          <div className="stat">
            <div>Available Proofs:</div>
            <div>{this.state.simulationState.available_route_proofs}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Map} />
          <Route path="/publish" component={Publish} />
        </Switch>
      </Router>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
