var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener)
oReq.open("GET", "/api/v1")

oReq.send()


var data;

// var width = document.getElementsByClassName('graph').clientWidth,
//     height = document.getElementsByClassName('graph').clientHeight;

var width = d3.select(".graph").attr("width"),
    height = d3.select(".graph").attr("height");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.key;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var color = d3.scaleOrdinal(d3.schemeCategory20);

var svg = d3.select('.graph').append("svg:svg")
// .attr("width", width)
// .attr("height", height)

function vis(data) {
    console.log(data)

    // d3.json(data, function(error, data) {
    //     if (error) throw error;
    //
    //     console.log(data);
    //     // var node = svg.append("g")
    //     //     .attr("class", "node")
    //     //     .selectAll("circle")
    //     //     .enter().append("circle")
    //     //     .data(nodes)
    //     //     .attr("r", 5)
    //     //     .attr("fill", "black");
    //     //
    //     // console.log(node)
    //     //
    //     // var link = svg.append("g")
    //     //     .attr("class", "link")
    //     //     .selectAll("line")
    //     //     .data(links)
    //     //     .enter().append("line")
    //     //     .attr("stroke-width", 5);
    //     //
    //     // console.log(link)
    //     // simulation
    //     //     .nodes(nodes)
    //     //     .on("tick", ticked);
    //     //
    //     // simulation.force("link")
    //     //     .links(links)
    //     //
    //     // function ticked() {
    //     //     link
    //     //         .attr("x1", function(d) { return d.source.x; })
    //     //         .attr("y1", function(d) { return d.source.y; })
    //     //         .attr("x2", function(d) { return d.target.x; })
    //     //         .attr("y2", function(d) { return d.target.y; });
    //     //
    //     //     node
    //     //         .attr("cx", function(d) { return d.x; })
    //     //         .attr("cy", function(d) { return d.y; });
    //     // }
    // })
}

function reqListener() {
    var resp = JSON.parse(this.responseText);

    vis(resp);
}
