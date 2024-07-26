import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TextInput, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import FetchDepartments from '../Services/fetchDepartments';
import TreeCardItem from '../Components/TreeCardItem';
import { buildHierarchy, findAncestors, findAllExpandedItems } from '../Services/DepartmentUtils';
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from '../Components/BottomBar';

const DepartmentScreen = ({ navigation }) => {
  
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Departmanları arama terimine göre filtreleme
  const filteredDepartments = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const matchingDepartments = departments.filter(department =>
      department.DepartmentName.toLowerCase().includes(lowercasedSearchTerm) ||
      department.DepartmentDescription.toLowerCase().includes(lowercasedSearchTerm)
    );

    if (matchingDepartments.length === 0) {
      return [];
    }

    const ancestorIds = new Set(matchingDepartments.flatMap(dep => findAncestors(departments, dep.id)));
    const allIdsToInclude = new Set([...matchingDepartments.map(dep => dep.id), ...ancestorIds]);

    const filterDepartments = (deps) => {
      return deps
        .filter(department => allIdsToInclude.has(department.id))
        .map(department => ({
          ...department,
          children: filterDepartments(department.children || []),
        }));
    };

    return filterDepartments(buildHierarchy(departments));
  }, [departments, searchTerm]);

  // Genişletme durumu güncelleyici fonksiyon
  const handleToggleExpand = useCallback((id) => {
    setExpandedItems(prevItems => 
      prevItems.includes(id) ? prevItems.filter(item => item !== id) : [...prevItems, id]
    );
  }, []);

  const handleProfile = () => {
    navigation.navigate('MyProfile');
  };
  const handleDepartments = () => {
    navigation.navigate('Departments');
  };
  const handlePersons = () => {
    navigation.navigate('Persons');
  };
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  // Arama terimi değiştiğinde genişletme durumu güncelley
  useEffect(() => {
    if (searchTerm) {
      const matchingDepartments = departments.filter(department =>
        department.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingDepartments.length > 0) {
        const newExpandedItems = matchingDepartments.flatMap(dep =>
          findAllExpandedItems(departments, dep.id)
        );
        setExpandedItems(newExpandedItems);
      }
    } else {
      // Varsayılan olarak kök departmanları genişlet
      const rootDepartments = departments.filter(department => !department.ParentDepartment);
      const rootExpandedItems = rootDepartments.map(dep => dep.id);
      setExpandedItems(rootExpandedItems);
    }
  }, [searchTerm, departments]);

  const renderTree = useCallback(() => {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        horizontal={false} // Yalnızca dikey düzen
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          style={styles.innerScrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredDepartments.map((item) => (
            <TreeCardItem
              key={item.id}
              item={item}
              expandedItems={expandedItems}
              onToggleExpand={handleToggleExpand}
              searchTerm={searchTerm}
              level={0}
            />
          ))}
        </ScrollView>
      </ScrollView>
    );
  }, [filteredDepartments, expandedItems, handleToggleExpand, searchTerm]);

  // Navigate to add new department
  const AddNewDepartment = () => {
    navigation.navigate("AddNewDepartment");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Departman Ara..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.clearButton} onPress={() => setSearchTerm('')}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            <FetchDepartments setDepartments={setDepartments} setIsLoading={setIsLoading} />
            {renderTree()}
          </>
        )}
      </ScrollView>
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={AddNewDepartment}>
          <Text style={styles.bottomText}>Add New Department</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomBarContainer}>
        <BottomBar onProfile={handleProfile} onDepartments={handleDepartments} onPersons={handlePersons} onSettings={handleSettings} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6f9' 
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    color: '#003366', 
  },
  clearButton: {
    backgroundColor: '#003366', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#ffffff', // Beyaz metin
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  innerScrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'column', // Dikey düzen
    flexWrap: 'wrap',
  },
  bottomContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60, // Yeterli boşluk bırakmak için
  },
  bottomButton: {
    width: '80%',
    backgroundColor: '#007bff', // Mavi arka plan
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  bottomText: {
    fontWeight: 'bold',
    color: '#ffffff', // Beyaz metin
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default DepartmentScreen;
