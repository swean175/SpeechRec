
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
 })
  
  const openai = new OpenAIApi(configuration)

const handler = async (event) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: event.body,
      presence_penalty: 0,
      frequency_penalty: 0.3
    })
    const subject = event.queryStringParameters.name
    return {
      statusCode: 200,
      body: JSON.stringify({}),

    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }


       // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,