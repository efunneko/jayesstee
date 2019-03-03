import jst   from "jayesstee";
import Chart from "chart.js";

export class JstChart extends jst.Object {
  // The options for the this class are the same as
  // those that would be specified for chartjs (www.chartjs.org):
  // {
  //   type:     <type of chart>,
  //   data:     { datasets and labels },
  //   options:  { options from chartjs }
  // }
  constructor(optsAndData) {
    super();
    this.initialOptsAndData = optsAndData;
  }

  render() {
    return jst.$div({cn: "-chart"},
                    jst.$canvas({ref: "chartCanvas"})
                   );
  }

  postRender() {
    let chartContext = this.chartCanvas.el.getContext('2d');
    if (this.chart) {
      this.chart.update();
    }
    else {
      this.chart = new Chart(chartContext,
                             this.initialOptsAndData);
      delete(this.initialOptsAndData);
    }
  }

  // Merge in the chart's options
  updateOptions(opts) {
    this.chart.options = Object.assign(this.chart.options, opts);
    this.refresh();
  }

  // Just set the chart's options
  setOptions(opts) {
    this.chart.options = opts;
    this.refresh();
  }

  // Update a single dataset
  // TODO - needs a rethink - there isn't a 1-to-1 mapping
  // between labels and datasets
  updateDataset(label, dataset) {
    let index = this.chart.labels.indexOf(label);
    if (index >= 0) {
      this.chart.datasets[index] = dataset;
      this.refresh();
    }
  }

  // Remove the named dataset
  // TODO - needs a rethink - there isn't a 1-to-1 mapping
  // between labels and datasets
  removeDataset(label) {
    let index = this.chart.labels.indexOf(label);
    if (index >= 0) {
      this.chart.datasets.splice(index, 1);
      this.chart.labels.splice(index, 1);
      this.refresh();
    }
  }

  // Add a new dataset
  // TODO - needs a rethink - there isn't a 1-to-1 mapping
  // between labels and datasets
  addDataset(label, dataset) {
    this.chart.datasets.push(dataset);
    this.chart.label.push(label);
  }
  
}
