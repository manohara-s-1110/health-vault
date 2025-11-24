import WeightWidget from './WeightWidget';

// format: { id, label, component, defaultColor }
export const AVAILABLE_WIDGETS = [
  {
    type: 'weight',
    label: 'Weight Tracker',
    component: WeightWidget,
    color: '#E3F2FD', // Light Blue
  },
  // To add a new widget later:
  // 1. Create NewWidget.js
  // 2. Import it here
  // 3. Add object: { type: 'new', label: 'New Widget', component: NewWidget, color: '#...' }
];