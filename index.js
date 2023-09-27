import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'

import { Configuration, OpenAIApi } from 'openai'




const userInput = document.getElementById('user-input')
const talkBtn = document.getElementById('talk')
const content = document.getElementById('content')
//--------------------Speech
const speechRec = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new speechRec()
recognition.lang = 'pl'



//-------------------------------
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const appSettings = {
    databaseURL: process.env.fireurl
}

const app = initializeApp(appSettings)

const database = getDatabase(app)

const conversationInDb = ref(database)

const chatbotConversation = document.getElementById('chatbot-conversation')

const instructionObj = {
    role: 'system',
    content: 'You are a helpful, flirty, funny, teasy assistant, your name is Ana my name is Damian and i am amzing'
}

document.addEventListener('submit', (e) => {
    e.preventDefault()
  
    push(conversationInDb, {
        role: 'user',
        content: userInput.value
    })
    fetchReply()
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = userInput.value
    userInput.value = ''
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
})



async function fetchReply() {
    get(conversationInDb).then(async (snapshot) => {
        if (snapshot.exists()) {
            const conversationArr = Object.values(snapshot.val())
            conversationArr.unshift(instructionObj)
            const response = await openai.createChatCompletion({
                model: 'gpt-4',
                messages: conversationArr,
                presence_penalty: 0,
                frequency_penalty: 0.3
            })
            push(conversationInDb, response.data.choices[0].message)
            renderTypewriterText(response.data.choices[0].message.content)
            elevenSpeak(response.data.choices[0].message.content+".....")
            
        }
        else {
           alert('No data available')
        }

    })
}



function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i - 1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 50)
}

document.getElementById('clear-btn').addEventListener('click', () => {
    remove(conversationInDb)
    chatbotConversation.innerHTML = '<div class="speech speech-ai">How can I help you?</div>'
})

function renderConversationFromDb(){
    get(conversationInDb).then(async (snapshot)=>{
        if(snapshot.exists()) {
            Object.values(snapshot.val()).forEach(dbObj => {
                const newSpeechBubble = document.createElement('div')
                newSpeechBubble.classList.add(
                    'speech',
                    `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                    )
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = dbObj.content
            })
            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
        }
    })
}

//------------------------Eleven----------

function elevenSpeak(message){

    let audioDataArray = []
const AudioContext = window.AudioContext || window.webkitAudioContext
const audioContext = new AudioContext();
let nextTime = 0; // This variable will keep track of the time the next chunk should start

    const voiceId = "XrExE9yKIg1WjnnlVkGX"; // replace with your voice_id
        const model = 'eleven_monolingual_v1';
        const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&optimize_streaming_latency=4&output_format=mp3_44100`;
        const socket = new WebSocket(wsUrl);
       
    // 2. Initialize the connection by sending the BOS message
    socket.onopen = function (event) {

        const bosMessage = {
            "text": " ",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": true
            },
            "xi_api_key": process.env.Eleven_API_KEY, // replace with your API key
        };
    
        socket.send(JSON.stringify(bosMessage));
    
        // 3. Send the input text message ("Hello World")
        
       const textMessage = {
            "text": ` ${message},,,,, `,
            "try_trigger_generation": true,
        };
       socket.send(JSON.stringify(textMessage)) ;

        // 4. Send the EOS message with an empty string
        const eosMessage = {
            "text": ""
        };
    
        socket.send(JSON.stringify(eosMessage));
    };
    
    // 5. Handle server responses
    socket.onmessage = async function (event) {
        const response = await JSON.parse(event.data);

        console.log("Server response:", response);
    
        if (response.audio) {
            // decode and handle the audio data (e.g., play it)
      // convert base64 to Uint8Array
    
      const data = Uint8Array.from(atob(response.audio), c => c.charCodeAt(0));
              

        // decode the audio data asynchronously 
        const buffer = await audioContext.decodeAudioData(data.buffer).then(decodedAudio => { audioDataArray.push(decodedAudio)});

        
let source
        audioDataArray.forEach( decodedAudio => { 
             source = audioContext.createBufferSource() 
            source.buffer = decodedAudio
             source.connect(audioContext.destination)
            
            })
     
        // Start the source to play the audio
        if (nextTime == 0) {
            nextTime = audioContext.currentTime;
            }
            for(let i = 0; i < audioDataArray.length; i++)
           { 
            source.start(nextTime)
            nextTime += source.buffer.duration
        }
        
   
 //----------------------------------------------------------------------------
      
            console.log("Received audio chunk");
        } else {
            console.log("No audio data in the response");
        }
    
        if (response.isFinal) {
            // the generation is complete
           
        }
  
        if (response.normalizedAlignment) {
            // use the alignment info if needed
    
        }

    // Handle errors
    socket.onerror = function (error) {
        console.error(`WebSocket Error: ${error}`);
    };
    
    // Handle socket closing
    socket.onclose = function (event) {
        if (event.wasClean) {
            console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.warn('Connection died');
        }
    };

    }

}
//---------------rest of speech------------------


recognition.onstart = function(){

}

recognition.onresult = function(event){
    const current = event.resultIndex
    const transcript = event.results[current][0].transcript
   content.textContent += transcript
   userInput.value = transcript

}

talkBtn.addEventListener('click', () => {
    recognition.start()
})

// function readOutLoud(message){
//     const speech = new SpeechSynthesisUtterance()

//     speech.text = message
//     speech.volume = 1
//     speech.rate = 1
//     speech.pitch = 1
  
  
//     window.speechSynthesis.speak(speech)
// }
renderConversationFromDb()


