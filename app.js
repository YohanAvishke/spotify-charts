/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
require('dotenv').config();
let express = require('express') // Express web server framework
let request = require('request') // "Request" library
let cors = require('cors')
let querystring = require('querystring')
let cookieParser = require('cookie-parser')

let client_id = process.env.CLIENT_ID// Your client id
let client_secret = process.env.CLIENT_SECRET // Your secret
let redirect_uri = process.env.REDIRECT_URL // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
let generateRandomString = function (length) {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

let stateKey = 'spotify_auth_state'

let app = express()

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser())

app.get('/login', function (req, res) {

    let state = generateRandomString(16)
    res.cookie(stateKey, state)

    // your application requests authorization
    let scope = 'user-read-private user-read-email user-read-recently-played'
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
})

app.get('/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    let code = req.query.code || null
    let state = req.query.state || null
    let storedState = req.cookies ? req.cookies[stateKey] : null

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }))
    } else {
        res.clearCookie(stateKey)
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        }

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                let access_token = body.access_token,
                    refresh_token = body.refresh_token

                // we can also pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }))
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }))
            }
        })
    }
})

console.log('Listening on 8888')
app.listen(8888)
