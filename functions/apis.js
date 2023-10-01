

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
       headers: {
          'Acces-Control-Allow-Origin' : '*',
          'Acces-Control-Allow-Headers' :
             'Origin, X-Requested-With, Content-Type, Accept'
       },
        body: JSON.stringify({
            reply: response
        })
    }
   
} catch (error) {
    return { statusCode: 500, body: error.toString() }
}  

}
module.exports = { handler }


