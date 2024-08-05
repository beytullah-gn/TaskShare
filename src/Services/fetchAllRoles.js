import { db } from './firebase-config'; // Firebase yapılandırma dosyasını içe aktar
import { ref, get } from 'firebase/database'; // Firebase database fonksiyonlarını içe aktar

const fetchAllRoles = async () => {
  const rolesRef = ref(db, 'Roles'); // Roles düğümüne referans oluştur
  try {
    const snapshot = await get(rolesRef); // Verileri çek
    const data = snapshot.val(); // Verileri al
    if (data) {
      const rolesArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key] // Her bir rolü id ve verileriyle birlikte diziye ekle
      }));
      return rolesArray; // Verileri dizi olarak döndür
    } else {
      return []; // Veri yoksa boş dizi döndür
    }
  } catch (error) {
    console.error("Error fetching roles: ", error); // Hata durumunda konsola yazdır
    return []; // Hata durumunda boş dizi döndür
  }
};

export default fetchAllRoles; // Fonksiyonu dışa aktar
