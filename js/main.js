
var ENGINEERING = 'Engineering';
var EDUCATION = 'Education';
var HUMANITIES = 'Humanities & Liberal Arts';
var BIOLOGY = 'Biology & Life Science';
var BUSINESS = 'Business';
var HEALTH = 'Health';
var COMPUTERS = 'Computers & Mathematics';
var AGRICULTURE = 'Agriculture & Natural Resources';
var SCIENCE = 'Physical Sciences';
var PSYCHOLOGY = 'Psychology & Social Work';
var SOCIAL_SCIENCE = 'Social Science';
var ARTS = 'Arts';
var INDUSTRIAL_ARTS = 'Industrial Arts & Consumer Services';
var LAW = 'Law & Public Policy';
var COMMUNICATIONS = 'Communications & Journalism';
var INTERDISCIPLINARY = 'Interdisciplinary';

var EARNINGS_ID = '#bar-chart--earnings';
var EARNINGS_CSV = '/data/recent-grads.csv';
var EARNINGS_SVG = d3.select(EARNINGS_ID);

function asCurrency(amt) {
  return '$' + Intl.NumberFormat().format(amt);
}

function earningsByMajor(earnings_data) {

  // ----- SVG Setup ----------------------------------------------------------
  // TODO(jez) Resize SVG height based on how many are in the selected category
  // TODO(jez) Change the margin based on the longest label in the group

  var margin = { top: 20, right: 20, bottom: 30, left: 400 };
  var rect = EARNINGS_SVG.node().getBoundingClientRect();
  var width = rect.width - margin.left - margin.right;
  var height = rect.height - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleBand().range([height, 0]);

  var g = EARNINGS_SVG.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // ----- Data transformations -----------------------------------------------
  // TODO(jez) Refactor to let user select major category
  var curCategory = SCIENCE;
  var data = earnings_data.filter((d) => d.major_category === curCategory)
    .map((d) => { return {major: d.major, median: d.median}; })
    .sort((d1, d2) => d1.median - d2.median)

  x.domain([0, d3.max(data, (d) => d.median)]);
  y.domain(data.map((d) => d.major))
    .padding(0.1);

  var ticksFn = d3.axisBottom(x)
    .ticks(5)
    .tickFormat((d) => asCurrency(d))
    .tickSizeInner([-height]);

  g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(ticksFn);

  g.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(y));

  // TODO(jez) Write the value on top of the bar
  g.selectAll('.bar')
      .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('y', (d) => y(d.major))
      .attr('width', (d) => x(d.median))
}

d3.csv(EARNINGS_CSV, function(error, all_data) {
  if (error) throw error;

  earningsByMajor(all_data);
});
