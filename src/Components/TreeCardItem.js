import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TreeCardItem = ({ item, expandedItems, onToggleExpand, level = 0, navigation }) => {
  const isExpanded = expandedItems.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;

  const handleDetailPress = () => {
    navigation.navigate('SelectedDepartment', { id: item.id });
  };

  return (
    <View style={[styles.cardContainer, { marginLeft: level * 20 }]}>
      <TouchableOpacity
        onPress={() => onToggleExpand(item.id)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          {hasChildren && (
            <Ionicons
              name={isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
              size={20}
              color="#000"
              style={styles.icon}
            />
          )}
          <Text style={styles.cardTitle}>
            {item.DepartmentName}
          </Text>
          <TouchableOpacity style={styles.detailsButton} onPress={handleDetailPress}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {isExpanded && hasChildren && (
        <ScrollView horizontal={true}>
          <View style={styles.childContainer}>
            {item.children.map(child => (
              <TreeCardItem
                key={child.id}
                item={child}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
                level={level + 1}
                navigation={navigation}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 5,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 300, // Sabit genişlik
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Bu satır butonu sağa hizalar
    width: '100%',
  },
  cardTitle: {
    flex: 0.7, // %70 genişlik
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    flex: 0.1, // %10 genişlik
    marginRight: 10,
  },
  detailsButton: {
    flex: 0.2, // %20 genişlik
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childContainer: {
    marginTop: 10,
  },
});

export default TreeCardItem;
// Entry screende bir tane fazla veri gösteriyor ??? 


/*
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Renkleri tanımlamak için bir fonksiyon
const getColorForLevel = (level) => {
  const baseColor = 240; // Beyazdan griye doğru renk kodları
  const colorValue = Math.max(baseColor - (level * 10), 180); // Gri tonunu ayarla
  return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
};

const TreeCardItem = ({ item, expandedItems, onToggleExpand, level = 0, navigation }) => {
  const isExpanded = expandedItems.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const cardColor = getColorForLevel(level); // Seviye için rengi al

  const handleDetailPress = () => {
    navigation.navigate('SelectedDepartment', { id: item.id });
  };

  return (
    <View style={[styles.cardContainer, { marginLeft: level}]}>
      <TouchableOpacity
        onPress={() => onToggleExpand(item.id)}
        style={[styles.card, { backgroundColor: cardColor }]} // Rengi uygula
      >
        <View style={styles.cardHeader}>
          {hasChildren && (
            <Ionicons
              name={isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
              size={20}
              color="#000"
              style={styles.icon}
            />
          )}
          <Text style={styles.cardTitle}>
            {item.DepartmentName}
          </Text>
          <TouchableOpacity style={styles.detailsButton} onPress={handleDetailPress}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {isExpanded && hasChildren && (
        <View style={styles.childContainer}>
          {item.children.map(child => (
            <TreeCardItem
              key={child.id}
              item={child}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
              level={level + 1}
              navigation={navigation}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 5,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 300, // Sabit genişlik
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Bu satır butonu sağa hizalar
    width: '100%',
  },
  cardTitle: {
    flex: 0.7, // %70 genişlik
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    flex: 0.1, // %10 genişlik
    marginRight: 10,
  },
  detailsButton: {
    flex: 0.2, // %20 genişlik
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childContainer: {
    marginTop: 10,
    // Çocuk öğeleri dikeyde hizalanacak
  },
});

export default TreeCardItem;


*/ 