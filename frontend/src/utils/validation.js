export const validateName = (name) => {
  const regex = /^[a-zA-Z\s]{2,50}$/;
  if (!regex.test(name)) {
    return "Name must be 2-50 characters long and contain only letters and spaces.";
  }
  return null;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
};

export const validateStrongPassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!regex.test(password)) {
    return "Password must be at least 8 characters long and include at least one letter, one number, and one special character (@$!%*#?&).";
  }
  return null;
};

export const validatePhone = (phone) => {
  const regex = /^\d{10}$/;
  if (!regex.test(phone)) {
    return "Please enter a valid 10-digit phone number.";
  }
  return null;
};

export const validateURL = (url) => {
  const regex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\- .\/?%&=]*)?$/;
  if (!regex.test(url)) {
    return "Please enter a valid URL (e.g., https://github.com/username).";
  }
  return null;
};

export const validateCertificateID = (id) => {
  const regex = /^[A-Za-z0-9\-_]+$/;
  if (!regex.test(id)) {
    return "ID must only contain letters, numbers, hyphens, and underscores.";
  }
  return null;
};
