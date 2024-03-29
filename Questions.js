import { View, Text, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react'
import styles from './Styles'
import { useNetInfo } from "@react-native-community/netinfo";

function Questions({ setScreen, setScore }) {
    const [color, setColors] = useState('normal');
    const [isLoad, setLoad] = useState(true);
    const [quoteOpacity, setQuoteOpacity] = useState(1)
    const [questionNumber, setQuestionNumber] = useState(1);
    const [questionArr, setQuestionArr] = useState('');
    const [timer, setTimer] = useState(15);
    const [quote, setQuote] = useState({
        quote: {
            quote: 'Loading...',
            author: 'Andy Wladis'
        },
        options: ['Loading...', 'Loading...', 'Loading...', 'Loading...']
    });

    const netInfo = useNetInfo();

    useEffect(() => {
        const interval = setInterval(() => {
          setTimer(timer => timer - 1);
      
          if (timer <= 0) {
            isAnswer('Andy');
            clearInterval(interval);
            setTimer(0)
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }, [isAnswer, timer]);

    useEffect(() => {
        if (quote.quote.quote != 'Loading..') {
            setQuoteOpacity(1)
            setTimer(13)
        } else {
            setQuoteOpacity(0)
        }
    }, [quote]);

    function blankState() {
        setQuote({
            quote: {
                quote: 'Loading..',
                author: 'Andy Wladis'
            },
            options: [' ', ' ', ' ', ' ']
        });
    }

    const storeData = async (value) => {
        try {
            await AsyncStorage.setItem('@questionNumber', value.toString())
        } catch (e) {
            // saving error
        }
    }

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('@questionNumber')
            const date = await AsyncStorage.getItem('@date')
            if (date !== date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()) {
                storeData("1")
                setQuestionNumber(1)
            } else {
                setQuestionNumber(Number(value));
            }
        } catch (e) {
            // error reading value
        }
    }

    const isAnswer = (ele) => {
        if (color === 'normal' && quote.quote.author != 'Andy Wladis') {
            if (ele === quote.quote.author) {
                setColors('#5bde6a')
                setQuestionArr(questionArr + '✅');
            } else {
                setColors('#fc746a')
                setQuestionArr(questionArr + '❌');
            }
            if (questionNumber < 10) {
                setTimeout(() => {
                    setColors('normal')
                    blankState()
                    fetch('https://taylors-version.cyclic.app/today-challenge')
                        .then(response => response.json())
                        .then(data => setQuote(data[questionNumber]))
                    setQuestionNumber(questionNumber + 1);
                    storeData(questionNumber)

                }, 1500)
            } else {
                setTimeout(() => {
                    setScore('✅' + questionArr)
                    setScreen('GameOver')
                }, 1000)
            }
        }
    }
    if (isLoad) {
        fetch('https://taylors-version.cyclic.app/today-challenge')
            .then(response => response.json())
            .then(data => setQuote(data[0]))
        setLoad(false)
    }

    getData();

    const returnColor = (num) => {
        if (color === 'normal') {
            return "#e8e8e8";
        } else {
            return color;
        }
    }

    return (
        <View style={styles.questionContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <Text style={styles.questionNumber}>Track #{questionNumber}</Text>
                    <Text style={[styles.timer]}>{timer}</Text>
                </View>
                {netInfo.isConnected ? <Text style={[styles.quote, { opacity: quoteOpacity }]}>"{quote.quote.quote}"</Text> : () => { setScreen('Home') }}
            </View>
            {quote.options.map((element, index) => (
                <TouchableOpacity onPress={() => { isAnswer(element) }} key={index}>
                    <View style={[styles.option, { backgroundColor: returnColor(index), }]}>
                        <Text style={styles.optionText}>{element}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>

    )
}

export default Questions