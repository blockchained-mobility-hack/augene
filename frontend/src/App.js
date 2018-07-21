import React, { Component } from "react";
import { render } from "react-dom";

import { StaticMap } from "react-map-gl";
import DeckGL, { PathLayer } from "deck.gl";
import GL from "luma.gl/constants";
import * as RemoteData from "./remote-data";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import "./app.css";

const SERVER_ADDRESS = "http://172.27.65.168:5000";

const URLS = {
  DATA: `/mock-data.json`,
  TRIGGER_SIMULATION: `${SERVER_ADDRESS}/simulation`,
  SIMULATION_STATE: `${SERVER_ADDRESS}/state`,
  ROUTES: `${SERVER_ADDRESS}/routes`
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
    // console.log(props);
  }

  _updateView = () => {

    // if(this.state.clickState == null) { 
    // this.setState({
    //   viewState: {
    //     latitude: 48.7665,
    //     longitude: 11.4258,
    //     zoom: 8,
    //     maxZoom: 16,
    //     pitch: 20,
    //     bearing: this.state.viewState.bearing + 0.01
    //   }
    // });
    // }


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
    this.setState({ clickState: { x, y, object }} );
  };

  closeMetaView = () => {
       this.setState({ clickState: null } );
  };

  renderMetaView = () => {

    var classed = "metaview";
    if(this.state.clickState != null) {
      classed = "metaview active";
    }

    return (
        <div className={classed}>
          <div className="container">
            <div className="closebutton" onClick={this.closeMetaView}>Close</div>
            <div>This is a demo</div>
            <br/>
            <div>Hash <a href="#">#1234092385091834590-13458</a></div>
          </div>
        </div>
      );
  } 

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
    const { viewState } = this.state;
    const { hoverState } = this.state;
    const pathLayer = new PathLayer({
      id: "path-layer",
      pickable: true,
      data,
      getColor: d =>
        hoverState && hoverState.object.data.name === d.data.name
          ? [255, 0, 0, 255]
          : [255, 0, 0, 155],
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
        {this.renderMetaView}
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
    }).then(() => this.setState({
      hasTriggeredSimulation: true
    })).catch(e => {
      console.log(e);
    });
  }

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

    if(!this.state.hasTriggeredSimulation){
      return (
      <div className="publish-page">
        <div className="button" onClick={this.triggerSimulation}>
            DO IT
        </div>
      </div>
      )
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
