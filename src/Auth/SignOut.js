import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

export const SignOutService = async (navigation) => {
    const auth = getAuth();
    try {
        await signOut(auth);
        console.log('Çıkış yapıldı');
        navigation.navigate('LoginScreen'); // Login sayfasına yönlendirme
    } catch (error) {
        console.error('Sign out error', error);
    }
};
