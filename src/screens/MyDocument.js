import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Pdf from "react-native-pdf";
import { StyleSheet, View, Text } from "react-native";

const MyDocument = ({ route }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (route.params && route.params.pdfUrl) {
      console.log("PDF URL:", route.params.pdfUrl);
      setPdfUrl(route.params.pdfUrl);
    }
  }, [route.params]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {pdfUrl && !pdfUrl==='null' ?  (
          <Pdf
            trustAllCerts={false}
            source={{
              uri: pdfUrl,
              cache: false, 
            }}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
              console.log("PDF Error:", error);
            }}
            onPressLink={(uri) => {
              console.log(`Link pressed: ${uri}`);
            }}
            style={styles.pdf}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text>PDF yükleniyor...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyDocument;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
