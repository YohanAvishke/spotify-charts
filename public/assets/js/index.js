let tracks = []
let spotify_api = 'https://api.spotify.com/v1'

function getHashParams() {
    let hashParams = {}
    let e, r = /([^&=]+)=?([^&]*)/g,
        q = window.location.hash.substring(1)
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2])
    }
    return hashParams
}

function processLogin(isSuccess) {
    if (isSuccess) {
        $('#login').hide()
        $('#loggedin').show()
    } else {
        $('#login').show()
        $('#loggedin').hide()
    }
}

function getTracks(data) {
    data.items.forEach(function (item) {
        let temp = {
            "id": item.track.id,
            "played_at": item.played_at
        }
        tracks.push(temp)
    })
    getTracksFeatures()
    return tracks
}

function getTracksFeatures() {
    let ids = ""
    for (let i = 0; i < tracks.length; i++) {
        ids = ids.concat(tracks[i].id + ",")
    }
    renderData(null, "/audio-features/?ids=" + ids, null, false, getValence)
}

function getValence(data) {
    let temp = tracks
    tracks = []
    let features = data.audio_features
    for (let i = 0; i < features.length; i++) {
        let valence = features[i].valence
        let {id, played_at} = temp[i]
        tracks.push({
            "id": id,
            "played_at": played_at,
            "valence": String(valence)
        })
    }
    drawValenceChart()
    return tracks
}

function getPercentage(data) {
    const sum = data.reduce((partial_sum, number) => partial_sum + Number(number), 0);
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.trunc(((data[i] / sum) * 100) * 10) / 10
    }
    return data
}

function drawValenceChart(isSuccess) {
    let labels = []
    let data = []
    for (let i = 0; i < tracks.length; i++) {
        let {played_at, valence} = tracks[i]
        labels.push(played_at)
        data.push(valence)
    }
    renderChart("valency-chart", "horizontalBar", labels, data, getPercentage)
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

let params = getHashParams()

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error
