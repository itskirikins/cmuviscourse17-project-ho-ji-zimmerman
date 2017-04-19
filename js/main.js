
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
var EARNINGS_CSV = 'data/recent-grads.csv';
var EARNINGS_SVG = d3.select(EARNINGS_ID);

var TICK_OFFSET = 9;
var TICK_FONT_SIZE = 14;

function asCurrency(amt) {
  return '$' + Intl.NumberFormat().format(amt);
}

function truncate(text, width) {
  text.each(function() {
    var self = d3.select(this);
    var textLength = self.node().getComputedTextLength();
    var fullContents = self.text();
    var words = fullContents.split(/\s+/);
    while (textLength > width && words.length > 0) {
      words.pop();
      self.text(words.join(' ') + ' …');
      textLength = self.node().getComputedTextLength();
    }
    self.append('title').text(fullContents);
  });
}

// From http://stackoverflow.com/a/6475125
function titleCase(title) {
  var i, j, str, lowers, uppers;
  str = title.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
      function(txt) {
        return txt.toLowerCase();
      });

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
      uppers[i].toUpperCase());

  return str;
}

function earningsByMajor(earnings_data) {

  // TODO(jez) Refactor to let user select major category
  var curCategory = ENGINEERING;
  var data = earnings_data.filter((d) => d.major_category === curCategory)
    .map((d) => { return {major: d.major, median: d.median}; })
    .sort((d1, d2) => d1.median - d2.median)

  var margin = { top: 20, right: 20, bottom: 30, left: 200 };
  var approxBarHeight = 25;
  EARNINGS_SVG.attr('height', data.length * approxBarHeight + margin.top + margin.bottom);
  var rect = EARNINGS_SVG.node().getBoundingClientRect();
  var width = rect.width - margin.left - margin.right;
  var height = rect.height - margin.top - margin.bottom;

  var g = EARNINGS_SVG.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var x = d3.scaleLinear().range([0, width])
  var y = d3.scaleBand().range([height, 0])

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
      .call(ticksFn)
      .attr('font-size', TICK_FONT_SIZE);

  g.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(y))
      .attr('font-size', TICK_FONT_SIZE)
    .selectAll('.tick text')
      .call(truncate, margin.left - TICK_OFFSET);

  // TODO(jez) Write the value on top of the bar
  g.selectAll('.bar')
      .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('y', (d) => y(d.major))
      .attr('width', (d) => x(d.median));
  // TODO(jez) Make bars clickable (should be able to have active bar)
}

d3.csv(EARNINGS_CSV, function(error, all_data) {
  if (error) throw error;

  all_data.forEach((d) => { d.major = titleCase(d.major) });
  earningsByMajor(all_data);
});
