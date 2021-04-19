const microphone = document.querySelector(".talk");
const content = document.querySelector("#content");
const outerOne = document.querySelector('.outer-1');
const outerTwo = document.querySelector('.outer-2');
const snackbar = document.getElementById("snackbar");
const lang = document.querySelector('input[name="lang"]');
const confidenceText = document.querySelector('.confidence');
const moodContainer = document.querySelector('.form-container');
const hiddenInput = document.querySelector('input[type="hidden"]');

let tapBehaviour;
let transcript = "";
let isStarted = false;
let listen = false;

const punctuation = {
    "period": ". ",
    "nokta": ". ",
    "comma": ", ",
    "virgül": ", ",
    "question mark": "? ",
    "soru işareti": "? "
}

console.log("tap behaviour: " + document.querySelector('input[name="tap"]:checked').value);
console.log("language: " + document.querySelector('input[name="lang"]:checked').value);
console.log();

function handleClearButton() {
    content.value = "";
    confidenceText.innerHTML = "";
}




document.getElementById('myForm').addEventListener("submit", 
    function(e) {
        if (e.preventDefault) e.preventDefault();

        const v = content.value;
        if (v.slice(-2) === "🔚") content.value = v.slice(0, -2);

        hiddenInput.value = content.value;

        // Should be triggered on form submit
        console.log('form submitted');

        this.submit();
    }
)


function handleCopyButton() {

    const v = content.value;
    if (v.slice(-2) === "🔚") content.value = v.slice(0, -2);

    content.select();

    if ( document.execCommand( 'copy' ) ) {
        snackbar.className = "show";

        setTimeout(function(){ 
            snackbar.className = snackbar.className.replace("show", ""); 
        }, 3000);

    } else {
        console.info( 'document.execCommand went wrong…' )
    }
}

if (!window.hasOwnProperty("webkitSpeechRecognition")) {
    content.classList.remove('gray');
    content.classList.add('red');
    content.value = "Unable to use the Speech Recognition API. You can use Chrome Browser instead.";
    microphone
} 

const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new speechRecognition();

recognition.interimResults = true;
recognition.lang = "us-EN";
recognition.continuous = false;


recognition.onstart = function () {
    console.log("voice is activated, you can to speak.")
    isStarted = true;

    outerOne.classList.add('animate');
    outerTwo.classList.add('animate');
}

recognition.onend = function () {
    console.log("voice is ended.")
    isStarted = false;

    if (listen) readOutLoud(transcript);

    outerOne.classList.remove('animate');
    outerTwo.classList.remove('animate');

    moodContainer.classList.add('bounce')
}

recognition.onspeechend = function () {
    console.log("speech is ended");
}

recognition.onerror = function(event) {
    console.error(event);
};


recognition.onresult = function (event) {
    // console.log(event);

    const current = event.resultIndex;
    const result = event.results[current];
    let tempInterim = result[0].transcript;

    let isFinal = result.isFinal && (result[0].confidence > 0);
    var mobileRepeatBug = (current == 1 && tempInterim == event.results[0][0].transcript);

    console.log("----------------------");
    console.log(result);
    console.log("transcript: " + tempInterim);
    console.log("mobile repeat bug: " + mobileRepeatBug);
    console.log("isFinal   : " + isFinal);
    

    if (!mobileRepeatBug) {
        if (tempInterim.includes("period")) {
            tempInterim = tempInterim.replace(" period", ". ");
        }
    
        if (tempInterim.includes("nokta")) {
            tempInterim = tempInterim.replace(" nokta", ". ");
        }
    
        if (tempInterim.includes("comma")) {
            tempInterim = tempInterim.replace(" comma", ", ");
        }
    
        if (tempInterim.includes("virgül")) {
            tempInterim = tempInterim.replace(" virgül", ", ");
        }
    
        if (tempInterim.includes("question mark")) {
            tempInterim = tempInterim.replace(" question mark", "? ");
        }
    
        if (tempInterim.includes("soru işareti")) {
            tempInterim = tempInterim.replace(" soru işareti", "? ");
        }
    
        if (tempInterim.includes("stop stop") || tempInterim.includes("bitir bitir")) {
            tempInterim = tempInterim.split("bitir bitir")[0];
            tempInterim = tempInterim.split("stop stop")[0];
            tempInterim += "🔚";
            recognition.stop();
        }
    
        if (isFinal) {

            transcript += tempInterim;
            tempInterim = "";
    
            confidence = result[0].confidence;
            confidence = confidence * 100;
            confidence = confidence.toFixed(2);
            confidenceText.innerHTML = "Confidence: " + confidence + "%";
            console.log(confidence);
        }
    
        const displayedContent = transcript + tempInterim;
        content.value = displayedContent;
    }
}




function readOutLoud (message) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}

microphone.addEventListener("click", () => {
    console.log("mic: butona basıldı");

    if (!isStarted) {
        recognition.start();

        content.classList.remove('gray');
        moodContainer.classList.remove('bounce');

        content.value = "";
        confidenceText.innerHTML = "";
        transcript = "";
        
    } else 
        recognition.stop();
})


document.querySelector('input[id="interim"]').addEventListener("change", function(event) {
    console.log("interim: " + event.target.checked);
    recognition.interimResults = event.target.checked;
});

document.querySelector('input[id="continuous"]').addEventListener("change", function(event) {
    console.log("continuous: " + event.target.checked);
    recognition.continuous = event.target.checked;
});

document.querySelector('input[id="listen"]').addEventListener("change", function(event) {
    console.log("listen: " + event.target.checked);
    listen = event.target.checked;
});

document.querySelectorAll('input[name="lang"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
        console.log("language: " + event.target.value); 
        recognition.lang = event.target.value;
    });
});

document.querySelectorAll('input[name="tap"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
        console.log("tap behaviour: " + event.target.value); 
        tapBehaviour = event.target.value;
    });
});






// btnCopy.addEventListener( 'click', function(){
//     toCopy.select();
//     paste.value = '';
    
//     if ( document.execCommand( 'copy' ) ) {
//         btnCopy.classList.add( 'copied' );
//       paste.focus();
      
//         var temp = setInterval( function(){
//           btnCopy.classList.remove( 'copied' );
//           clearInterval(temp);
//         }, 600 );
      
//     } else {
//       console.info( 'document.execCommand went wrong…' )
//     }
    
//     return false;
// });
