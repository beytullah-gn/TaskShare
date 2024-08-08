import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#f8f9fa',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#3b5998',
      textAlign: 'center',
    },
    inputContainer: {
      width: '100%',
      maxWidth: 400,
      marginBottom: 20,
    },
    input: {
      height: 50,
      borderColor: '#3b5998',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 15,
      backgroundColor: '#ffffff',
      fontSize: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      flexWrap: 'wrap', // Butonların sarmalanmasını sağlar
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#3b5998',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginVertical: 5, // Butonlar arasında boşluk
      flex: 1, // Butonların eşit genişlikte olmasını sağlar
      maxWidth: '48%', // Ekrana sığması için maksimum genişlik
    },
    pdfButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      flexWrap: 'wrap', // Butonların sarmalanmasını sağlar
      marginBottom: 20,
    },
    pdfButton: {
      backgroundColor: 'red',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      justifyContent:'center',
      alignItems: 'center',
      marginVertical: 5, // Butonlar arasında boşluk
      flex: 1, // Butonların eşit genişlikte olmasını sağlar
      maxWidth: '100%', // Ekrana sığması için maksimum genişlik
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    listContainer: {
      flexGrow: 1,
    },
    departmentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ffffff', // Varsayılan arka plan rengi
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedItem: {
      backgroundColor: '#e0f7fa', // Seçilen departman için arka plan rengi (mavi)
    },
    departmentItem: {
      flex: 1,
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      borderRadius: 20,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    deleteButtonText: {
      color: '#ffffff',
      fontSize: 18,
    },
    departmentText: {
      fontSize: 16,
      color: '#3b5998',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Gölge efekti
    },
    modalContent: {
      width: '100%',
      backgroundColor: '#f1f1f1',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
      maxHeight: '80%', // Modalın yüksekliğini sınırlama
    },
    modalHeader: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#3b5998',
    },
    loadingText: {
      fontSize: 16,
      color: '#3b5998',
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#dc3545',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1, // Kapatma butonunun diğer içeriklerin üstünde olmasını sağlar
    },
    closeButtonText: {
      fontSize: 20,
      color: '#fff',
    },
    selectedDepartmentText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#3b5998',
      marginTop: 20,
      textAlign: 'center',
    },
  });