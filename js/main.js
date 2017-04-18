
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

function asCurrency(amt) {
  return '$' + Intl.NumberFormat().format(amt);
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var lines = [[]];
    var LINE_HEIGHT = 1.1; // ems
    var x = text.attr("x");
    var y = text.attr("y");
    var dy = parseFloat(text.attr("dy"));
    var tspan = text.text(null).append("tspan");

    // Split the text by computing the wrap points
    var word;
    var numlines = 1;
    while (word = words.pop()) {
      var i = numlines - 1;
      lines[i].push(word);
      tspan.text(lines[i].join(" "));

      if (tspan.node().getComputedTextLength() > width) {
        lines[i].pop();
        lines.push([]);
        lines[i + 1] = [word];
        tspan.text(word);
        numlines += 1;
      }
    }

    tspan.remove();
    var n = lines.length;

    // Actually add the wrapped lines to the page
    lines.forEach(function(line, lineNumber) {
      text.append('tspan')
          .attr('x', x)
          .attr('y', y)
        .attr("dy", lineNumber * LINE_HEIGHT + dy - ((n - 1) / 2) + "em")
          .text(line.join(' '));
    });
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

  // ----- SVG Setup ----------------------------------------------------------
  // TODO(jez) Resize SVG height based on how many are in the selected category

  var margin = { top: 20, right: 20, bottom: 30, left: 150 };
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
      .call(d3.axisLeft(y))
    .selectAll('.tick text')
      .call(wrap, margin.left - TICK_OFFSET);

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

  all_data.forEach((d) => { d.major = titleCase(d.major) });
  earningsByMajor(all_data);
});
