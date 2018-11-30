# jayesstee.chartjs - [Chart.s](www.chartjs.org) plugin for [Jayesstee](jayesstee.org)

This module is a simple plugin to wrap the great [Chart.js](www.chartjs.org) graphing package for easy use within Jayesstee.

## Getting Started

In a Jayesstee project, install with:

    npm install --save jayesstee.chartjs
    
## Usage

This module is exposed as a [JstObject](jayesstee.org/types/jst-object.md) which can either be created and used
as is or optionally inherited from if some customization is needed.

    import {jst}        from 'jayesstee';
    import {JstChart}   from 'jayesstee.chart';
    
    let chartOpts = {
      type: 'bar',
      data: {
        labels: ["Red", "Blue"],
        datasets: [{
          label: '# of Votes',
          data: [12, 19],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    };
    
    let chart = new JstChart(chartOpts);
    jst("body").appendChild(chart);
    
 
