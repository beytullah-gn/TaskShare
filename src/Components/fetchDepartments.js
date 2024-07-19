import React, { useEffect } from 'react';
import { db } from './firebase-config';
import { ref, onValue } from 'firebase/database';

const FetchDepartments = ({ setDepartments }) => {
  useEffect(() => {
    const departmentsRef = ref(db, 'Departments');
    onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data ) {
        const departmentsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setDepartments(departmentsArray);
      } else {
        setDepartments([]);
      }
    });
  }, [setDepartments]);
  
  return null;
};

export default FetchDepartments;
