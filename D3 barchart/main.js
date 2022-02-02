import FetchWrapper from "./fetch-wrapper.js";

let req = new FetchWrapper('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData');

let data //para guardar la respuesta del fetch
let values = [] //para guardar los arrays con datos

let heightScale //escala para la altura de las barras
let xScale //donde se posicionan las barras en el eje x
let xAxisScale //Para dibujar el eje x en el elemento svg
let yAxisScale //para crear el eje y en el elemento svg

let width = 800
let height = 600
let padding = 40

let svg = d3.select('svg') //toma la referencia del primer elemento svg del html

const drawCanvas = () => { //funcion para crear el espacio de muestra de datos
    svg.attr('width', width)
    svg.attr('height', height)
}

const generateScales = () => { //generador de las escalas de los ejes

    heightScale = d3.scaleLinear()
                    .domain([0, d3.max(values, (item) => {
                        return item[1];
                    })])
                    .range([0, height - 2 * padding])

    xScale = d3.scaleLinear()
               .domain([0, values.length-1])
               .range([padding, width - padding])

    const datesArray = values.map(item => new Date(item[0]))

    xAxisScale = d3.scaleTime()
                   .domain([d3.min(datesArray), d3.max(datesArray)])
                   .range([padding, width - padding])

    yAxisScale = d3.scaleLinear()
                    .domain([0, d3.max(values, item => item[1])])
                    .range([height - padding, padding])
}

const drawBars = () => { //generados de las barras de datos

    let tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('visibility', 'hidden')
                    .style('width', 'auto')
                    .style('height', 'auto')

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', (width - 2 * padding) / values.length)
        .attr('data-date', item => item[0])
        .attr('data-gdp', item => item[1])
        .attr('height', item => heightScale(item[1]))
        .attr('x', (item, index) => xScale(index))
        .attr('y', item => (height - padding) - heightScale(item[1]))
        .on('mouseover', (item, value) => {
            tooltip.transition()
                    .style('visibility', 'visible')


            tooltip.text(value[0])

            document.querySelector('#tooltip').setAttribute('data-date', value[0]);
        })
        .on('mouseout', item => {
            tooltip.transition()
                    .style('visibility', 'hidden')
        })

}

const generateAxes = () => { //generador de los ejes

    let xAxis = d3.axisBottom(xAxisScale)
    
    svg.append('g')
       .call(xAxis)
       .attr("id", "x-axis")
       .attr("transform", "translate(0, " + (height - padding) + ")")

    let yAxis = d3.axisLeft(yAxisScale) //genera las clases tick

    svg.append('g')
       .call(yAxis)
       .attr("id", "y-axis")
       .attr("transform", "translate("+ (padding) + ", 0)")
}

//obteniendo los datos de la API

req.get('/master/GDP-data.json')
.then(info => {
    data = info
    values = info.data
    drawCanvas()
    generateScales()
    drawBars()
    generateAxes()
})


