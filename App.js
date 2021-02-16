//import { StatusBar } from 'expo-status-bar';
import React, { Component, useState } from 'react';
import { Button, StyleSheet, Text, View, Image, Dimensions} from 'react-native';
//import * as Permissions from 'expo-permissions'
//import * as ImagePicker from 'expo-image-picker'
//import * as Vibrant from 'node-vibrant'
//import {getColors} from 'react-native-color-grabber'
//import Palette from 'react-native-palette-full'
import {getAllSwatches} from 'react-native-palette'
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'Button not pressed',
      buttonPressed: false,
      hasCameraPermission: null,
      image: null,
    }
  }

  async componentDidMount() {
    request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then((result) => {
      console.log(result)
    })
    request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((result) => {
      console.log(result)
    })
    // const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    // this.setState({ hasCameraPermission: status === "granted" });
   }
  
  
  

  _getPhotoLibrary = async () => {
    ImagePicker.openPicker({
      multiple: true, includeExif: true
    }).then(images => {
      console.log(images);
      urlFromPath = images[0].path.substring('file://'.length)
      console.log(urlFromPath)
      this.setState({ image: images[0].path })
      getAllSwatches({}, urlFromPath, (error, swatches) => {
        //console.log(swatches, error)
        swatches.sort((a, b) => {
          return b.population - a.population;
        });
        swatches.forEach((swatch) => {
          console.log(swatch.swatchInfo);
        });
      
      
      })
      //Palette.getAllSwatches(images[0].path).then(outputColors => {console.log(outputColors)});
    });
    // launchImageLibrary({}, response => {
    //   this.setState({ image: response.uri })
    //   console.log(response)
    // })
    // let result = await ImagePicker.launchImageLibraryAsync({
    //   allowsMultipleSelection: true,
    //   exif: true
    // });
    // if (!result.cancelled) {
    //   this.setState({ image: result.uri });
    //  console.log(result)
    // getAllSwatches(options, result.uri, (error, swatches) => {console.log(swatches)})
    //getAllSwatchesFromUrl(result.uri).then(outputColors);  
    //Vibrant.from(result.uri).getPalette().then((palette) => console.log(palette))
    //getColors(result.uri, (err, res) => {console.log(res)})
    //}
   }

  render(){
    return (
      <View style={styles.container}>
        <Button 
          onPress={() => {
            if (this.state.buttonPressed == false){
              this.setState({buttonPressed: true, text: 'Button pressed' })
              this._getPhotoLibrary()
            }
            else{
              this.setState({buttonPressed: false, text: 'Button not pressed', image: null })
            }
          }}
          title="Press Me"
        />
        <Text>{this.state.text}</Text>
        <Text>{this.state.image}</Text>
        <View style={styles.activeImageContainer}>
        {
          this.state.image ? (
            <Image source={{uri: this.state.image}} style={{ flex: 1 }}/>
          ):(
            <Text>No image</Text>

          )



        }
        </View>

      </View>
    );
  }
}

const options = {}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeImageContainer: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
    backgroundColor: "#eee",
    borderBottomWidth: 0.5,
    borderColor: "#fff"
   },
})

export default App