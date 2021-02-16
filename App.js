import React, { Component } from 'react';
import { Button, StyleSheet, Text, View, Image, Dimensions} from 'react-native';
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
      imageSelection: null
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
    let images = await ImagePicker.openPicker({multiple: true, includeExif: true})
    //console.log(images)
    
    let imageSelection = []
    for (let i = 0; i < images.length; i++) {
      imageSelection.push({
        path: images[i].path, 
        dateTime: images[i].exif.DateTime, 
        swatches: JSON.stringify(await returnSwatches(images[i].path.substring('file://'.length)))
      })  
    }
    //console.log(imageSelection)
    imageCompare(imageSelection)
    this.setState({ image: imageSelection[0].path })
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

const returnSwatches = (path) => {
  return new Promise(resolve => {
    getAllSwatches({}, path, (error, swatches) => {
      swatches.sort((a, b) => {
        return b.population - a.population;
      });
      swatches = swatches.slice(0,5) //top x swatches on population will be included
      resolve(swatches)
    })
  })
}

const imageCompare = async (imageSelection) => {
  let images = {}
  for (let i_images = 0; i_images < imageSelection.length; i_images++) {
    
    //console.log(imageSelection[i_images])
    let swatches = JSON.parse(imageSelection[i_images].swatches)
    let swatchesTemp = []
    for (let i_swatches = 0; i_swatches < swatches.length; i_swatches++) {
      
      let swatchColor = swatches[i_swatches].color
      let swatchColorArray = swatchColor.substring('rgba('.length).split(',')
      let swatchColorRGB = {R: swatchColorArray[0], G: swatchColorArray[1], B: swatchColorArray[2]}
      swatchesTemp.push(swatchColorRGB)
      //console.log(swatchColorRGB)

    }
    images[imageSelection[i_images].path] = swatchesTemp
  }
  let images_colordistance = {}

  for (let image_base in images){
    let image_base_swatches = images[image_base]
    let image_colordistance = {}

    for (let image_compare in images){
      let image_compare_swatches = images[image_compare]
      let swatches_colordistance = []

      for (let image_base_swatch_index in image_base_swatches){
        let image_base_swatch = image_base_swatches[image_base_swatch_index]
        let swatch_colordistance = []

        for (let image_compare_swatch_index in image_compare_swatches){
          let image_compare_swatch = image_compare_swatches[image_compare_swatch_index]
          let colordistance = 
            // Math.sqrt(
            //   Math.pow((image_base_swatch.R - image_compare_swatch.R), 2) +   //R
            //   Math.pow((image_base_swatch.G - image_compare_swatch.G), 2) +   //G
            //   Math.pow((image_base_swatch.B - image_compare_swatch.B), 2)     //B
            // )
            (image_base_swatch.R - image_compare_swatch.R) +   //R
            (image_base_swatch.G - image_compare_swatch.G) +   //G
            (image_base_swatch.B - image_compare_swatch.B)     //B
          swatch_colordistance.push(colordistance)
        }
        swatches_colordistance.push(sumArray(swatch_colordistance))
      }
      //image_colordistance[image_compare] = JSON.stringify(swatches_colordistance)
      image_colordistance[image_compare] = Math.sqrt(Math.pow(sumArray(swatches_colordistance),2))

    }
    images_colordistance[image_base] = image_colordistance
  }
  console.log(images_colordistance)



}


const sumArray = (array) => {
  let sum = array.reduce(function (a, b) {
    return a + b;
  }, 0);
  return sum;
}

export default App