import React from "react"
import { StyleSheet } from "react-native"


 const style= StyleSheet.create({
    safearea:{
      flex:1,
      backgroundColor:'whitesmoke',
    },
    firstTopView:{
      flex:9,
      backgroundColor:'whitesmoke',
      margin:2,
    },
    firstBottomView:{
      borderTopLeftRadius:15,
      borderTopRightRadius:15,
      flexDirection:'row',
      backgroundColor:'black',
      flex :1,
    },
    insideView:{
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'lightgrey',
    },
    touchableStyle:{
      alignSelf:'stretch',
      alignItems:'center',
      justifyContent:'center',
      flex:1,
      backgroundColor : 'white',
      borderRadius:15,
      margin:5,
  
      
    },
    topBar:{
      flex:0.8,
      backgroundColor:'white',
      alignItems:'center',
      justifyContent:'flex-end',
    }
  })

export default style;