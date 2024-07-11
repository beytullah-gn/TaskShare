import React, { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { db } from '../firebase-config.js';
import {
    ref,
    onValue,
    update
} from 'firebase/database';

function ExpiredScreen() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            const usersRef = ref(db, '/users');
            onValue(usersRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const usersArray = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setUsers(usersArray);
                }
            });
        };

        const getTasks = () => {
            const tasksRef = ref(db, '/tasks');
            onValue(tasksRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const tasksArray = Object.keys(data)
                        .map((key) => ({
                            id: key,
                            ...data[key],
                        }))
                        .filter((task) => task.expired === true ) // Sadece expired: true ve done: false olanları al
                        .sort((a, b) => new Date(a.finishDate) - new Date(b.finishDate)); // Bitiş tarihine göre sırala
                    setTasks(tasksArray);
                }
            });
        };

        getTasks();
        getUsers();
    }, []);

    const toggleExpired = async (taskId, currentExpired, finishDate, currentDone) => {
        if (new Date(finishDate) < new Date()) {
            Alert.alert("Hata", "Bitiş tarihi bugünden önce olduğu için görevin süresi dolmuş olarak işaretlenemez.");
            return;
        }

        const tasksRef = ref(db, `/tasks/${taskId}`);
        await update(tasksRef, {
            expired: !currentExpired,
            color: 'red',
            done: false,
        });

        // Güncellenen görevleri yeniden yükle
        getTasks();
    };

    const renderItem = ({ item }) => {
        const backgroundColor = item.done ? 'green' : 'red';

        // Kullanıcı adlarını al
        const assignedUsers = item.userIds.map(userId => {
            const user = users.find(u => u.id === userId);
            return user ? user.username : 'Unknown';
        }).join(', ');

        return (
            <View style={[styles.taskItem, { backgroundColor }]}>
                <View style={styles.taskDetails}>
                    <Text style={styles.taskText}>{item.text}</Text>
                    <Text style={styles.taskInfo}>Başlangıç Tarihi: {item.startDate}</Text>
                    <Text style={styles.taskInfo}>Bitiş Tarihi: {item.finishDate}</Text>
                    <Text style={styles.taskInfo}>Atandığı kişiler: {assignedUsers}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleExpired(item.id, item.expired, item.finishDate, item.done)}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Kaldır</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Expired Tasks</Text>
            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.flatList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    flatList: {
        marginTop: 10,
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    taskDetails: {
        flex: 1,
    },
    taskText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    taskInfo: {
        fontSize: 14,
        marginBottom: 3,
    },
    button: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ExpiredScreen;
