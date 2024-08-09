import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#dfe3ee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color:'#3b5998'
  },
  input: {
    height: 50, // Yüksekliği belirleyin
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#f7f7f7',
  },
  button: {
    height: 50, // Yüksekliği input ile aynı yapın
    backgroundColor: '#3b5998',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center', // Buton içeriğini ortalar
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#3b5998',
    fontSize: 16,
  },
});
