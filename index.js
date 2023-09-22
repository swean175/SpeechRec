const talkBtn = document.getElementById('talk')
const content = document.getElementById('content')

const speechRec = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new speechRec()

recognition.onstart = function(){
     content.textContent = "says"
}

recognition.onresult = function(event){
    const current = event.resultIndex
    const transcript = event.results[current][0].transcript
   content.textContent += transcript
   readOutLoud(transcript)
}

talkBtn.addEventListener('click', () => {
    recognition.start()
})

function readOutLoud(message){
    const speech = new SpeechSynthesisUtterance()
alert(speech)
    speech.text = "hello"
    speech.volume = 1
    speech.rate = 1
    speech.pitch = 1
    window.speechSynthesis.speak(speech)
}
