import React from 'react';
import styles from '../styles/Home.module.css';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [quote, setQuote] = React.useState("");
  const [letters, setLetters] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.createRef();
  const [prevInputValue, setPrevInputValue] = React.useState("");

  const [startTime, setStartTime] = React.useState();
  const [currentTime, setCurrentTime] = React.useState();
  const [prevWordCount, setPrevWordCount] = React.useState(0); // word count of previous quotes
  const [wpm, setWpm] = React.useState(0);
  const [accuracy, setAccuracy] = React.useState(1);
  const [charsTyped, setCharsTyped] = React.useState(0);
  const [correctCharsTyped, setCorrectCharsTyped] = React.useState(0);

  // Reset + new quote
  const newQuote = async () => {
    setInputValue("");
    const newQuote = await getQuote();
    setQuote(newQuote);
  }
  
  // Fetch quote
  const getQuote = () => {
    return fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => data.content);
  }

  // Get letter classes
  const getLetterClass = (letter) => {
    let className = styles[letter.status];
    if (letter.current) className += ' ' + styles.current;
    return className;
  }

  // Focus
  const focus = () => {
    inputRef.current.focus();
  }

  // Format timer ms
  const formatTime = (timeInMs) => {
    if (isNaN(timeInMs) || timeInMs < 0) return '00:00';
    function pad(n, z) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }
    let ms = timeInMs % 1000;
    timeInMs = (timeInMs - ms) / 1000;
    let secs = timeInMs % 60;
    timeInMs = (timeInMs - secs) / 60;
    let mins = timeInMs % 60;
    let hrs = (timeInMs - mins) / 60;
    return `${hrs>0 ? `${pad(hrs)}:` : ``}${pad(mins)}:${pad(secs)}`; // .${pad(ms, 3)}
  }

  // On start (runs once)
  React.useEffect(() => {
    setStartTime(new Date().getTime()); // sets start time at beginning of session
    const timerInterval = setInterval(() => setCurrentTime((new Date).getTime()), 1000);
    newQuote();

    return () => {
      clearInterval(timerInterval);
    }
  }, []);

  // On new quote
  React.useEffect(() => {
    setLetters([]);
    let initialLetters = [];
    for (let i=0; i<quote.length; i++) {
      initialLetters.push(
        { 
          value: quote.charAt(i), 
          status: 'untyped', 
          current: i<quote.split(' ')[0].length, 
          id: uuidv4() 
        }
      );
    }
    setLetters(initialLetters);
    focus();
  }, [quote]);

  // On user type
  React.useEffect(() => {
    // Check typed characters
    for (let i=0; i<inputValue.length; i++) {
      if (i>=letters.length) break;
      if (inputValue.charAt(i) === letters[i].value) {
        let newLetters = [...letters];
        newLetters[i].status = 'correct';
        setLetters(newLetters);
      } else {
        let newLetters = [...letters];
        newLetters[i].status = 'incorrect';
        setLetters(newLetters);
      }
    }
    // Fill in untyped characters
    for (let i=inputValue.length; i<letters.length && i>=0; i++) {
      let newLetters = [...letters];
      newLetters[i].status = 'untyped';
      setLetters(newLetters);
    }
    // Find current word
    for (let i=0; i<quote.length; i++) { // Removing all current word letters
      if (i>=letters.length) break;
      let newLetters = [...letters];
      newLetters[i].current = false;
      setLetters(newLetters);
    }
    let remainingQuote = quote.substring(inputValue.length); // Adding in current word letters
    for (let i=0; i<remainingQuote.length; i++) {
      if (i>=letters.length) break;
      if (i<remainingQuote.split(' ')[0].length) {
        let newLetters = [...letters];
        newLetters[inputValue.length+i].current = 'true';
        setLetters(newLetters);
      }
    }
    if (inputValue.charAt(inputValue.length-1) !== ' ') {
      for (let i=inputValue.length-1; inputValue.charAt(i) !== ' ' && i>=0; i--) {
        if (i>=letters.length) break;
        let newLetters = [...letters];
        newLetters[i].current = 'true';
        setLetters(newLetters);
      }
    }

    // Update accuracy
    if (inputValue.length > prevInputValue.length) { // Added chars
      let changed = inputValue.substring(prevInputValue.length);
      for (let i=0; i<changed.length; i++) {
        if (prevInputValue.length+i>=letters.length) break;
        if (letters[prevInputValue.length+i].status === 'correct') {
          setCorrectCharsTyped(correctCharsTyped+1);
        }
        setCharsTyped(charsTyped+1);
      }
    }
    let newAccuracy = (correctCharsTyped/charsTyped*100).toFixed();
    setAccuracy(!isNaN(newAccuracy) ? newAccuracy : 100);
    setPrevInputValue(inputValue);

    // Check if finished quote
    if (inputValue === quote && quote !== '') {
      setPrevWordCount(prevWordCount + quote.split(' ').length);
      setPrevInputValue('');
      newQuote();
    }
  }, [inputValue]);

  React.useEffect(() => {
    // Calc wpm
    const durationInMins = (currentTime - startTime) / 60000.0;
    const newWPM = Math.round((prevWordCount + inputValue.split(' ').length)/durationInMins);
    setWpm(!isNaN(newWPM) && !(prevWordCount === 0 && inputValue === '') ? newWPM : 0);
  }, [currentTime]);
  
  return (
    <>
      <div className={styles.container}>
        <div className={styles.quote}>
          {(quote == "") ? "Loading..." : letters.map(letter => 
            <span 
              className={getLetterClass(letter)} 
              key={letter.id}
            >{letter.value}</span>
          )}
        </div>
        <textarea
          className={styles.input}
          value={inputValue}
          onChange={(e) => {if (quote !== "") setInputValue(e.target.value)}}
          ref={inputRef}
          data-gramm="false"
        ></textarea>
        <span className={styles.stats}><b>{wpm}</b> WPM | <b>{accuracy}%</b> ACC | <b>{formatTime(currentTime-startTime)}</b> TIME</span>
      </div>
    </>
  )
}
