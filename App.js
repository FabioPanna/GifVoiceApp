/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  ToastAndroid,
  View
} from 'react-native';

import SpeechAndroid from 'react-native-android-voice';
import Tts from 'react-native-tts';

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.onSpeak = this.onSpeak.bind(this);
    this.getDialogFlow = this.getDialogFlow.bind(this);
    this.state = { showText: null,action: null, faseA:false, faseB:false };
  }

  async getDialogFlow(msg) {
    const ACCESS_TOKEN = '6f28e5d30c7d4d9e82ccf1b63686fae6';
    try {
       const response = await fetch(`https://api.dialogflow.com/v1/query?v=20170712`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          query: msg,
          lang: 'IT',
          sessionId: 'somerandomthing'
        })
      })
      let responseJson = await response.json();
      this.setState({
        showText: responseJson.result.fulfillment.speech,
        action: responseJson.result.action
      });
      return responseJson;
    } catch(error) {
      console.error(error);
    }
  }

  async onSpeak() {
    try {
      const spokenText = await SpeechAndroid.startSpeech("Parla a GifVoiceApp", SpeechAndroid.ITALIAN);

      const dialogflowResponse = await this.getDialogFlow(spokenText);
      if (this.state.showText) {
        Tts.speak(dialogflowResponse.result.fulfillment.speech);
        ToastAndroid.show(dialogflowResponse.result.action, ToastAndroid.LONG);
        switch(dialogflowResponse.result.action) {
          case "input.welcome":
            this.setState({faseA: true},function(){
               this.onSpeak();
            });
          break;
          case "gif":
            if(this.faseA == true){
            this.setState({faseB: true});
            ToastAndroid.show("chiamo funzione gif", ToastAndroid.LONG);
          } else {
            ToastAndroid.show("non chiamo funzione gif", ToastAndroid.LONG);
          }
          break;
        }
      }
    } catch(error) {
      switch(error){
        case SpeechAndroid.E_VOICE_CANCELLED:
          ToastAndroid.show("Voice Recognizer cancelled" , ToastAndroid.LONG);
          break;
        case SpeechAndroid.E_NO_MATCH:
          ToastAndroid.show("No match for what you said" , ToastAndroid.LONG);
          break;
        case SpeechAndroid.E_SERVER_ERROR:
          ToastAndroid.show("Google Server Error" , ToastAndroid.LONG);
          break;
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
      <Button
        onPress={this.onSpeak}
        title="Premi per parlare"
        color="#37B6DF"
        accessibilityLabel="Premi per parlare"
      />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
