$(function () {
  var BIRTH_DATA = [
    [ 2007, 106898, 97516 ],
    [ 2008, 103937, 94796 ],
    [ 2009, 99492, 91818 ],
    [ 2010, 87213, 79673 ],
    [ 2011, 101943, 94684 ],
    [ 2012, 118848, 110633 ],
    [ 2013, 103120, 95993 ]
  ];

  var controller = {

    _dataTable: null,
    _dataChart: null,
    _onRezie: null,

    init: function () {
      this.renderTable();
      this.renderChart();
    },   

    renderTable: function () {
      if (this._dataTable) {
        return; // Already rendered.
      }
      this._dataTable = $("#app-data-table");

      var tr = null;
      var td = null;
      var data = null;
      var frag = document.createDocumentFragment();

      for (var i = 0, j = BIRTH_DATA.length; i < j; ++i) {
        tr = document.createElement("tr");
        tr.className = i % 2 === 1 ? "app-data-table__row--dark" : "";

        data = BIRTH_DATA[i];
        for (var n = 0, m = data.length; n < m; ++n) {
          td = document.createElement("td");
          td.textContent = data[n];
          td.className = "app-data-table__cell";
          if (n === 0) {
            td.className += " app-font-bold";
          }
          tr.appendChild(td);
        }

        frag.appendChild(tr);
      }
      this._dataTable.append(frag);
      this._dataTable.removeClass("app-display-no");
    },

    _startObserveResizeForChart: function () {
      if (this._onRezie) {
        return; // Already observing
      }
      // The resize event can be fired continuously.
      // We don't want to redraw the chart continuously,
      // which hurts the performance. 
      // Here we keep the redraw rate as 5 times/sec,
      // not so heavy and users could see the real time update,
      // to reach a balance between the responsiveness and the costs.
      this._onResize = (function () {
        if (this._redrawChartTimer) {
          return;
        }
        this._redrawChartTimer = window.setTimeout((function () {
          this._redrawChartTimer = null;
          this.renderChart();
        }).bind(this), 200);
      }).bind(this);
      window.addEventListener("resize", this._onResize);
    },

    _initChart: function () {
      if (this._dataChart) {
        return; // Already init;
      }
      // Have to get display first then it will get
      // the right dimesion when drawing the chart.
      $("#app-data-chart").removeClass("app-display-no");

      var yrs = [];
      var maleData = [];
      var femaleData = [];
      BIRTH_DATA.forEach(function (data) {
        var yr = data[0];
        yrs.push(yr);
        maleData.push([yr, data[1]]);
        femaleData.push([yr, data[2]]);
      });

      var data = [
        { label: "Men", data: maleData },
        { label: "Female", data: femaleData },
      ];
      var options = {
        series: {
          lines: { show: true },
          points: { show: true }
        },
        xaxis: {
          ticks: yrs,
          tickDecimals: 0
        },
        yaxis: {
          tickFormatter: function (v) {
            v = Math.floor(v/1000);
            return v + "k";
          }
        },
        grid: {
          backgroundColor: { colors: [ "#fff", "#eee" ] },
          borderWidth: {
            top: 1,
            right: 1,
            bottom: 2,
            left: 2
          }
        }
      };
      this._dataChart = $.plot("#app-data-chart", data, options);
      this._startObserveResizeForChart();
    },

    renderChart: function () {
      // `requestAnimationFrame` requires IE10 above
      // so take `setTimeout` as fallback.
      var doLater = window.requestAnimationFrame || window.setTimeout;
      // Let's not block the UI so do later.
      doLater((function () {
        this._initChart();
        this._dataChart.resize();
        this._dataChart.setupGrid();
        this._dataChart.draw();
      }).bind(this));
    }
  };

  controller.init();
});
