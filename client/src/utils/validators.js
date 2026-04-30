// ── Frontend Validation Helpers ──────────────────────────

export const validateRegister = ({ name, email, password }) => {
  const errors = {};

  // Name
  if (!name.trim())
    errors.name = 'Name is required';
  else if (name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters';
  else if (name.trim().length > 50)
    errors.name = 'Name must be less than 50 characters';
  else if (!/^[a-zA-Z\s]+$/.test(name))
    errors.name = 'Name can only contain letters and spaces';

  // Email
  if (!email.trim())
    errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address';

  // Password
  if (!password)
    errors.password = 'Password is required';
  else if (password.length < 6)
    errors.password = 'Password must be at least 6 characters';
  else if (!/\d/.test(password))
    errors.password = 'Password must contain at least one number';

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email.trim())
    errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address';

  if (!password)
    errors.password = 'Password is required';

  return errors;
};

export const validateElection = ({ title, endDate }) => {
  const errors = {};

  if (!title.trim())
    errors.title = 'Election title is required';
  else if (title.trim().length < 3)
    errors.title = 'Title must be at least 3 characters';
  else if (title.trim().length > 100)
    errors.title = 'Title must be less than 100 characters';

  if (endDate && new Date(endDate) <= new Date())
    errors.endDate = 'End date must be in the future';

  return errors;
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6)       errors.push('At least 6 characters');
  if (!/\d/.test(password))      errors.push('At least one number');
  if (!/[a-zA-Z]/.test(password)) errors.push('At least one letter');
  return errors;
};

// Password strength meter
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/\d/.test(password))   score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { label: '',          color: ''                },
    { label: 'Weak',      color: 'bg-red-500'      },
    { label: 'Fair',      color: 'bg-orange-500'   },
    { label: 'Good',      color: 'bg-yellow-500'   },
    { label: 'Strong',    color: 'bg-green-500'    },
    { label: 'Very Strong', color: 'bg-green-600'  },
  ];
  return { score, ...levels[score] };
};
