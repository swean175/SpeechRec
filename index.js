const talkBtn = document.getElementById('talk')
const content = document.getElementById('content')

const speechRec = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new speechRec()

recognition.onstart = function(){
    console.log('Voice activeted')
}

recognition.onresult = function(event){
    const current = event.resultIndex
    const transcript = event.result[current][0].transcript
   content.textContent = trsnscript
   readOutLoud(transcript)
}

talkBtn.addEventListener('click', () => {
    recognition.start()
})