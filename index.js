const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');


const CONVERSATION_API_BASE = 'https://driftapi.com/v1/conversations'

const TOKEN = process.env.BOT_API_TOKEN
const GIPHY_API_KEY = process.env.GIPHY_API_KEY

const sendMessage = (conversationId, message) => {
  return request.post(CONVERSATION_API_BASE + `/${conversationId}/messages`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${TOKEN}`)
    .send(message)
    .catch(err => console.log(err))
}

const createReponseMessage = ({ orgId, giphyLink, searchParam, editedMessageId, replace = false}) => {
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
        'type': 'delete'
      }
    }, {
      'label': 'Shuffle',
      'value': `driffy-${searchParam}`,
      'type': 'action'
    }, {
      'label': 'Cancel',
      'value': 'cancel',
      'type': 'noop', // switch to noop
    },]
  }
  return replace ? Object.assign(message, { editedMessageId, editType: 'replace' }) : message
}

const createDeleteMessage = (orgId, idToDelete) => {
  return {
    orgId,
    type: 'edit',
    editedMessageId: idToDelete,
    editType: 'delete',
    body: ''
  }
}

const getGifAndSendMessage = (orgId, conversationId, messageId, searchParam, editedMessageId, replace = false) => {
  return request.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchParam)}&limit=25&offset=0&rating=G&lang=en`)
    .end((err, response) => {
      console.log(response.body.data.length)
      const length = response.body.data.length
      const randomIndex = Math.floor(Math.random() * length)
      const giphyLink = response.body.data[randomIndex].url
      return sendMessage(conversationId, createReponseMessage({ orgId, giphyLink, searchParam, editedMessageId, replace }))
    })
}

const handleMessage = (orgId, data) => {
  if (data.type === 'private_note') {
    const messageBody = data.body
    const conversationId = data.conversationId
    if (messageBody.startsWith('/giphy')) {
      const searchParam = messageBody.replace('/giphy ', '')
      sendMessage(conversationId, createDeleteMessage(orgId, data.id))
      return getGifAndSendMessage(orgId, conversationId, conversationId, searchParam, data.id)
    }
  }
}

const handleButton = (orgId, data) => {
  const buttonValue = data.button.value
  if (!buttonValue.startsWith('driffy-')) {
    return
  }
  const searchParam = buttonValue.replace('driffy-', '')
  const conversationId = data.conversationId
  const editedMessageId = data.sourceMessageId
  return getGifAndSendMessage(orgId, conversationId, conversationId, searchParam, editedMessageId, true)
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
