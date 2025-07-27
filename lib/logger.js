// In lib/logger.js
export const Logger = {
  info: (module, message) => console.log(`%c[${module}]%c ${message}`, 'color: #00A0F0; font-weight: bold;', 'color: default;'),
  success: (module, message) => console.log(`%c[${module}]%c ${message}`, 'color: #00B050; font-weight: bold;', 'color: default;'),
  warning: (module, message) => console.warn(`%c[${module}]%c ${message}`, 'color: #FFC000; font-weight: bold;', 'color: default;'),
  error: (module, message, errorObj = '') => console.error(`%c[${module}]%c ${message}`, 'color: #C00000; font-weight: bold;', 'color: default;', errorObj)
};
