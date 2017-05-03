
// ----- Constants ------------------------------------------------------------

// Bar chart
const CATEGORIES_NAV_ID = '#bar-chart--categories-nav-btn';
const EARNINGS_ID = '#bar-chart--earnings';
const CONTAINER_ID = '#bar-chart--container';
const EARNINGS_CSV = 'data/recent-grads.csv';
const EARNINGS_SVG = d3.select(EARNINGS_ID);

// Map
const CITIES_SELECT_ID = '#map--cities-selection';
const RENT_ID = '#map--rent';
const RENT_CSV = 'data/rental-data.csv';
const STATES_JSON = 'https://raw.githubusercontent.com/alignedleft/d3-book/master/chapter_12/us-states.json';
const RENT_SVG = d3.select(RENT_ID);
const PROJECTION = d3.geoAlbersUsa().translate([500,250]).scale([1000]);

// Ticks
const TICK_OFFSET = 9;
const TICK_FONT_SIZE = 14;

// Earnings selection classes
const AGGREGATE = 'AGGREGATE';
const CATEGORY  = 'CATEGORY';
const MAJOR     = 'MAJOR';

// Cities selection classes
const TOP_SIZE = 'top-size';
const TOP_RENT = 'top-rent'
const BOT_RENT = 'bot-rent'

// Going to be initialized later, but should be constant
var _EARNINGS_DATA;
var _RENT_DATA;
var _US_STATES;

// ----- Mutable state ------------------------------------------------------

var g_tooltip = d3.select('#map--tooltip');

var g_earningsSelection = {
  cls: CATEGORY,
  val: ENGINEERING,
};

var g_citiesSelection = TOP_SIZE;

// ----- State transition functions -----

function setActiveAggregate() {
  g_earningsSelection.cls = AGGREGATE;
  g_earningsSelection.val = null;
}

function setActiveCategory(newCategory) {
  g_earningsSelection.cls = CATEGORY;
  g_earningsSelection.val = newCategory;
}

function setActiveMajor(newCategory, newMajor) {
  g_earningsSelection.cls = MAJOR;
  g_earningsSelection.val = {
    category: newCategory,
    major: newMajor,
  };
}

function setCitiesSelection(newSelection) {
  g_citiesSelection = newSelection;
}

// ----- Helper functions -----------------------------------------------------

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

// From http://stackoverflow.com/a/34890276
var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// ----- Rendering functions --------------------------------------------------

function renderCategoriesNavBtn() {
  if (g_earningsSelection.cls === AGGREGATE) {
    document.querySelector(CATEGORIES_NAV_ID).classList.remove('enabled');
  }
  else {
    document.querySelector(CATEGORIES_NAV_ID).classList.add('enabled');
  }
}

function renderEarningsBars(barsData) {

  var margin = { top: 20, right: 20, bottom: 30, left: 200 };
  var approxBarHeight = 25;
  EARNINGS_SVG.attr('height', barsData.length * approxBarHeight + margin.top + margin.bottom);
  var rect = EARNINGS_SVG.node().getBoundingClientRect();
  var width = rect.width - margin.left - margin.right;
  var height = rect.height - margin.top - margin.bottom;

  var g = EARNINGS_SVG.select(CONTAINER_ID)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var x = d3.scaleLinear().range([0, width])
  var y = d3.scaleBand().range([height, 0])

  x.domain([0, d3.max(barsData, (d) => d.value)]);
  y.domain(barsData.map((d) => d.label))
    .padding(0.1);

  var ticksFn = d3.axisBottom(x)
    .ticks(5)
    .tickFormat((d) => asCurrency(d))
    .tickSizeInner([-height]);

  g.select('.x.axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(ticksFn)
      .attr('font-size', TICK_FONT_SIZE);

  g.select('.y.axis')
      .call(d3.axisLeft(y))
      .attr('font-size', TICK_FONT_SIZE)
    .selectAll('.tick text')
      .call(truncate, margin.left - TICK_OFFSET);

  // TODO(jez) Write the value on top of the bar
  bars = g.selectAll('.bar').data(barsData)
  bars.exit().remove();
  bars = bars.enter().append('rect').merge(bars);

  bars.attr('class', 'bar')
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('y', (d) => y(d.label))
      .attr('width', (d) => x(d.value))
      .classed('active', (d) => d.active)
      .on('click', (d) => {
        switch (g_earningsSelection.cls) {
          case AGGREGATE:
            setActiveCategory(d.label);
            break;
          case CATEGORY:
            var curCategory = g_earningsSelection.val;
            setActiveMajor(curCategory, d.label);
            break;
          case MAJOR:
            var curCategory = g_earningsSelection.val.category;
            var curMajor = g_earningsSelection.val.major;
            if (d.label === curMajor) {
              setActiveCategory(curCategory);
            }
            else {
              setActiveMajor(curCategory, d.label);
            }
            break;
          default:
            console.error('Broken invariant: invalid cls for g_earningsSelection');
            return;
        }

        render();
      });
}

function renderCitiesSelection() {
  document.querySelector(CITIES_SELECT_ID).value = g_citiesSelection;
}

function renderStates() {
  // Set up bounding box
  var rect = RENT_SVG.node().getBoundingClientRect();
  RENT_SVG.attr('viewBox', '0 0 ' + rect.width + ' ' + (rect.height*1.05));

  // Set up projection
  var path = d3.geoPath().projection(PROJECTION);

  // Draw map using projection
  var states = RENT_SVG
    .select('.states')
    .selectAll('path')
      .data(_US_STATES.features);

  states.exit().remove();
  states = states.enter().append('path').merge(states);

  states.attr('d', path);
}

function renderTooltip() {
  g_tooltip.style('opacity', 0);
}

function renderCities(rentalData, percentOfSalary, percentCutoff) {
  var circles = RENT_SVG.select('.cities').selectAll('circle')
      .data(rentalData);

  circles.exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();

  circles = circles.enter()
      .append('circle')
    .merge(circles);

  circles
      .attr('class', 'city')
      .attr('cx', (d) => PROJECTION([d.lon, d.lat])[0])
      .attr('cy', (d) => PROJECTION([d.lon, d.lat])[1])
      .on('mouseover', function(d) {
        g_tooltip.transition()
          .duration(200)
          .style('opacity', .9);

        g_tooltip.text(`${d.RegionName}\n Median Rent: ${asCurrency(d.rent)}`)
          .style('left', (d3.event.pageX + 20) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        g_tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
    .transition()
      .duration(500)
      .attr('r', (d) => Math.sqrt(d.rent / 6));
}

function render() {

  var barsData;

  // Compute function of global state + constant data to get renderable data
  switch (g_earningsSelection.cls) {
    case AGGREGATE:
      aggregated = barsData = groupBy(_EARNINGS_DATA, 'major_category');
      barsData = [];
      for (curCategory in aggregated) {
        if (!aggregated.hasOwnProperty(curCategory)) continue;

        var curMajors = aggregated[curCategory];
        var n = curMajors.length;

        // Compute average as (d1 / n) + ... + (dn / n)
        barsData.push(curMajors.reduce((acc, val) => ({
          label: acc.label,
          value: acc.value + (val.median / n),
          active: acc.active,
        }), {label: curCategory, value: 0, active: false}));
      }
      barsData = barsData.sort((d1, d2) => d1.value - d2.value);
      break;

    case CATEGORY:
      var curCategory = g_earningsSelection.val;
      barsData = _EARNINGS_DATA.filter((d) => d.major_category === curCategory)
        .map((d) => ({label: d.major, value: d.median, active: false}))
        .sort((d1, d2) => d1.value - d2.value);
      break;

    case MAJOR:
      var curCategory = g_earningsSelection.val.category;
      var curMajor    = g_earningsSelection.val.major;
      barsData = _EARNINGS_DATA.filter((d) => d.major_category === curCategory)
        .map((d) => ({label: d.major, value: d.median, active: d.major === curMajor}))
        .sort((d1, d2) => d1.value - d2.value);
      break;

    default:
      console.error('Broken invariant: invalid cls for g_earningsSelection');
      return;
  }

  renderCategoriesNavBtn();
  renderEarningsBars(barsData);

  renderCitiesSelection();
  renderStates();
  renderTooltip();

  var rentalData;
  switch (g_citiesSelection) {
    case TOP_SIZE:
      rentalData = _RENT_DATA.slice(0, 50);
      break;
    case TOP_RENT:
      rentalData = _RENT_DATA.sort((d1, d2) => d2.rent - d1.rent).slice(0, 50);
      break;
    case BOT_RENT:
      rentalData = _RENT_DATA.sort((d1, d2) => d1.rent - d2.rent).slice(0, 50);
      break;
    default:
      console.error('Broken invariant: invalid cities selection');
      break;
  }

  // TODO(jez) Compute these based on g_earningsSelection
  var percentOfSalary = 0;
  var percentCutoff = 100;

  renderCities(rentalData, percentOfSalary, percentCutoff);
}

document.querySelector(CATEGORIES_NAV_ID).addEventListener('click', (ev) => {
  ev.preventDefault();
  setActiveAggregate()
  render();
});

document.querySelector(CITIES_SELECT_ID).addEventListener('change', (ev) => {
  setCitiesSelection(ev.target.value);
  render();
});

d3.csv(EARNINGS_CSV, function(error, allData) {
  if (error) throw error;
  allData.forEach((d) => { d.major = titleCase(d.major) });
  _EARNINGS_DATA = allData;

  d3.csv(RENT_CSV, function(error, rentData) {
    if (error) throw error;
    _RENT_DATA = rentData;

    d3.json(STATES_JSON, function(error, usStatesData) {
      if (error) throw error;
      _US_STATES = usStatesData;

      render();
    });
  });
});

