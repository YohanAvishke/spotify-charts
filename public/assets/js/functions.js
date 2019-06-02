"use strict"

let spotify_api = 'https://api.spotify.com/v1'

let params = getHashParams()
let access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error

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
    const sum = data.reduce((partial_sum, number) => partial_sum + Number(number), 0);
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.trunc(((data[i] / sum) * 100) * 10) / 10
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
    if (type === "horizontalBar") {
        let myChart = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valency', // Name the series
                    data: data, // Specify the data values array
                    backgroundColor: '#14B2A1',
                    hoverBackgroundColor: '#108e80'
                }],
            },
            options: {
                responsive: true, // Instruct chart js to respond nicely.
                maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                min: 0,
                                max: 100
                            }
                        },
                    ],
                }
            }
        })
    }
}
