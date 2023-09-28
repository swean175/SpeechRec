

const handler = async (event) =>{
   
    try {
    const response = {
        prompt: event.body,
        fire: process.env.fireurl,
        ai: process.env.Open_API_KEY,
       eleven: process.env.Eleven_API_KEY,
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            reply: response
        })
    }
   
} catch (error) {
    return { statusCode: 500, body: error.toString() }
}  

}
module.exports = { handler }


//OPENAI_API_KEY: process.env.OPENAI_API_KEY, fireurl: process.env.fireurl, Eleven_API_KEY: process.env.Eleven_API_KEY