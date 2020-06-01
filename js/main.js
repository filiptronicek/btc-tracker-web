function getRandomColor() {
  // https://stackoverflow.com/a/1484514/10199319
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updateStats() {
  const chartDiv = document.querySelector("#chart");
  chartDiv.innerHTML = "";
  const city = document.getElementById("rate").value;
  const today = moment().subtract(0, "days").format("YYYY.MM");

  let metric;
  let lbl;
  let unit;

  const m = city;

  if (m === "usd") {
    metric = 1;
    lbl = "USD";
    unit = "$";
  } else if (m === "czk") {
    metric = 2;
    lbl = "CZK";
    unit = ",-";
  }

  const url = `https://raw.githubusercontent.com/filiptronicek/btc-tracker/master/data/stats/${today}.csv`;

  $.get(url, function (data) {
    const lddPoints = getDataPointsFromCSV(data, metric);
    let xs = [];
    let ys = [];
    for (let i of lddPoints) {
      xs.push(i.x);
      ys.push(i.y);
    }
    console.log("Formatted outputs: ");
    const filteredy = ys.filter(function (value, index, ar) {
      return index % 2 == 0;
    });
    const filteredx = xs.filter(function (value, index, ar) {
      return index % 2 == 0;
    });
    const options = {
      series: [
        {
          name: lbl,
          data: ys,
        },
      ],
      responsive: [
        {
          breakpoint: 1000,
          options: {
            series: [
              {
                data: filteredy,
                labels: lbl,
              },
            ],
            xaxis: {
              categories: filteredx,
              title: {
                text: "Time",
              },
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
      },
      colors: [getRandomColor()],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        align: "center",
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            if(unit === '$') return unit + Number.parseFloat(val).toFixed(2);
            else return Number.parseFloat(val).toFixed(2) + unit;
          },
        },
      },
      xaxis: {
        categories: xs,
        title: {
          text: "Time",
        },
      },
    };

    const chart = new ApexCharts(chartDiv, options);
    chart.render();
  });
}

function getDataPointsFromCSV(csv, metric) {
  const dataPoints = (csvLines = points = []);
  csvLines = csv.split(/[\r?\n|\r|\n]+/);

  const maxData = 60;

  const ratio = (csvLines.length / maxData).toFixed(0);
  console.log(csvLines.length);
  console.log(ratio);
  const tz = moment.tz("Europe/Prague");
  const offset = (tz.utcOffset() - (tz.utcOffset() % 60)) / 60;

  for (let i = 0; i < csvLines.length; i++)
    if (csvLines[i].length > 0 && csvLines[i].split(',') && i > 1) {
      points = csvLines[i].split(",");
      const time = points[0].split(" ")[1];
      if(i % ratio === 0) {
        dataPoints.push({
          x: (parseFloat(time)+offset) % 24,
          y: parseInt(points[metric]),
        });
      }
    }
  return dataPoints;
}

updateStats();
setInterval(() => {
  updateStats();
}, 40000);
