(function() {
  'use strict';
  window.HeatmapView = SpinnerView.extend({
    template: 'templates/heatmap',

    render: function(options){
      if (!this.loading) {
        var self = this,
            data = this.model.toJSON(),
            dataArray = _.chain(data).toArray().uniq().sortBy(Number).value(),
            legend = [0].concat(_.map([0.2, 0.4, 0.6, 0.8], function(p) { return dataArray[Math.round((dataArray.length - 1) * p)]; }));
        this.decorator = function() { return {legend: legend}; };
      }

      SpinnerView.prototype.render.call(this, options);
      if (options.loading) { return; }

      var cellSize = this.$el.width() / 24 - 2 + .25 - 60/24,
          labelWidth = 60;

      new CalHeatMap().init({
        itemSelector: this.$('.heatmap').selector,
        domain: 'day',
        subDomain: 'hour',
        range: 7,
        data: this.model.toJSON(),
        start: new Date(2013, 5, 31),
        colLimit: 24,
        verticalOrientation: true,
        cellSize: cellSize,
        considerMissingDataAsZero: true,
        domainLabelFormat: '%a',
        label: {position: 'left', align: 'right', width: labelWidth},
        domainMargin: -2,
        tooltip: true,
        subDomainTitleFormat: {empty: '{date}', filled: '{date}'},
        subDomainDateFormat: function(date) {
          var counts = self.model.get(Number(date)).get('counts');
          return (data[Number(date) / 1000] || 0) + ' tweets ' +
            '<div class="percentage-chart list-inline">' +
              '<li class="positive-proportion" style="width: ' + counts.positive/counts.total * 100 + '%;"></li>' +
              '<li class="negative-proportion" style="width:' + counts.negative/counts.total * 100 + '%;"></li>' +
              '<li class="neutral-proportion" style="width:' + counts.neutral/counts.total * 100 + '%;"></li>' +
            '</div>';
        },
        displayLegend: false,
        legend: legend
      });

      $('.graph-rect').each(function() {
        $(this).attr('data-heatmap-timestamp', d3.select(this).data()[0].t);
      });

      this.$el.append('<style>.ch-tooltip {margin-top: ' + cellSize / 2 + 'px;' + ' margin-left: ' + (labelWidth - 2) + 'px;}</style>');
    }
  });
})();