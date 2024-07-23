import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase-config';
import { getToken } from './tokenStorage';

export const fetchEmployeeData = async () => {
  const token = await getToken();
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && token) {
    // Kullanıcı bilgilerini al
    const userRef = ref(db, 'Users/' + user.uid);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const EmployeeId = userData.EmployeeId; // EmployeeId'yi al

      // Employee bilgilerini al
      const Employeeref = ref(db, 'Employees');
      const employeeSnapshot = await get(Employeeref);

      if (employeeSnapshot.exists()) {
        const employeeData = employeeSnapshot.val();

        // Employees objesinde EmployeeId'ye sahip olanı bul
        for (const key in employeeData) {
          if (employeeData[key].EmployeeId === EmployeeId) {
            return employeeData[key]; // Eşleşen öğeyi döndür
          }
        }
      }
    }
  }

  return null;
};
