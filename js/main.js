
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

var RENT_ID = '#map--rent';
var RENT_CSV = '/data/rental-data.csv';
var RENT_SVG = d3.select(RENT_ID);

var CITIES = '/cities.csv';
var TOOLTIP;

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


function drawMap(earnings_data){
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
  TOOLTIP = d3.select("body")
    .append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);
}

function rentalPrices(rental_data, earnings_data){
  var data = rental_data;
  var projection = d3.geoAlbersUsa()
    .translate([500,250])
    .scale([1000]);
  var sel = document.getElementById('map--select-top');
  var sel_data = function(){
    switch(sel.options[sel.selectedIndex].value){
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
    .data(sel_data, function(d){return d.RegionName});

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
      TOOLTIP.transition()        
        .duration(200)      
        .style("opacity", .9);

      TOOLTIP.text(d.RegionName+"\n Median Rent: "+asCurrency(d.rent))
        .style("left", (d3.event.pageX) + "px")     
        .style("top", (d3.event.pageY - 28) + "px");
      this.parentNode.appendChild(this);
    })
    .on("mouseout", function(d) {       
      TOOLTIP.transition()        
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

function updateSelection(){
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

  earningsByMajor(all_data);
  drawMap(all_data);

  d3.csv(RENT_CSV, function(error, rent_data) {
    if (error) throw error;

    rentalPrices(rent_data, all_data);
  });
});

