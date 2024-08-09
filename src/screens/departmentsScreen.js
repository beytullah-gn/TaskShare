import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, TextInput, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import FetchDepartments from '../Services/fetchDepartments';
import TreeCardItem from '../Components/TreeCardItem';
import { buildHierarchy, findAncestors, findAllExpandedItems } from '../Services/DepartmentUtils';
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from '../Components/BottomBar';
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';

const DepartmentScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  // Function to check permissions and update state accordingly
  const checkPermissions = async () => {
    setIsLoading(true); // Show loading indicator while checking permissions
    try {
      const departmentEmployee = await fetchDepartmentEmployeeData();
      if (departmentEmployee && departmentEmployee.Permissions && departmentEmployee.Permissions.ManageDepartments) {
        setShowAddButton(true);
      } else {
        setShowAddButton(false);
      }
    } catch (error) {
      console.log("Error fetching department: ", error);
      setShowAddButton(false);
    } finally {
      setIsLoading(false); // Hide loading indicator once done
    }
  };

  useEffect(() => {
    checkPermissions(); // Call permission check on mount
  }, []);

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
  const handleQrScreen = () => {
    navigation.navigate('QrScreen');
  };

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
        horizontal={false}
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
              navigation={navigation}
            />
          ))}
        </ScrollView>
      </ScrollView>
    );
  }, [filteredDepartments, expandedItems, handleToggleExpand, searchTerm, navigation]);

  const AddNewDepartment = () => {
    navigation.navigate("AddNewDepartment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Departman Ara..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchTerm('')}>
            <Text style={styles.clearButtonText}>Temizle</Text>
          </TouchableOpacity>
        </View>
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
      {showAddButton && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.bottomButton} onPress={AddNewDepartment}>
            <Text style={styles.bottomText}>Yeni Departman Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.bottomBarContainer}>
        <BottomBar onQrScreen={handleQrScreen} onProfile={handleProfile} onDepartments={handleDepartments} onPersons={handlePersons} onSettings={handleSettings} activePage="departments" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfe3ee',
    paddingBottom: 80,
  },
  headerContainer: {
    backgroundColor: '#3b5998',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 0,
    borderTopLeftRadius:5,
    borderBottomLeftRadius:5,
    backgroundColor: '#ffffff',
    color: '#3b5998',
    height: 40,
  },
  clearButton: {
    backgroundColor: '#8b9dc3',
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderTopRightRadius:5,
    borderBottomRightRadius:5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
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
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  bottomContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomButton: {
    width: '80%',
    backgroundColor: '#3b5998',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 3,
  },
  bottomText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});

export default DepartmentScreen;
