import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dinamik renk üretmek için bir fonksiyon
const generateColor = (level) => {
  const hue = (level * 137.508) % 360; // Farklı renk tonları için bir hesaplama
  return `hsl(${hue}, 70%, 80%)`; // Renk tonu, doygunluk ve parlaklık ayarları
};

const TreeCardItem = ({ item, expandedItems, onToggleExpand, searchTerm, level = 0 }) => {
  const isExpanded = expandedItems.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={() => onToggleExpand(item.id)}
        style={[styles.card, { backgroundColor: generateColor(level) }, hasChildren && styles.cardWithChildren]}
      >
        <View style={styles.cardHeader}>
          {hasChildren && (
            <Ionicons
              name={isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
              size={20}
              color="black"
              style={styles.icon}
            />
          )}
          <Text style={[styles.cardTitle, searchTerm && item.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase()) && styles.highlighted]}>
            {item.DepartmentName}
          </Text>
        </View>
        {isExpanded && item.children && item.children.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childContainer}>
            {item.children.map(child => (
              <TreeCardItem
                key={child.id}
                item={child}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
                searchTerm={searchTerm}
                level={level + 1} // Alt kartın seviyesi bir artırılır
              />
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 5,
    alignItems: 'center',
  },
  card: {
    borderRadius: 10,
    elevation: 5,
    padding: 15,
    marginHorizontal: 10,
    minWidth: 160, // Minimum kart genişliği
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWithChildren: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flexShrink: 1,
  },
  highlighted: {
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    padding: 5,
  },
  childContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default TreeCardItem;
