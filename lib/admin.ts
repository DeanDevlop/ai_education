export const isAdmin = (email: string | undefined) => {
  const adminEmails = ["mantapdor45@gmail.com"]; // Ganti dengan email kamu
  return email ? adminEmails.includes(email) : false;
};