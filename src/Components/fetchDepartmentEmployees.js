import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase-config';
import { getToken } from './tokenStorage';

export const fetchDepartmentEmployeeData = async () => {
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

      // DepartmentEmployees bilgilerini al
      const departmentEmployeesRef = ref(db, 'DepartmentEmployees');
      const departmentEmployeesSnapshot = await get(departmentEmployeesRef);

      if (departmentEmployeesSnapshot.exists()) {
        const departmentEmployeesData = departmentEmployeesSnapshot.val();

        // DepartmentEmployees objesinde EmployeeId'ye sahip olan ve Active özelliği true olanı bul
        for (const key in departmentEmployeesData) {
          const employee = departmentEmployeesData[key];
          if (employee.EmployeeId === EmployeeId && employee.Active === true) {
            return employee; // Eşleşen ve aktif olan öğeyi döndür
          }
        }
      }
    }
  }

  return null;
};
