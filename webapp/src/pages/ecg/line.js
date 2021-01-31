
import React from 'react';
import {Line} from 'react-chartjs-2';

const options = { 
maintainAspectRatio: false,
scales: {
  yAxes: [{
      ticks: {
        suggestedMax: 3000,
        suggestedMin: 1500
      }
  }]
},
  responsive:true,
  animation: {
    duration: 0
}
}

class LineGraph extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
      };
    }

  render() {
    var data = {
      labels: this.props.data[1],
      datasets: [
        {
          label: 'ECG',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(255,0,0,0.4)',
          borderColor: 'rgba(255,0,0,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(255,0,0,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(255,0,0,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.props.data[0],
        }
      ]
    };
    return (
        <Line options={options} height={window.innerHeight-20} data={data} redraw/>
    );
  }
}

export default LineGraph;