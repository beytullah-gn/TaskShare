import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TextInput, Button, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Text, SafeAreaView, FlatList } from 'react-native';
import FetchDepartments from '../Services/fetchDepartments';
import TreeCardItem from '../Components/TreeCardItem';
import { buildHierarchy, findAncestors, findAllExpandedItems } from '../Services/DepartmentUtils';

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

  // Arama terimi değiştiğinde genişletme durumu güncelle
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
        horizontal
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
            />
          ))}
        </ScrollView>
      </ScrollView>
    );
  }, [filteredDepartments, expandedItems, handleToggleExpand, searchTerm]);

  // Navigate to add new department
  const AddNewDepartment = () => {
    navigation.navigate("Yeni Departman Ekle");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search departments..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Button title="Clear" onPress={() => setSearchTerm('')} />
      </View>
      <ScrollView>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <FetchDepartments setDepartments={setDepartments} setIsLoading={setIsLoading} />
          {renderTree()}
        </>
      )}
      </ScrollView>
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={AddNewDepartment}>
          <Text style={styles.bottomText}>Click ME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  innerScrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bottomContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomButton: {
    width: '80%',
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  bottomText: {
    fontWeight: 'bold',
    color: 'white',
  },
});

export default DepartmentScreen;
