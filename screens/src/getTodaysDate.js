export const GetTodaysDate = () => {
    const time = new Date();
    const saat = time.getHours().toString().padStart(2, '0');
    const dakika = time.getMinutes().toString().padStart(2, '0');
    const gun = time.getDate().toString().padStart(2, '0');
    const ay = (time.getMonth() + 1).toString().padStart(2, '0'); // Aylar 0-11 arası olduğu için +1 ekliyoruz
    const yil = time.getFullYear();
  
    const todaysDate= `${saat}:${dakika}-${gun}.${ay}.${yil}`;
    parseDateString(todaysDate);
  };

  export const parseDateString = (str) => {
    // Zaman ve tarihi ayır
    const [timePart, datePart] = str.split('-');
    // Saat ve dakikayı ayır
    const [hours, minutes] = timePart.split(':').map(Number);
    // Günü, ayı ve yılı ayır
    const [day, month, year] = datePart.split('.').map(Number);
  
    // Date nesnesini oluştur
    const date = new Date(year, month - 1, day, hours, minutes);
  
    return date;
  };
  

  