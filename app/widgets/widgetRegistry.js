import WeightWidget from './WeightWidget';
import BloodGroupWidget from './BloodGroupWidget';
import HeightWidget from './HeightWidget';
import BMIWidget from './BMIWidget';
import HeartRateWidget from './HeartRateWidget';
import WaterWidget from './WaterWidget';


export const AVAILABLE_WIDGETS = [
   {
       type: 'height', // <--- 2. Add New Object
       label: 'Height Tracker',
       component: HeightWidget,
       color: '#E8F5E9', // Light Green
       dataConfig: {
         field: 'height',          // Firebase field
         title: 'Update Height',
         unit: 'cm',
         inputType: 'numeric',
       }
     },
   {
         type: 'water', // <--- 2. Add Water Widget
         label: 'Water Tracker',
         component: WaterWidget,
         color: '#E1F5FE', // Very Light Blue
         dataConfig: {
           field: 'water',
           title: 'Update Water Intake',
           unit: 'ml',
           inputType: 'numeric',
         }
       },
  {
    type: 'weight',
    label: 'Weight Tracker',
    component: WeightWidget,
    color: '#E3F2FD',
    // --- NEW CONFIG ---
    dataConfig: {
      field: 'weight',          // Field name in medicalInfo
      title: 'Update Weight',   // Modal title
      unit: 'kg',               // Unit label
      inputType: 'numeric',     // Keyboard type
    }
  },
  {
    type: 'bloodGroup',
    label: 'Blood Group',
    component: BloodGroupWidget,
    color: '#FFEBEE',
    // --- NEW CONFIG ---
    dataConfig: {
      field: 'bloodGroup',
      title: 'Update Blood Type',
      unit: '',
      inputType: 'default',     // Standard text keyboard
    }
  },
  {
      type: 'heartRate', // <--- 2. Add Heart Rate
      label: 'Heart Rate',
      component: HeartRateWidget,
      color: '#FCE4EC', // Light Pink
      dataConfig: {
        field: 'heartRate',
        title: 'Update Heart Rate',
        unit: 'bpm',
        inputType: 'numeric',
      }
    },
  {
      type: 'bmi',
      label: 'BMI Calculator', // <--- 2. Add BMI Widget
      component: BMIWidget,
      color: '#F3E5F5', // Light Purple
      // Note: No dataConfig here! It is read-only.
    },
];