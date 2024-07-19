import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TextInput, Button, ActivityIndicator, StyleSheet,FlatList,TouchableOpacity,Text } from 'react-native';
import FetchDepartments from '../Components/fetchDepartments';
import TreeItem from '../Components/TreeItem';
import { buildHierarchy, findAncestors, findAllExpandedItems } from '../Components/DepartmentUtils';

const DepartmentScreen = ({navigation}) => {
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
      <FlatList
        data={filteredDepartments}
        renderItem={({ item }) => <TreeItem item={item} expandedItems={expandedItems} onToggleExpand={handleToggleExpand} searchTerm={searchTerm} />}
        keyExtractor={item => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    );
  }, [filteredDepartments, expandedItems, handleToggleExpand, searchTerm]);

//navigate
  const AddNewDepartment=()=>{
    navigation.navigate("Yeni Departman Ekle");
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search departments..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Button title="Clear" onPress={() => setSearchTerm('')} />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <FetchDepartments setDepartments={setDepartments} setIsLoading={setIsLoading} />
          {renderTree()}
        </>
      )}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.bottomButton} onPress={AddNewDepartment}>
          <Text style={styles.bottomText}>Click ME</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  bottomContainer: {
    flex: 1,
    width:"100%",
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomButton:{
    width:"80%",
    backgroundColor:'red',
    alignItems:'center',
    justifyContent:'center',
    padding:10,
    borderRadius:10,
  },
  bottomText:{
    fontWeight:'bold',
    color:'white',
  },
});

export default DepartmentScreen;
