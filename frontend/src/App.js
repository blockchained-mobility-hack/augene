import React, { Component } from "react";
import { render } from "react-dom";

import { StaticMap } from "react-map-gl";
import DeckGL, { PathLayer } from "deck.gl";
import GL from "luma.gl/constants";
import * as RemoteData from "./remote-data";
import "./app.css";
import { Easing, Tween, autoPlay } from 'es6-tween'

const DATA_URL = {
  ROUTES: "/mock-data.json"
};

export const INITIAL_VIEW_STATE = {
  latitude: 50.1657,
  longitude: 10.4515,
  zoom: 6,
  maxZoom: 16,
  pitch: 50,
  bearing: 0,
  
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
      clickState: null,
      viewState: INITIAL_VIEW_STATE
    };
    var t = setInterval(this._updateView, 10);

     autoPlay(true);
  }

  _updateView = () => {

    if(this.state.clickState != null) { 

      const newViewState = {
        ...this.state.viewState,
        bearing: this.state.viewState.bearing+0.05
      }

      this.setState({
        viewState: newViewState
      });
    }


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

  onClickHandler = ({ x, y, object }) => {
    this.setState({ clickState: { x, y, object }} );
    this._animateIn({object});
  };
 
  _animateIn = ({object}) => {
      var that = this;

      var halfway = object.data.waypoints.length/2;
      let tween = new Tween(this.state.viewState)
      .to({  latitude: object.data.waypoints[halfway].latitude, longitude: object.data.waypoints[halfway].longitude,  zoom: 8, pitch:50, bearing:20 }, 2000)
      .on('update', ({latitude, longitude, zoom, pitch, bearing}) => {
         that.setState({
          viewState: {
            latitude: latitude,
            longitude: longitude,
            zoom: zoom,
            maxZoom: 16,
            pitch: pitch,
            bearing: bearing,
          }
        });
      }).start();
  }

  _animateOut = () => {

      var that = this;
      let tween2 = new Tween(that.state.viewState)
      .to({ latitude:  50.1657, longitude: 10.4515, zoom: 6, pitch: 50, bearing: 0 }, 2000)
      .on('update', ({latitude, longitude, zoom, pitch, bearing}) => {
        that.setState({
          viewState: {
              latitude: latitude,
              longitude: longitude,
              zoom: zoom,
              maxZoom: 16,
              pitch: pitch,
              bearing: bearing,
          }
        });
      }).start();
  }


  closeMetaView = () => {
       this.setState({ clickState: null } );

       // this.setState({
       //  viewState: INITIAL_VIEW_STATE
       // });
       this._animateOut();
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
            { this.state.clickState != null && 
              <div>
                <div>Name : {this.state.clickState.object.data.name}</div>
                <div>From : {this.state.clickState.object.data.from}</div>
                <div>To : {this.state.clickState.object.data.to}</div>
                <div>Hash : <a href={this.state.clickState.object.data.hash}>{this.state.clickState.object.data.hash}</a></div>
                <div>Proof : <a href={this.state.clickState.object.data.proof_link}>{this.state.clickState.object.data.proof_link}</a></div>
                <div>Consumption percentage : {this.state.clickState.object.data.consumption_percentage}</div>
                <div>Vehicle type : {this.state.clickState.object.data.vehicle_type}</div>
                <div>waypoints : {this.state.clickState.object.data.waypoints.length}</div>
                  
                


                
              </div>
            }
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
      getColor: d => hoverState && hoverState.object.data.name === d.data.name ? [0, 255, 0, 255] : [0, 255, 0, 155],
      getWidth: d => hoverState && hoverState.object.data.name === d.data.name ? 1000 : 200,
      widthMinPixels: 2,
      getPath: ({ data: route }) => route.waypoints.map(wp => [wp.longitude, wp.latitude]),
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

export function renderToDOM(container) {
  render(<App />, container);
}
