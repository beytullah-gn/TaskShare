import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase-config';
import { getToken } from './tokenStorage';

export const fetchCurrentDepartment = async () => {
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
        let activeDepartments = [];

        // DepartmentEmployees objesinde EmployeeId'ye sahip olan ve Active özelliği true olanları bul
        for (const key in departmentEmployeesData) {
          const employee = departmentEmployeesData[key];
          if (employee.EmployeeId === EmployeeId && employee.Active === true) {
            activeDepartments.push(employee);
          }
        }
        //Hata yakalama
        if (activeDepartments.length > 1) {
          throw new Error("Birden fazla departman hatası");
        } else if (activeDepartments.length === 0) {
          throw new Error("Aktif departman yok");
        } else {
          const DepartmentId = activeDepartments[0].DepartmentId;

          // Departments bilgilerini al
          const departmentsRef = ref(db, 'Departments');
          const departmentsSnapshot = await get(departmentsRef);

          if (departmentsSnapshot.exists()) {
            const departmentsData = departmentsSnapshot.val();

            // Departments objesinde DepartmentId'ye sahip olanı bul
            for (const deptKey in departmentsData) {
              if (departmentsData[deptKey].DepartmentId === DepartmentId) {
                return departmentsData[deptKey]; // Eşleşen department verisini döndür
              }
            }
          }
        }
      }
    }
  }

  return null;
};
