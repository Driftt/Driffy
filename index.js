const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');


const CONVERSATION_API_BASE = 'https://conversation2.api.driftqa.com'

const TOKEN = process.env.BOT_API_TOKEN
const GIPHY_API_KEY = process.env.GIPHY_API_KEY

const MESSAGE_ID_TO_UPDATE_BY_CONVERSATION_ID = {}

const createReponseMessage = ({ orgId, giphyLink, searchParam, conversationId, replace = false}) => {
  const linkToSend = `<a href="${giphyLink}" rel="nofollow">${searchParam}</a>`
  const message = {
    'orgId': orgId,
    'body': linkToSend,
    'type': replace ? 'edit' : 'private_prompt',
    'buttons': [{
      'label': 'Send',
      'value': linkToSend,
      'type': 'reply',
      'style': 'primary',
      'reaction': {
        type: 'remove'
      }
    }, {
      'label': 'Shuffle',
      'value': searchParam,
      'type': 'action'
    }, {
      'label': 'Cancel',
      'value': 'cancel',
      'type': 'action',
      'reaction': {
        type: 'noop'
      }
    },]
  }
  const editedMessageId = MESSAGE_ID_TO_UPDATE_BY_CONVERSATION_ID[conversationId]
  return replace ? Object.assign(message, { editedMessageId, editType: 'replace' }) : message
}

const getGifAndSendMessage = (orgId, conversationId, messageId, searchParam, replace = false) => {
  return request.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchParam)}&limit=25&offset=0&rating=G&lang=en`)
    .end((err, response) => {
      const randomIndex = Math.floor(Math.random() * 25)
      const giphyLink = response.body.data[randomIndex].url
      return request.post(CONVERSATION_API_BASE + `/open/conversations/${conversationId}/messages`)
        .set('Content-Type', 'application/json')
        .set(`Authorization`, `bearer ${TOKEN}`)
        .send(createReponseMessage({ orgId, giphyLink, searchParam, conversationId, replace }))
        .end((err, response) => {
          if (err) {
            console.log(err)
            return
          }
          if (!replace) {
            MESSAGE_ID_TO_UPDATE_BY_CONVERSATION_ID[conversationId] = response.body.data.id
          }
        })
    })
}

const handleMessage = (orgId, data) => {
  if (data.type === 'private_note') {
    const messageBody = data.body
    const conversationId = data.conversationId
    if (messageBody.startsWith('/giphy')) {
      const searchParam = messageBody.replace('/giphy ', '')
      return getGifAndSendMessage(orgId, conversationId, conversationId, searchParam)
    }
  }
}

const handleButton = (orgId, data) => {
  const conversationId = data.conversationId
  const searchParam = data.button.value
  return getGifAndSendMessage(orgId, conversationId, conversationId, searchParam, true)
}

app.use(bodyParser.json())
app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))
app.post('/api', (req, res) => {
  if (req.body.type === 'new_message') {
    handleMessage(req.body.orgId, req.body.data)
  }
  if (req.body.type === 'button_action') {
    handleButton(req.body.orgId, req.body.data)
  }
  return res.send('ok')
})
