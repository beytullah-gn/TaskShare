import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text as RNText ,TouchableOpacity} from "react-native";
import { Appbar, Button, Text } from 'react-native-paper';
import TreeCardItem from "../Components/entryScreenTreeCardItem";
import { buildHierarchy } from "../Services/DepartmentUtils";
import fetchDepartments from "../Services/fetchActiveDepartments";
import Icon from "react-native-vector-icons/SimpleLineIcons";

const EntryScreen = ({ navigation }) => {
  const [allDepartments, setAllDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departments = await fetchDepartments();
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
      <SafeAreaView style={styles.loadingContainer}>
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
          <TouchableOpacity 
            mode="contained"
            onPress={() => navigation.navigate('LoginScreen')}
            style={styles.loginButton}
          >
            <Icon name="login" size={35} color='#dfe3ee'/>
          </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#3b5998', // Koyu mavi
  },
});

export default EntryScreen;
