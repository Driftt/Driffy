# Driffy
Giphy for Drift

Requires a Giphy API key that can be created at: https://developers.giphy.com/

You can find your OAuth Access token at dev.drift.com
![OAuth token](https://d1ax1i5f2y3x71.cloudfront.net/items/073z1y1f3Q2F28381M3J/%5B8fbf40aa6cdb4864f1a68d0bc9e04eff%5D_Screen+Shot+2017-11-17+at+9.31.53+AM.png?X-CloudApp-Visitor-Id=2789091&v=7439000e)

## Deploying to Heroku

### CLI install 

1. `heroku create`

2. `git push heroku master`

3. `heroku config:set BOT_API_TOKEN={OAuth Access token}`

4. `heroku config:set GIPHY_API_KEY={Giphy API key}`

### GUI install

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Driftt/Driffy)

![Settings to configure](https://d1ax1i5f2y3x71.cloudfront.net/items/3J1C3i2X041V3N2L0x3J/Screen%20Shot%202017-11-14%20at%2011.34.44%20AM.png?X-CloudApp-Visitor-Id=2789091&v=99f8700c)


### Linking to dev.drift.com
Setup the request URL and actions

![Setup](https://d1ax1i5f2y3x71.cloudfront.net/items/0Z0z250P1H250E2N3q2x/%5B262ffbd648bec19450a399495e3ab892%5D_Screen+Shot+2017-11-17+at+9.31.36+AM.png?X-CloudApp-Visitor-Id=2789091&v=ffcd2046)
