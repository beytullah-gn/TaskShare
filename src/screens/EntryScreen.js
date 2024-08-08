import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text as RNText } from "react-native";
import { Appbar, Button, Text } from 'react-native-paper';
import fetchAllDepartments from "../Services/fetchAllDepartments";
import TreeCardItem from "../Components/entryScreenTreeCardItem";
import { buildHierarchy } from "../Services/DepartmentUtils";

const EntryScreen = ({ navigation }) => {
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departments = await fetchAllDepartments();
        const hierarchicalDepartments = buildHierarchy(departments);
        setAllDepartments(hierarchicalDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  const handleToggleExpand = (id) => {
    setExpandedItems((prevExpandedItems) =>
      prevExpandedItems.includes(id)
        ? prevExpandedItems.filter((itemId) => itemId !== id)
        : [...prevExpandedItems, id]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content 
          title="Şirket Yapısı" 
          titleStyle={styles.headerTitle}
        />
        <View style={styles.loginContainer}>
          <Button 
            mode="contained"
            onPress={() => navigation.navigate('LoginScreen')}
            style={styles.loginButton}
          >
            Giriş Yap
          </Button>
        </View>
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {allDepartments.map((item) => (
          <TreeCardItem
            key={item.id}
            item={item}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
            navigation={navigation}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfe3ee', // Açık gri arka plan
  },
  header: {
    backgroundColor: '#3b5998', // Koyu mavi
  },
  headerTitle: {
    color: '#ffffff', // Beyaz yazı rengi
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    marginRight: 10,
    backgroundColor: '#8b9dc3', // Parlak mavi
  },
  loginText: {
    color: '#ffffff', // Beyaz yazı rengi
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#3b5998', // Koyu mavi
  },
});


export default EntryScreen;
