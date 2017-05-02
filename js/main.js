
// ----- Constants ------------------------------------------------------------

// Categories
const ENGINEERING = 'Engineering';
const EDUCATION = 'Education';
const HUMANITIES = 'Humanities & Liberal Arts';
const BIOLOGY = 'Biology & Life Science';
const BUSINESS = 'Business';
const HEALTH = 'Health';
const COMPUTERS = 'Computers & Mathematics';
const AGRICULTURE = 'Agriculture & Natural Resources';
const SCIENCE = 'Physical Sciences';
const PSYCHOLOGY = 'Psychology & Social Work';
const SOCIAL_SCIENCE = 'Social Science';
const ARTS = 'Arts';
const INDUSTRIAL_ARTS = 'Industrial Arts & Consumer Services';
const LAW = 'Law & Public Policy';
const COMMUNICATIONS = 'Communications & Journalism';
const INTERDISCIPLINARY = 'Interdisciplinary';

// Bar chart
const CATEGORIES_NAV_ID = '#bar-chart--categories-nav-btn';
const EARNINGS_ID = '#bar-chart--earnings';
const CONTAINER_ID = '#bar-chart--container';
const EARNINGS_CSV = 'data/recent-grads.csv';
const EARNINGS_SVG = d3.select(EARNINGS_ID);

// Rentals
const RENT_ID = '#map--rent';
const RENT_CSV = 'data/rental-data.csv';
const RENT_SVG = d3.select(RENT_ID);

// Ticks
const TICK_OFFSET = 9;
const TICK_FONT_SIZE = 14;

// Earnings selection classes
const AGGREGATE = 'AGGREGATE';
const CATEGORY  = 'CATEGORY';
const MAJOR     = 'MAJOR';

// Cities selection classes
const TOP_SIZE = 'TOP_SIZE';
const TOP_RENT = 'TOP_RENT'
const BOT_RENT = 'BOT_RENT'

// Going to be initialized later, but should be constant
var _EARNINGS_DATA;
var _RENT_DATA;

// ----- Mutable state ------------------------------------------------------

var g_tooltip;

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


function drawMap(earnings_data) {
  // ----- SVG Setup -----
  var rect = RENT_SVG.node().getBoundingClientRect();

  var projection = d3.geoAlbersUsa()
      .translate([500,250])
          .scale([1000]);

  var path = d3.geoPath().projection(projection);
  var g = RENT_SVG.append('g');
  RENT_SVG.attr('viewBox', '0 0 ' + rect.width + ' ' + (rect.height*1.05));

  // ----- Map Drawing -----
  d3.json('https://raw.githubusercontent.com/alignedleft/d3-book/master/chapter_12/us-states.json', function(error, us) {
   if (error) throw error;

   g.attr('class', 'states')
    .selectAll('path')
               .data(us.features)
               .enter()
               .append('path')
               .attr('d', path);
  });

  // TODO(liza8bit) Allow for selection of major category
  var curCategory = SCIENCE;
  var data = earnings_data.filter((d) => d.major_category === curCategory)
    .map((d) => { return {major: d.major, median: d.median}; })
    .sort((d1, d2) => d1.median - d2.median)
  var majorOptions = document.getElementById('map--select-major').options;
  data.forEach( (d) => majorOptions.add(new Option(d.major, d.major)));
  var cities = RENT_SVG.append('g').attr('class', 'cities');
  g_tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
}

function rentalPrices(rental_data, earnings_data) {
  var data = rental_data;
  var projection = d3.geoAlbersUsa()
    .translate([500,250])
    .scale([1000]);
  var sel = document.getElementById('map--select-top');
  var sel_data = function() {
    switch(sel.options[sel.selectedIndex].value) {
        case '0':
          return data.slice(0,50);
          break;
        case '1':
          return data.sort((d1, d2) => d2.rent - d1.rent).slice(0,50);
          break;
        case '2':
          return data.sort((d1, d2) => d1.rent - d2.rent).slice(0,50);
          break;
    }};

  var circles = RENT_SVG.select('g.cities').selectAll('circle')
    .data(sel_data, function(d) {return d.RegionName});

  circles.exit()
    .transition()
    .duration(500)
    .style('opacity', 0)
    .remove();

  circles.enter()
    .append('circle')
    .attr('class', 'city')
    .attr('cx', function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr('cy', function(d) {
      return projection([d.lon, d.lat])[1];
    })
    .on('mouseover', function(d) {
      g_tooltip.transition()
        .duration(200)
        .style('opacity', .9);

      g_tooltip.text(d.RegionName+'\n Median Rent: '+asCurrency(d.rent))
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY - 28) + 'px');
      this.parentNode.appendChild(this);
    })
    .on('mouseout', function(d) {
      g_tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    })
    .transition()
    .duration(500)
    .attr('r', function(d) {
      return Math.sqrt(d.rent/6);
      })
    .merge(circles);
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

  // TODO(jez) Update map to use new global state etc.
  //drawMap();
  //rentalPrices();
}

document.querySelector(CATEGORIES_NAV_ID).addEventListener('click', (ev) => {
  ev.preventDefault();
  setActiveAggregate()
  render();
});

d3.csv(EARNINGS_CSV, function(error, allData) {
  if (error) throw error;
  allData.forEach((d) => { d.major = titleCase(d.major) });
  _EARNINGS_DATA = allData;

  d3.csv(RENT_CSV, function(error, rent_data) {
    if (error) throw error;
    _RENT_DATA = rent_data;

    render();
  });
});

