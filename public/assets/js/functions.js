"use strict"

let spotify_api = 'https://api.spotify.com/v1'

let color = Chart.helpers.color;
let params = getHashParams()
let access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error
console.log(access_token)

function getHashParams() {
    let hashParams = {}
    let e, r = /([^&=]+)=?([^&]*)/g,
        q = window.location.hash.substring(1)
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2])
    }
    return hashParams
}

function getPercentage(data) {
    // const sum = data.reduce((partial_sum, number) => partial_sum + Number(number), 0);
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.trunc(((data[i]) * 100) * 10) / 10
    }
    return data
}

function renderData(template, url, target, isToAppend, successPreCall = null, successCallback = null, webChangeCall = null, errorCallback = null) {
    $.ajax({
        type: "get",
        url: spotify_api + url,
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + access_token
        },
        success: function (data, textStatus, jqXHR) {
            try {
                if (successPreCall) {
                    data = successPreCall(data)
                }
                if (template) {
                    let status = jqXHR.status
                    let templateStructure = $(template).html()
                    let output = Mustache.render(templateStructure, data)
                    if (isToAppend) {
                        $(target).append(output)
                    } else {
                        $(target).hide().html(output).fadeIn('slow')
                    }
                }
                if (successCallback) {
                    successCallback(data, textStatus, jqXHR)
                }
                if (webChangeCall) {
                    webChangeCall(true)
                }
            } catch (e) {
                console.log(e)
                alert("No data")
            }
        },
        error: function (jqXHR) {
            let status = jqXHR.status
            console.log(jqXHR)
            alert('Something went wrong')
            if (errorCallback != null) {
                errorCallback()
            }
        }
    })
}

function renderChart(canvas, type, labels, data, successPreCall = null) {
    let ctx = document.getElementById(canvas).getContext('2d')
    data = successPreCall(data)
    if (type === "line") {
        let myChart = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valence',
                    backgroundColor: color(window.chartColors['blue']).alpha(0.2).rgbString(),
                    borderColor: window.chartColors['blue'],
                    data: data,
                }],
            },
            options: {
                responsive: true,
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Valence chart'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Valence'
                        },
                        ticks: {
                            min: 0,
                            max: 100
                        }
                    }]
                }
            }
        })
    }
}
