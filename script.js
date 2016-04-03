(function() {
var width = 960,
    height = 800,
    cellSize = 25; // cell size

var no_months_in_a_row = Math.floor(width / (cellSize * 7 + 50));
var shift_up = cellSize * 1.5;

var day = d3.time.format("%w"), // day of the week
    day_of_month = d3.time.format("%e") // day of the month
    day_of_year = d3.time.format("%j")
    week = d3.time.format("%U"), // week number of the year
    month = d3.time.format("%m"), // month number
    year = d3.time.format("%Y"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");

var color = d3.scale.quantize()
    .domain([1, 9])
    .range(d3.range(8).map(function(d) { return "q" + d + "-9"; })); //coloring bucket

var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .html(getText);

      
//Format text to show in tooltip
function getText(d) {
  var lookup = {'A': 'Asian', 'B': 'black', 'H': 'Hispanic', 'N': 'Native American', 'O': 'Other', 'W': 'white'};

  if (d != undefined) {
    {
      if (d.values.length == 1)
        {return "Police killed 1 person who was " + lookup[d.values[0].race]; } 
      
      else 
        { 
          var count = {'A': 0, 'B': 0, 'H': 0, 'N': 0, 'O': 0, 'W': 0, 'U':0};
          d.values.forEach(function (el) {
            if (el.race == '') {
              count['U'] += 1;
            } else {
              count[el.race] += 1;
            }
          }); 

          var text = 'White: '+ count['W'] + '<br><br>' + 'Black: ' + count['B'] + '<br><br>' + 'Hispanic: ' + count['H'] + '<br><br>' + 'Asian: ' + count['A'] + '<br><br>' + 'Native American: ' + count['N'] + '<br><br>' + 'Other: ' + count['O'] + '<br><br>' + 'Unknown: ' + count['U'];
          return text;
          }
       }
     }
  };

//Declare SVG
var svg = d3.select("#chart").selectAll("svg")
    .data(d3.range(2015, 2016))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "YlOrRd")
    .attr('id', 'main-svg')
    .append("g")
    .call(responsive);

svg.call(tooltip);

//make the rectangles for days
var rect = svg.selectAll(".day")
    .data(function(d) { 
      return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) {
      var month_padding = 1.2 * cellSize*7 * ((month(d)-1) % (no_months_in_a_row));
      return day(d) * cellSize + month_padding; 
    })
    .attr("y", function(d) { 
      var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
      var row_level = Math.ceil(month(d) / (no_months_in_a_row));
      return (week_diff*cellSize) + row_level*cellSize*8 - cellSize/2 - shift_up;
    })
    .datum(format);

var month_titles = svg.selectAll(".month-title")  // Jan, Feb, Mar and the whatnot
      .data(function(d) { 
        return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("text")
      .text(monthTitle)
      .attr("x", function(d, i) {
        var month_padding = 1.2 * cellSize*7* ((month(d)-1) % (no_months_in_a_row));
        return month_padding;
      })
      .attr("y", function(d, i) {
        var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
        var row_level = Math.ceil(month(d) / (no_months_in_a_row));
        return (week_diff*cellSize) + row_level*cellSize*8 - cellSize - shift_up;
      })
      .attr("class", "month-title")
      .attr("d", monthTitle);


//Load the data
d3.csv("data.csv", function(error, csv) {
  
  var data = d3.nest()
    .key(function(d) { return d.date; }) //extract it by data
    .entries(csv);

    //console.log(data);

  var datesArray = [];

    data.forEach(function (d) {
      datesArray.push(d3.values(d)[0]);
    });

  //Dates that have had killings 
  a = rect.filter(function (d) { return datesArray.indexOf(d) > -1; })
  
  a.data(data)  
  .attr('class', function (d) {
    return "day " + color(d.values.length);
  });

  //  Tooltip
  rect.on("mouseover", tooltip.show);
  rect.on('mouseout', tooltip.hide);

});

// Legend
var legend = svg.selectAll('.legend')
             .data(d3.range(1,9));

//console.log(legend);

legend.enter().append('g')
.attr('class', 'legend')

// Legend rectangles
legend.append('rect')
.attr('x', function (d, i) { return i * 82; })
.attr('y', 35)
.attr('width', 80)
.attr('height', 30)
.attr('class', function (d) { return color(d); })

legend.exit().remove();

// Legend title
legend.append('text')
.attr('class', 'legend-title')
.text('Killed per day')
.attr('x', 5)
.attr('y', 25)

// Legend labels
legend.append('text')
.attr('class', 'label')
.text('1 person')
.attr('x', 5)
.attr('y', 85)

legend.append('text')
.attr('class', 'label')
.text('8 persons')
.attr('x', 600)
.attr('y', 85)


function monthTitle (t0) {
  return t0.toLocaleString("en-us", { month: "long" });
}

/* ---------------------------- 
MAKE CHART RESPONSIVE 
------------------------------ */

//http://jsfiddle.net/shawnbot/BJLe6/

// var the_chart = $("#main-svg"),
//         aspect = the_chart.width() / the_chart.height(),
//         container = the_chart.parent();
//         //console.log(container);

//     $(window).on("resize", function() {
//       var targetWidth = container.width();
//       the_chart.attr("width", targetWidth);
//       the_chart.attr("height", Math.round(targetWidth / aspect));
//     }).trigger("resize");

function responsive (svg) {
  var container = d3.select(svg.node().parentNode);
  //console.log(container);

  var width = parseInt(d3.select('#chart').style('width'), 10);
  var height = parseInt(d3.select('#chart').style('height'), 10);
    
    var aspectRatio = width / height;

    svg.attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMinYMid")
            .call(resize);

    d3.select(window).on('resize', resize);

    function resize() {
      var targetWidth = parseInt(container.style("width"));
      //console.log(targetWidth)
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspectRatio));
    }
 }
})();