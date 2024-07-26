import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Modal } from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { db } from './firebase-config'; // Firebase bağlantı noktanızı buraya ekleyin
import { SafeAreaView } from "react-native-safe-area-context";

function Login({ navigation }) {
    const [text, onChangeText] = useState('');
    const [password, onChangePassword] = useState('');
    const [users, setUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [requestText, setRequestText] = useState('');

    useEffect(() => {
        const usersRef = ref(db, '/users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                }));
                setUsers(usersArray);
            }
        }, (error) => {
            console.error("Kullanıcı verileri alınamadı: ", error);
        });
    }, []);

   
    function Auth() {
        const user = users.find(u => u.username === text && u.password === password);

        if (user) {
            console.log(`${user.accountType} girişi başarılı`);
            onChangePassword('');
            onChangeText('');
            acType = user.accountType;
            acId = user.id;
            acName = user.username;
            
            if (user.accountType === 'Admin') {
                navigation.navigate('MainScreen');
            } else if (user.accountType === 'worker') {
                navigation.navigate('MainScreenWorker');
            }
        } else {
            console.log("Giriş başarısız");
            onChangePassword('');
            alert('Giriş başarısız');
        }
    }

    function sifreunuttum() {
        setModalVisible(true); // Şifremi Unuttum modal'ını aç
    }

    function sendPasswordRequest() {
        if (requestText.trim() !== '') {
            const newRequestRef = ref(db, '/passwordRequests'); // Referansı doğru şekilde al
            push(newRequestRef, {
                message: requestText,
                timestamp: new Date().toISOString(),
            })
            .then(() => {
                setRequestText(''); // İsteği gönderdikten sonra input'u temizle
                setModalVisible(false); // Modal'ı kapat
                alert('Şifre sıfırlama isteğiniz gönderildi. Yöneticiniz yeni giriş bilgilerini size iletecektir. ');
            })
            .catch(error => {
                console.error('Şifre sıfırlama isteği gönderme hatası:', error);
                alert('Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.');
            });
        } else {
            alert('Lütfen bir mesaj yazın.');
        }
    }
    
    return (
        <SafeAreaView style={styles.container}>
            
            <View style={styles.firstView} />
            <View style={styles.Viewstyle}>

                <Text>GİRİŞ YAP</Text>
                <TextInput 
                    style={styles.InputStyle}
                    value={text}
                    placeholder="Kullanıcı Adı"
                    onChangeText={onChangeText}
                />
                <TextInput 
                    style={styles.InputStyle}
                    value={password}
                    onChangeText={onChangePassword}
                    placeholder="Şifre"
                    secureTextEntry
                />
                <View style={styles.buttonView}>
                    <Button title="Giriş Yap" onPress={Auth} />
                    <View style={styles.spacer}></View>
                    <TouchableOpacity onPress={sifreunuttum}>
                        <Text style={styles.color}>Şifremi Unuttum</Text>
                    </TouchableOpacity>
                </View>

                {/* Şifremi Unuttum modal'ı */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Şifre Sıfırlama İsteği</Text>
                            <TextInput
                                style={styles.input}
                                value={requestText}
                                onChangeText={setRequestText}
                                placeholder="Şifresini unuttuğunuz hesabınızın kullanıcı adını belirtin..."
                                multiline={true}
                            />
                            <View style={styles.modalButtons}>
                                <Button title="Gönder" onPress={sendPasswordRequest} />
                                <Button title="İptal" onPress={() => setModalVisible(false)} />
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'whitesmoke',
    },
    firstView: {
        marginTop: 30,
    },
    Viewstyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    InputStyle: {
        width: 300,
        height: 40,
        borderWidth: 1,
        margin: 5,
        padding: 7,
        borderRadius: 12,
    },
    buttonView: {
        flexDirection: 'row',
        margin: 10,
        alignItems: 'center',
    },
    spacer: {
        width: 20,
    },
    color: {
        color: 'blue',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Arka planı opak yapar
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
});

export default Login;
export let acType, acId,acName;