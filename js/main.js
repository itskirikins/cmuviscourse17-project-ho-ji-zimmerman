
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

var RENT_ID = '#map--rent';
var RENT_CSV = 'data/rental-data.csv';
var RENT_SVG = d3.select(RENT_ID);

var TICK_OFFSET = 9;
var TICK_FONT_SIZE = 14;
var g_tooltip;

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


function drawMap(earnings_data) {
  // ----- SVG Setup ----------------------------------------------------------
  var rect = RENT_SVG.node().getBoundingClientRect();

  var projection = d3.geoAlbersUsa()
      .translate([500,250])
          .scale([1000]);

  var path = d3.geoPath().projection(projection);
  var g = RENT_SVG.append('g');
  RENT_SVG.attr('viewBox', '0 0 ' + rect.width + ' ' + (rect.height*1.05));

  // ----- Map Drawing --------------------------------------------------------
  d3.json("https://raw.githubusercontent.com/alignedleft/d3-book/master/chapter_12/us-states.json", function(error, us) {
   if (error) throw error;

   g.attr("class", "states")
    .selectAll("path")
               .data(us.features)
               .enter()
               .append("path")
               .attr("d", path);
  });

  // TODO(liza8bit) Allow for selection of major category
  var curCategory = SCIENCE;
  var data = earnings_data.filter((d) => d.major_category === curCategory)
    .map((d) => { return {major: d.major, median: d.median}; })
    .sort((d1, d2) => d1.median - d2.median)
  var majorOptions = document.getElementById('map--select-major').options;
  data.forEach( (d) => majorOptions.add(new Option(d.major, d.major)));
  var cities = RENT_SVG.append("g").attr("class", "cities");
  g_tooltip = d3.select('body')
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
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

  var circles = RENT_SVG.select("g.cities").selectAll("circle")
    .data(sel_data, function(d) {return d.RegionName});

  circles.exit()
    .transition()
    .duration(500)
    .style("opacity", 0)
    .remove();

  circles.enter()
    .append("circle")
    .attr("class", "city")
    .attr("cx", function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.lon, d.lat])[1];
    })
    .on("mouseover", function(d) {
      g_tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      g_tooltip.text(d.RegionName+'\n Median Rent: '+asCurrency(d.rent))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
      this.parentNode.appendChild(this);
    })
    .on("mouseout", function(d) {
      g_tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .transition()
    .duration(500)
    .attr("r", function(d) {
      return Math.sqrt(d.rent/6);
      })
    .merge(circles);
}

function updateSelection() {
  d3.csv(EARNINGS_CSV, function(error, all_data) {
    if (error) throw error;

    earningsByMajor(all_data);

    d3.csv(RENT_CSV, function(error, rent_data) {
      if (error) throw error;
      rentalPrices(rent_data, all_data);
    });
  });
}



d3.csv(EARNINGS_CSV, function(error, all_data) {
  if (error) throw error;

  all_data.forEach((d) => { d.major = titleCase(d.major) });
  earningsByMajor(all_data);
  drawMap(all_data);

  d3.csv(RENT_CSV, function(error, rent_data) {
    if (error) throw error;

    rentalPrices(rent_data, all_data);
  });
});

