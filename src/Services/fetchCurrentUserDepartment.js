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
      const PersonId = userData.PersonId; // PersonId'yi al

      // Tüm Persons verilerini al
      const personsRef = ref(db, 'Persons');
      const personsSnapshot = await get(personsRef);

      if (personsSnapshot.exists()) {
        const personsData = personsSnapshot.val();
        let personData = null;

        // PersonId'yi arayıp eşleşeni bul
        for (const key in personsData) {
          if (personsData[key].PersonId === PersonId) {
            personData = personsData[key];
            break;
          }
        }

        if (personData) {
          // AccountType'ı kontrol et
          if (personData.AccountType === 'Employee') {
            // DepartmentEmployees içindeki EmployeeId'yi kontrol et
            const deptEmployeesRef = ref(db, 'DepartmentEmployees');
            const deptEmployeesSnapshot = await get(deptEmployeesRef);

            if (deptEmployeesSnapshot.exists()) {
              const deptEmployeesData = deptEmployeesSnapshot.val();
              let activeRoles = [];

              for (const key in deptEmployeesData) {
                const employee = deptEmployeesData[key];
                if (employee.EmployeeId === personData.PersonId && employee.Active === true) {
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
              let departmentIds = [];

              for (const roleId of activeRoles) {
                for (const roleKey in rolesData) {
                  if (rolesData[roleKey].RoleID === roleId) {
                    departmentIds.push(rolesData[roleKey].DepartmentId);
                  }
                }
              }

              if (departmentIds.length === 0) {
                return null;
              }

              const departmentsRef = ref(db, 'Departments');
              const departmentsSnapshot = await get(departmentsRef);

              if (!departmentsSnapshot.exists()) {
                throw new Error("Departman bilgileri bulunamadı.");
              }

              const departmentsData = departmentsSnapshot.val();
              let departments = [];

              for (const deptKey in departmentsData) {
                if (departmentIds.includes(departmentsData[deptKey].DepartmentId)) {
                  departments.push(departmentsData[deptKey]);
                }
              }

              return departments.length > 0 ? departments : null;
            } else {
              throw new Error("Departman çalışan bilgileri bulunamadı.");
            }
          } else if (personData.AccountType === 'Client') {
            return null;
          } else {
            throw new Error("Bilinmeyen hesap türü.");
          }
        } else {
          throw new Error("PersonId ile eşleşen kişi bulunamadı.");
        }
      } else {
        throw new Error("Persons verileri bulunamadı.");
      }
    } else {
      throw new Error("Kullanıcı bilgileri bulunamadı.");
    }
  } else {
    throw new Error("Kullanıcı oturumu açmamış veya token bulunamadı.");
  }

  return null;
};
