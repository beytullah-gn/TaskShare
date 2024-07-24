// userHelpers.js
import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase-config';
import { getToken } from './tokenStorage';

export const fetchUserData = async () => {
  const token = await getToken();
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && token) {
    const userRef = ref(db, 'Users/' + user.uid);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return {
        ...userData,
        id: user.uid, // Kullanıcının eşsiz ID'sini ekleyin
      };
    }
  }

  return null;
};