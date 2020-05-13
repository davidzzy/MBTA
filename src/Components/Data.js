import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Table } from 'react-bootstrap';
import * as axios from 'axios'; // for making API calls

const OPTIONS = [
    { value: 'place-north', label: 'North Station' },
    { value: 'place-sstat', label: 'South Station' }
  ];

const BASE_URL = 'https://api-v3.mbta.com';
const ROUTE_TYPE = 2; // 2=commuter rail
// const DIRECTION_ID = 0; // departuring from
const INCLUDES = ['stop', 'trip', 'schedule'];
const HEADERS = ['Time', 'Destination', 'Train #', 'Track #', 'Status'];

export default class Data extends React.Component{

  constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        this.buildUrl = this.buildUrl.bind(this);
        this.processResponse = this.processResponse.bind(this);
        this.state = {
            departures: null
        };
      }

  buildUrl(station){
    const filters = `filter[stop]=${station}&filter[route_type]=${ROUTE_TYPE}`;
    return `${BASE_URL}/predictions?${filters}&include=${INCLUDES.join()}`;
  }

  processResponse(response){
    const included = response.included;
    const predictionsResponse = response.data;
    if(predictionsResponse && included){
      // if departure_time is null, it means a final stop, so we remove those:
      const filteredDepartures = predictionsResponse.filter(dp => dp.attributes.departure_time !== null);

      const departures = [];

      // get trips, stops and schedules which we'll read from later:
      const trips = included.filter(dp => dp.type === 'trip');
      const stops = included.filter(dp => dp.type === 'stop');
      const schedules = included.filter(dp => dp.type === 'schedule');
      filteredDepartures.forEach(dp => {
        const status = get(dp, 'attributes.status');
        const name = get(dp, 'relationships.route.data.id');
        console.log(name);
        // get details from the stop by stopId so we can get the track
        const stopId = get(dp, 'relationships.stop.data.id');
        const stopInfo = stops.find(stop => stop.id === stopId);
        const track = get(stopInfo, 'attributes.platform_code');

        // get details from the trip by tripId so we can get the train #
        const tripId = get(dp, 'relationships.trip.data.id');
        const tripInfo = trips.find(trip => trip.id === tripId);
        const vehicle = get(tripInfo, 'attributes.name');

        // get details from the schedule by scheduleId so we can get the departure time
        const scheduleId = get(dp, 'relationships.schedule.data.id');
        const scheduleInfo = schedules.find(schedule => schedule.id === scheduleId);
        const departureTime = get(scheduleInfo, 'attributes.departure_time');

        // gather all the information
        departures.push({
          name,
          departureTime: new Date(departureTime),
          status,
          vehicle,
          track: (track !== null ? track : 'TBD')
        });
      });
      // sort departures in ascending order
      departures.sort((a, b) => a.departureTime - b.departureTime);
      this.setState({ departures });
      console.log(departures);
    }
  }

  getData(station){
    const url = this.buildUrl(station);

    const t = this;
    axios.get(url)
    .then(function (response) {
      if(response.status === 200 && response.data){
        console.log(response);
        t.processResponse(response.data);
      }
    })
    .catch(function (error) {
      throw error;
    });
  }

  setTimer(){
    const {selectedStation} = this.props;
    this.intervalID = setInterval(
      () => this.getData(selectedStation),
      60000
    );
  }

  formatTime(dateStr){
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateStr));
  }

  componentDidMount() { // Executed on the client side only after the first render.
    const {selectedStation} = this.props;
    this.getData(selectedStation);

    this.setTimer();
  }
  
  componentDidUpdate() { //Called immediately after rendering takes place.
    // const {selectedStation} = this.props;
    // this.getData(selectedStation);
  }


  componentWillUnmount() { //Executed just before rendering takes place both on the client as well as server-side.
    clearInterval(this.intervalID);
  }

  render() {
    const {departures} = this.state;
    return  <Table striped responsive variant="dark">
    <thead>
      <tr>
        {HEADERS.map(h => (
          <th key={h}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {departures && departures.map((d, index) => (
        <tr key={index}>
          <td>{this.formatTime(d.departureTime)}</td>
          <td>{d.name}</td>
          <td>{d.vehicle}</td>
          <td>{d.track}</td>
          <td>{d.status}</td>
        </tr>
      ))}
    </tbody>
  </Table>;
  }



}