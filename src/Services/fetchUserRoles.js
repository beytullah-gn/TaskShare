// Services/fetchUserRoles.js
import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase-config';
import { getToken } from './tokenStorage';

export const fetchUserRoles = async () => {
  const token = await getToken();
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && token) {
    const userRef = ref(db, 'Users/' + user.uid);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const PersonId = userData.PersonId;

      const deptEmployeesRef = ref(db, 'DepartmentEmployees');
      const deptEmployeesSnapshot = await get(deptEmployeesRef);

      if (deptEmployeesSnapshot.exists()) {
        const deptEmployeesData = deptEmployeesSnapshot.val();
        let activeRoles = [];

        for (const key in deptEmployeesData) {
          const employee = deptEmployeesData[key];
          if (employee.EmployeeId === PersonId && employee.Active === true) {
            activeRoles.push(employee.RoleID);
          }
        }

        if (activeRoles.length === 0) {
          return null;
        }

        const rolesRef = ref(db, 'Roles');
        const rolesSnapshot = await get(rolesRef);

        if (!rolesSnapshot.exists()) {
          throw new Error("Role bilgileri bulunamadı.");
        }

        const rolesData = rolesSnapshot.val();
        let roles = [];

        for (const roleId of activeRoles) {
          for (const roleKey in rolesData) {
            if (rolesData[roleKey].RoleID === roleId) {
              roles.push(rolesData[roleKey]);
            }
          }
        }

        return roles.length > 0 ? roles : null;
      } else {
        throw new Error("Departman çalışan bilgileri bulunamadı.");
      }
    } else {
      throw new Error("Kullanıcı bilgileri bulunamadı.");
    }
  } else {
    throw new Error("Kullanıcı oturumu açmamış veya token bulunamadı.");
  }

  return null;
};
