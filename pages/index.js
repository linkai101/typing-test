import React from 'react';
import styles from '../styles/Home.module.css';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [quote, setQuote] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.createRef();
  const [letters, setLetters] = React.useState([]);

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

  // On start
  React.useEffect(() => {
    newQuote();
  }, []);

  // On new quote
  React.useEffect(() => {
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
    // Check if finished quote
    if (inputValue === quote && quote !== '') newQuote();
  }, [inputValue]);
  
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
        <span className={styles.stats}><b>--</b> WPM | <b>--%</b> ACC | <b>--:--.--</b> TIME</span>
      </div>
    </>
  )
}
