import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or another icon library

const { height } = Dimensions.get('window');

const BottomBar = ({ onProfile, onDepartments, onPersons, onQrScreen, onSettings, activePage }) => {
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Reset showMore to false when activePage changes and is not 'more'
    if (activePage !== 'more') {
      setShowMore(false);
    }
  }, [activePage]);

  const getIconName = (page, defaultIcon, activeIcon) => {
    return activePage === page ? activeIcon : defaultIcon;
  };

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={[styles.button, activePage === 'profile' && styles.activeButton]}
        onPress={onProfile}
      >
        <Icon name={getIconName('profile', 'person-circle-outline', 'person-circle')} size={24} color="#fff" />
        {/* <Text style={[styles.buttonText, activePage === 'profile' && styles.activeButtonText]}>Profilim</Text> */}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, activePage === 'departments' && styles.activeButton]}
        onPress={onDepartments}
      >
        <Icon name={getIconName('departments', 'layers-outline', 'layers')} size={24} color="#fff" />
        {/* <Text style={[styles.buttonText, activePage === 'departments' && styles.activeButtonText]}>Departmanlar</Text> */}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, activePage === 'persons' && styles.activeButton]}
        onPress={onPersons}
      >
        <Icon name={getIconName('persons', 'people-outline', 'people')} size={24} color="#fff" />
        {/* <Text style={[styles.buttonText, activePage === 'persons' && styles.activeButtonText]}>Kişiler</Text> */}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, activePage === 'more' && styles.activeButton]}
        onPress={() => setShowMore(!showMore)}
      >
        <Icon name={getIconName('more', 'ellipsis-horizontal-outline', 'ellipsis-horizontal')} size={24} color="#fff" />
        {/* <Text style={[styles.buttonText, activePage === 'more' && styles.activeButtonText]}>Daha Fazla</Text> */}
      </TouchableOpacity>

      {showMore && (
        <View style={styles.moreOptionsContainer}>
          <TouchableOpacity style={[styles.moreButton, activePage === 'qr' && styles.activeMoreButton]} onPress={onQrScreen}>
            <Icon name={getIconName('qr', 'scan-outline', 'scan')} size={24} color="#fff" />
            <Text style={styles.moreButtonText}>Tara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.moreButton, activePage === 'settings' && styles.activeMoreButton]} onPress={onSettings}>
            <Icon name={getIconName('settings', 'settings-outline', 'settings')} size={24} color="#fff" />
            <Text style={styles.moreButtonText}>Ayarlar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.1, // Screen height percentage
    backgroundColor: '#3b5998', // Dark blue for a professional look
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute buttons evenly
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5, // For shadow effect on Android
    shadowColor: '#000', // For shadow effect on iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    flex: 1, // Make each button take equal space
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  activeButton: {
    backgroundColor: '#4a89dc', // Lighter blue for active button
    borderRadius: 10, // Rounded corners for active button
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 16, // Increased font size for better readability
    paddingLeft: 4,
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: 'bold', // Bold text for active button
  },
  moreOptionsContainer: {
    position: 'absolute',
    bottom: height * 0.11, // Increase the height to make the container larger
    right: 10,
    backgroundColor: '#3b5998',
    padding: 15, // Increased padding for more space inside the container
    borderRadius: 15, // Slightly larger border radius
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
    width: 180, // Increased width to allow more space for content
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16, // Increased vertical padding for more button space
    justifyContent: 'flex-start',
    width: '100%', // Make each "more" button take the full width
  },
  activeMoreButton: {
    backgroundColor: '#4a89dc', // Lighter blue for active "More" options button
    borderRadius: 10, // Rounded corners for active button
  },
  moreButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 18, // Increased font size for better readability
  },
});

export default BottomBar;
