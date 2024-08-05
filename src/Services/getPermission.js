import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase-config';
import { getToken } from './tokenStorage';

export const getPermission = async () => {
  const token = await getToken();
  const auth = getAuth();
  const user = auth.currentUser;

  if (user && token) {
    try {
      // Kullanıcı bilgilerini al
      const userRef = ref(db, 'Users/' + user.uid);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("Kullanıcı bilgileri bulunamadı.");
      }

      const userData = userSnapshot.val();
      const PersonId = userData.PersonId;

      // Departman çalışan bilgilerini al
      const deptEmployeesRef = ref(db, 'DepartmentEmployees');
      const deptEmployeesSnapshot = await get(deptEmployeesRef);
      if (!deptEmployeesSnapshot.exists()) {
        throw new Error("Departman çalışan bilgileri bulunamadı.");
      }

      const deptEmployeesData = deptEmployeesSnapshot.val();
      let activeRoles = [];
      for (const key in deptEmployeesData) {
        const employee = deptEmployeesData[key];
        if (employee.EmployeeId === PersonId && employee.Active === true) {
          activeRoles.push(employee.RoleID);
        }
      }

      if (activeRoles.length === 0) {
        return []; // Aktif rol yoksa boş dizi döndür
      }

      // Roller bilgilerini al
      const rolesRef = ref(db, 'Roles');
      const rolesSnapshot = await get(rolesRef);
      if (!rolesSnapshot.exists()) {
        throw new Error("Rol bilgileri bulunamadı.");
      }

      const rolesData = rolesSnapshot.val();
      console.log("Roles Data:", rolesData);

      let permissions = new Set(); // Aynı izni iki kez eklememek için Set kullanıyoruz

      // Aktif rollerin izinlerini kontrol et
      activeRoles.forEach(roleId => {
        const role = rolesData[roleId];
        if (role) {
          console.log("Role ID:", roleId); // Role ID'yi kontrol edin
          console.log("Role:", role); // Role verisini kontrol edin
          if (role.Permissions) {
            console.log("Role Permissions:", role.Permissions); // Role Permissions verisini kontrol edin
            Object.keys(role.Permissions).forEach(permissionKey => {
              if (role.Permissions[permissionKey] === true) {
                permissions.add(permissionKey); // Set'e ekle
              }
            });
          }
        } else {
          console.warn(`Role ID ${roleId} not found in rolesData`); // Hangi roleId'nin bulunamadığını belirtin
        }
      });

      return Array.from(permissions); // Set'i diziye çevir

    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  } else {
    throw new Error("Kullanıcı oturumu açmamış veya token bulunamadı.");
  }
};
