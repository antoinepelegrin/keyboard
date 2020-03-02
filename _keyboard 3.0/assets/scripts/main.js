d3.csv("http://localhost:9000/Documents/_keyboard 3.0/data/allCombinations.csv").then(function(data){

  dataset = data

  row1=["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  row2=["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
  row3=["A", "S", "D", "F", "G", "H", "J", "K", "L"]
  row4=["Z", "X", "C", "V", "B", "N", "M"]

  keyboard=[row1, row2, row3, row4]

  alphabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

  /* CRÉATION DE LA MATRICE */

  matrix = []

  for (j = 0 ; j < 36 ; j++){
    row = []
    var i = 0
    for (i = 0 ; i < 36 ; i++){
      row.push(0)
    }
    matrix.push(row)
  }

  function createMatrice(){

    dataset.forEach(d => {
      var line = alphabet.indexOf(d.combination[0])
      var col = alphabet.indexOf(d.combination[1])
      matrix[line][col] = parseInt(d.count)
    })

  }

  createMatrice()

  /* ÉCHELLE DE COULEUR */

  color = d3.scaleLinear()
  color.range(["#FFFFFF", "#FF0000"])

  /* CALCUL DU TOTAL D'UNE LIGNE */

  function total(index) {

    var total = 0
    matrix[index].forEach(element => {
      total += element
    })
    return total; 

  }

  /* CALCUL DES DOMAINES */

  function updateDomain(row, sum, index) {

    var unsorted = []
    row.forEach(d =>{
      unsorted.push(d)
    })
    
    var sorted = []
    row.forEach(d =>{
      sorted.push(d)
    })

    sorted.sort(d3.descending)

    var top5 = []
    var i = 0
    for (i=0; i<5 ; i++){
      top5.push(sorted[i])
    }
    
    var indices = []
    top5.forEach(d =>{
      indices.push(unsorted.indexOf(d))
    })

    _yDomain = []
    indices.forEach(d =>{
      element = alphabet[index] + alphabet[d]
      _yDomain.push(element)
    })

    var minRatio = Math.min(...row)/sum
    var maxRatio = Math.max(...row)/sum
    
    var min = Math.min(...row)
    var max = Math.max(...row)

    color.domain([minRatio, maxRatio])
    xScale.domain([min, max])
    yScale.domain(_yDomain)

  return [top5, _yDomain];

  }

  /* CALCUL DE LA CARTE DE CHALEUR */

  function heatMap(string) {

    var lower = string.toLowerCase()
    var index = alphabet.indexOf(lower)
    var sum = total(index)

    updateDomain(matrix[index], sum, index)
    
    svg.selectAll("rect.key").remove()
    svg.selectAll("text.key").remove()
    
    svg.selectAll("rect.key")
      .data(keyboard)
      .enter()
      .append("g")
      .each(function(d, i) {
        d3.select(this)
        .selectAll("rect")
        .data(d)
        .enter()
        .append("rect")
        .attr("class", "key")
        .attr("width", function(d){
          if (d == string){
            return width - 3
          }
          else {
            return width
          }
        })
        .attr("height", function(d){
          if (d == string){
            return height - 3
          }
          else {
            return height
          }
        })
        .attr("x", function(d, j) {
          if (d == string) {
            return xKey + 2 + i*20 + j*(width + 3)
          }
          else {
            return xKey + i*20 + j*(width + 3)
          }
        })
        .attr("y", function(d, j) {
          if (d == string) {
            return yKey + 1 + i*(height + 3)
          }
          else {
            return yKey + i*(height + 3)
          } 
        })
        .attr("stroke-width", function(d){
          if (d == string) {
            return 1.2
          }
          else {
            return 1
          }
        })
        .attr("fill", function(d) {
          var lettre = d.toLowerCase()
          var indice = alphabet.indexOf(lettre)
          if (indice != -1) {
          var value = matrix[index][indice]
          var shade = value/sum
          return color(shade);
        }
          else {
            return "white";
          }
        })
        .attr("stroke", function(d) {
          if (alphabet.indexOf(d.toLowerCase()) != -1) {
            return "black";
          }
          else {
            return "#C0C0C0";
          }
        })
        .on("click", function(d) {
        heatMap(d)
        barChart(d)
        })
        .on("mouseover", function(d){
          var lettre = d.toLowerCase()
          var indice = alphabet.indexOf(lettre)
          if (indice != -1) {
          d3.select(this)
            .style("cursor", "pointer")
            }
          })

    })
      
    svg.selectAll("text.key")
      .data(keyboard)
      .enter()
      .append("g")
      .each(function(d, i){
        d3.select(this)
          .selectAll("text")
          .data(d)
          .enter()
          .append("text")
          .attr("x", function(d, j) {
              if (d == string){
                return xKey + 2 + 3 + i*20 + j*(width + 3)
              }
              else {
                return xKey + 3 + i*20 + j*(width + 3)
              }    
          })
          .attr("y", function(d, j) {
            if (d == string){
              return yKey + 2 + 15 + i*(height + 3)
            }
            else {
              return yKey + 15 + i*(height + 3)
            }
            
          })
          .text(function(d) {
            return d;
          })
          .attr("fill", function(d) {
            if (alphabet.indexOf(d.toLowerCase()) != -1) {
              return "black";
            }
            else {
              return "#C0C0C0";
            } 
          })
        })
  }

  /* AXES */

  var barChartHeight = 200
  var barChartLength = 300 

  var xScale = d3.scaleLinear()
  xScale.range([0, barChartLength])

  var yScale = d3.scaleBand()
  yScale.range([0, barChartHeight])

  var xAxis = d3.axisTop(xScale).ticks(4).tickSizeOuter(0)
  var yAxis = d3.axisLeft(yScale).tickSizeOuter(0)

  /* BAR CHART */

  function barChart(string) {

  svg.selectAll("g.xAxis").remove()
  svg.selectAll("g.yAxis").remove()

  svg.append("g")
    .call(xAxis)
    .attr("transform", "translate(" + xBar + "," + yBar + ")")
    .attr("class", "xAxis")

  svg.append("g") 
    .call(yAxis)
    .attr("transform", "translate(" + xBar + "," + yBar + ")")
    .attr("class", "yAxis")

  d3.selectAll(".yAxis>.tick>text")
    .each(function(d, i){
      d3.select(this).style("font-size", "20px");
    });
    
  var lower = string.toLowerCase()
  var index = alphabet.indexOf(lower)
  var init = updateDomain(matrix[index], total(index), index)

  svg.selectAll("rect.bars")
    .data(init[0])
    .transition()
    .duration(1000)
    .attr("x", function(d, i){
      return xBar + 1;
    })
    .attr("y", function(d, i){
      return yBar + yScale.step()/4 + yScale(init[1][i]) ;
    })
    .attr("width", function(d){
      return xScale(d)
    })
    .attr("height", yScale.step()/2)
    .attr("fill", function(d){
      sum = total(index)
      shade = d/sum
      return color(shade)
    })
    

    svg.selectAll("rect.bars")
      .select("title")
      .data(init[0])
      .text(function(d, i){
        return d;
      })

    return 0;
  }

  /* INITIALISATION DU CLAVIER SVG*/

  body = d3.select("body")
  var svg = body.append("svg")
  svg.attr("width", 1500)
    .attr("height", 400);    
          
  width = 40
  height = 40
  yKey = 150
  xKey = 125

  heatMap("A")

  /* INITIALISATION DU BAR CHART */

  xBar = 625
  yBar = 135

  function initializeBars(){

    svg.append("g")
      .call(xAxis)
      .attr("transform", "translate(" + xBar + "," + yBar + ")")
      .attr("class", "xAxis")

    svg.append("g") 
      .call(yAxis)
      .attr("transform", "translate(" + xBar + "," + yBar + ")")
      .attr("class", "yAxis")

    d3.selectAll(".yAxis>.tick>text")
      .each(function(d, i){
        d3.select(this).style("font-size", "20px");
      });

    init = updateDomain(matrix[0], total(0), 0)

    text = ["TOP 5"]

    svg.selectAll("text.bars")
      .data("text")
      .enter()
      .append("text")
      .text("Combinaisons les plus communes")
      .attr("fill", "black")
      .attr("x", xBar + 10)
      .attr("y", yBar - 35)
      .attr("font-size", "20px")

    svg.selectAll("rect.bars")
      .data(init[0])
      .enter()
      .append("rect")
      .attr("class", "bars")
      .attr("x", function(d, i){
        return xBar + 1;
      })
      .attr("y", function(d, i){
        return yBar + yScale.step()/4 + yScale(init[1][i]) ;
      })
      .attr("width", function(d){
        return xScale(d)
      })
      .attr("height", yScale.step()/2)
      .attr("fill", function(d){
        sum = total(0)
        shade = d/sum
        return color(shade)
      })
      .append("title")
      .text(function(d){
        return d;
      })
  }

  initializeBars()

})