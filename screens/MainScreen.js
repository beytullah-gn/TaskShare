import React from 'react';
import { View, Text, Button,StyleSheet,SafeAreaView,TouchableOpacity } from 'react-native';
import { acType } from './loginScreen';





function MainScreen({ navigation }) {
  return (
    <SafeAreaView style={style.safearea}>
      <View style={style.firstTopView}>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>2</Text>
          </TouchableOpacity>
        </View>
        <View  style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>4</Text>
          </TouchableOpacity>
        </View>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>6</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={style.firstBottomView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>9</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const style= StyleSheet.create({
  safearea:{
    flex:1,
    backgroundColor:'red',
  },
  firstTopView:{
    flex:9,
    backgroundColor:'blue',
  },
  firstBottomView:{
    flexDirection:'row',
    backgroundColor:'green',
    flex :1,
  },
  insideView:{
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'white',
  },
  touchableStyle:{
    alignSelf:'stretch',
    alignItems:'center',
    justifyContent:'center',
    flex:1,
    
  }
})


export default MainScreen;
