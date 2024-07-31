import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f6f9',
      padding: 10,
    },
    content: {
      paddingBottom: 20,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#003366',
      marginBottom: 8,
    },
    cardContent: {
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#003366',
    },
    text: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 8,
      marginBottom: 8,
      fontSize: 16,
    },
    personCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    personName: {
      fontSize: 16,
    },
    removeButton: {
      backgroundColor: '#ff4d4d', 
      borderRadius: 25, 
      justifyContent: 'center',
      alignItems: 'center',
      width: 40, 
      height: 40, 
    },
    
    removeButtonText: {
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#003366',
      marginBottom: 12,
    },
    addButton: {
      backgroundColor: '#003366',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    editButton: {
      backgroundColor: '#003366',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    editButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonText: {
        color: '#003366',
        fontSize: 16,
        fontWeight: 'bold',
      },
      selectedPdfText: {
        fontSize: 16,
        color: '#003366',
        marginVertical: 10,
      },
  });