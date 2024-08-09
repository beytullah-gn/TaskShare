import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TreeCardItem = ({ item, expandedItems, onToggleExpand, level = 0, navigation }) => {
  const isExpanded = expandedItems.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const screenwidth = Dimensions.get('window').width;
  const cardWidth = screenwidth * 0.9; // Width of the card set to 90% of screen width

  const handleDetailPress = () => {
    navigation.navigate('SelectedDepartment', { id: item.id });
  };

  // Function to get background color based on level
  const getBackgroundColor = (level) => {
    const baseColor = 255; // White color base (255 in RGB)
    const darkenAmount = Math.min(30 * level, 100); // Darken up to a maximum of 100 units
    const grayValue = baseColor - darkenAmount;
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`; // Convert to RGB
  };

  return (
    <View style={[styles.cardContainer]}>
      <TouchableOpacity
        onPress={() => onToggleExpand(item.id)}
        style={[styles.card, { width: cardWidth, backgroundColor: getBackgroundColor(level) }]}
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
              size={30}
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
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,

  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align button to the right
    width: '100%',
  },
  cardTitle: {
    flex: 0.7, // 70% width
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft:5,
  },
  icon: {
    flex: 0.1, // 10% width
  },
  detailsButton: {
    flex: 0.15, // 15% width
    backgroundColor: '#1d3469',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childContainer: {
    marginTop: 10,
  },
});

export default TreeCardItem;
