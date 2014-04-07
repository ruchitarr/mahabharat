// GLOBALS
var width = 900,
    height = 900,
    outerRadius = Math.min(width, height) / 2 - 90,
    innerRadius = outerRadius - 60;

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius - 30);

// Outer Ring layout  
var layout = d3.layout.chord()
    .padding(0.035)
    .sortSubgroups(d3.ascending)
    .sortChords(d3.ascending);

// All the connections in the centre of the chart   
var path = d3.svg.chord()
    .radius(innerRadius);

var tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip hidden");

var grouptip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip group hidden");

var svg = d3.select
("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)  .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// KAurav label
svg.append("text").attr("class","entity kaurav")
    .text("kaurav")
   .attr("x", width / 2 - 50)
    .attr("y", -outerRadius + 50)
    .attr("text-anchor","end");

// Pandav label
svg.append("text").attr("class","entity pandav")
    .text("pandav")
    .attr("x", -width / 2 )
   .attr("y", outerRadius)
    .attr("text-anchor","start");

// Use built in formatting method to add commas to long numbers
// and ensure d3 returns rounded values.
var comma = d3.format(",.0f");    

// No transformations in this chart so pass in the data files
// and construct chart in one pass.
d3.csv("main3top100donors.csv", function(pandav) {
  d3.json("main3top100donors.json", function(matrix) {
    
    // Generate data matrix array
    layout.matrix(matrix);
    
    // Outer ring group for each kaurav and pandav
    var group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
        .attr("amount", function(d) { return comma(d.value); })
        .on("mouseover", dull(0.25))
        .on("mouseout", buff(1));

    // Add the group arcs and color according to whether
    // a political party or donor
    var groupArcPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .attr("class", "arc")
       // .style("stroke", function(d, i) { return donors[i].color; })
        .style("fill", function(d, i) { return pandav[i].color; });
    
    // Position label text for each group on the outer ring
    // Add a text label.
var label = group.append("text")
.attr("x", 6)
.attr("dy", 15);
 
label.append("textPath")
.attr("xlink:href", function(d, i) { return "#group" + i; })
.text(function(d, i) { return pandav[i].name; });

     // Add the chords linking the parties and donors
    var chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .attr("amount", function(d, i) { return (d.source.value); })
        .attr("recip", function(d) { return pandav[d.source.index].name; })
        .attr("pandav", function(d) { return pandav[d.target.index].name; })
        .style("stroke", function(d) { return pandav[d.source.index].color; })
          .style("fill", function(d) { return pandav[d.source.index].color; })
        .attr("d", path);
      // Add a tooltip with further information when user hovers on one of the chords  
        chord
      .on("mousemove", function(d, i) {
          var T = d3.event.pageX;
          var e = d3.event.pageY;
          var r = d3.select(this).attr("amount");
          var R = d3.select(this).attr("pandav");
          var y = d3.select(this).attr("recip");
          var infoBox = "<p>Donor: <b>" + R + " </b></p><p> Recipient: <b>" + y + "</b></p> <p>Amount given since 2010 election: <h4>&#163;" + comma(r) + ".</h4></p>";

          tooltip.classed("hidden", false)
          .attr("style", "left:"+ (T - 75) +"px;top:"+ (e - 180) +"px")
          .html(infoBox)
        })
        .on("mouseout",  function(){return tooltip.style("visibility", "hidden") });


    // Fade the chords except those related to selected group
    // activated on mouseover
    // and add data into centre of chart function showing total donations flow  
    // The function is passed the currently selected group and filters the data 
    // not connected to that group
    function dull(opacity) {
      return function(group, i) {
        svg.selectAll(".chord")
        .filter(function(d) {
          return d.source.index != i && d.target.index != i;
          })
        .transition(200)
        .style("fill", "#aabbcc")
        .style("stroke", "#aabbcc")
        .style("opacity", opacity);           

      var a = d3.select(this).attr("amount");
      var infoBox = "<span>" + a + "</span>";     
      // Central tooltip - Calculate the offset to that tooltip stays in the 
      // centre of the svg regardless of window size
      var $svg = $('svg');
      var offset = $svg.offset();
      var width = $svg.width();
      var height = $svg.height();

      var centreX = offset.left + width / 2;
      var centreY = offset.top + height / 2;

          grouptip.classed("hidden", false) 
            .attr("style", "left:"+ (centreX - 75) +"px;top:"+ (centreY - 20) +"px")
            .html(infoBox);
      }     
    }

    // Fade the chords back on mouseout of outer group elements 
    // and 'buff' up the colours remove tooltip from centre of chart function
    function buff(opacity) {
      return function(group, i) {
        svg.selectAll(".chord")
        .filter(function(d) {
          return d.source.index != i && d.target.index != i;
          })
        .transition(200)
        .style("stroke", function(d) { return pandav[d.source.index].color; })
          .style("fill", function(d) { return pandav[d.source.index].color; })
        .style("opacity", opacity);

        grouptip.style("visibility", "hidden");
      };
    }         
    
  });
});