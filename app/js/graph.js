var width = document.getElementsByClassName('graph')[0].clientWidth,
    height = document.getElementsByClassName('graph')[0].clientHeight;

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    }).distance(100))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
        return d.radius;
    }));

var svg = d3.select('.graph').append("svg:svg")
    .attr("width", width)
    .attr("height", height);

///////////////////////////////////////////////////////////////////////////
/////////////////////////////// GLOW FILTER ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

var defs = svg.append("defs");

var filter = defs.append("filter")
    .attr("width", "300%")
    .attr("x", "-100%")
    .attr("height", "300%")
    .attr("y", "-100%")
    .attr("id", "glow");

filter.append("feGaussianBlur")
    .attr("class", "blur")
    .attr("stdDeviation", "3")
    .attr("result", "coloredBlur");

var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");


var randomPosition = function(d, size) {
    return Math.random() * size - 100;
}


function stars() {
    d3.json('data/stars.json', function(error, data) {

        d3.map(data, function(d) {
            d.x = randomPosition(d, width);
            d.y = randomPosition(d, height);
            d.active = false;
        });

        stars = svg.append('g')
            .attr("class", "nodes");

        var node = stars.selectAll('circle')
            .data(data)
            .enter().append("circle")
            .attr("r", 3)
            .attr('cx', function(d) {
                return d.x })
            .attr('cy', function(d) {
                return d.y })
            .style("filter", "url(#glow)");

        var text = stars.selectAll("text")
            .data(data)
            .enter().append("text")
            .attr("class", "node-text")

        text.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr("dx", 12)
            .attr("dy", "1.35em")
            .text(function(d) { return d.title })
            .style("text-anchor", "middle");

        node.on("click", function(d) {
            var active = d.active ? false : true,
                opacity = active ? 1 : 0;

            d3.selectAll("text")
                .filter(function(t) {
                    return t.title == d.title;
                })
                .style("opacity", opacity);

            d.active = active;
        });
    });
}

function vis() {

    d3.json('data/constellations.json', function(error, data) {
        var link = svg.append("g")
            .attr("class", "link")
            .selectAll("line")
            .data(data.links)
            .enter().append("line");

        var node = svg.selectAll('circle')
            .data(data.nodes)
            .filter(function(d) {
                return d.type != 'Dataset'
            })
            .enter().append("circle")
            // .attr("r", function(d) {
            //     d.weight = link.filter(function(l) {
            //         return l.source == d.id || l.target == d.id
            //     }).size();
            //     var minRadius = 2;
            //     return minRadius + (Math.log(d.weight));
            // })
            .attr("r", 3)
            .attr("class", function(d) {
                return d.label;
            })
            .style("filter", "url(#glow)")
            // .call(d3.drag()
            //     .on("start", dragstarted)
            //     .on("drag", dragged)
            //     .on("end", dragended));

        node
            .on("mouseover", function(d) {
                // Connected method => http://bl.ocks.org/micahstubbs/e5d0c64e487a8920e6b775f1244f8486
                node.attr('class', o => {
                    const isConnectedValue = isConnected(o, d);
                    if (isConnectedValue) {
                        return o.label;
                    } else {
                        return o.label + " secondary-node";
                    }
                });

                link
                    .classed('secondary-link', o => (o.source === d || o.target === d ? false : true));
            })
            .on("mouseout", function(d) {
                node.attr("class", function(d) {
                    return d.label;
                });

                link.classed("secondary-link", false)
            })
            .on("click", function(d) {
                console.log(d)
            });

        // node.append("text")
        //     .attr("class", "node-text")
        //     .attr("dx", 12)
        //     .attr("dy", ".35em")
        //     .text(function(d) { return d.label == 'Dataset' ? d.title : d.name; })
        //     .style("text-anchor", "middle");

        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation
            .force("link")
            .links(data.links)

        function ticked() {
            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node
                .attr("cx", function(d) {
                    console.log(d)
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                });

            let linkedByIndex = {};
            data.links.forEach((d) => {
                linkedByIndex[`${d.source.index},${d.target.index}`] = true;
            });

            function isConnected(n, m) {
                return isConnectedAsTarget(n, m) || isConnectedAsSource(n, m) || n.index === m.index;
            }

            function isConnectedAsSource(n, m) {
                return linkedByIndex[`${m.index},${n.index}`];
            }

            function isConnectedAsTarget(n, m) {
                return linkedByIndex[`${n.index},${m.index}`];
            }
        }
    })
}


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}


// vis(data);
stars();
