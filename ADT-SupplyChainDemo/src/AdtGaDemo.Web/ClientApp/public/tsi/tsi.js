window.renderTsi = function () {
  var data = [];
  for(var i = 1; i <= 4; i++) {
    data.push({[`Line ${i} Storage`]: window.tsiData[i-1]});
  }

  // render the data in a chart
  var onElementClick = function (aggKey, sb, ts, measures) { console.log(aggKey, sb, ts, measures); }
  var tsiClient = new TsiClient();
  var lineChart = new tsiClient.ux.LineChart(document.getElementById('linechart'));
  lineChart.render(data,
    {theme: 'dark', legend: 'shown', grid: true, tooltip: true, brushMoveEndAction: () => {}},
    [{ color: "#ffd400" }, { color: "#22b573" }, { color: "#29abe2" }, { color: "#a952a5" }]);
};
