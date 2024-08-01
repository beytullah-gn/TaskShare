import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5,Ionicons } from '@expo/vector-icons';

const TreeCardItem = ({ item, expandedItems, onToggleExpand, level = 0, navigation }) => {
  const isExpanded = expandedItems.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;

  const handleDetailPress = () => {
    navigation.navigate('EntryDocument', { pdfUrl: item.PDFUrl });
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
            <FontAwesome5
              name="file-pdf"
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
    flex: 0.15, // %20 genişlik
    backgroundColor: '#cc3333',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childContainer: {
    marginTop: 10,
  },
});

export default TreeCardItem;
