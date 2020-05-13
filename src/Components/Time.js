import React from 'react';

const FORMAT_OPTIONS = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

export default class Time extends React.Component {
    constructor(props){
        super(props);
        this.tick = this.tick.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.state = {currentDate: new Date(), currentTime: new Date()};
    }

    formatTime(){
        const {currentTime} = this.state;
        return new Intl.DateTimeFormat("en-US", FORMAT_OPTIONS).format(currentTime);
      }

    tick() {
        this.setState({
          currentTime: new Date()
        });
      }
    
    
    componentDidMount() {
    this.intervalID = setInterval(
        () => this.tick(),
        1000
    )
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
        }

    render() {
        const {currentDate} = this.state;
        return (<div className="time">{currentDate.toDateString() + this.formatTime()}</div>);
    }

}
