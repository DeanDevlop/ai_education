import crypto from 'crypto';

// ... kode yang ada sebelumnya ...

// Fungsi helper untuk menghasilkan string acak yang aman secara kriptografis
const generateSecureRandomString = (length: number = 32): string => {
  // crypto.randomBytes(n) menghasilkan n byte. Untuk string hex dengan panjang 'length' karakter,
  // kita membutuhkan Math.ceil(length / 2) byte.
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

// Ganti penggunaan Math.random() di baris 25 dengan fungsi di atas.
// Contoh: Jika sebelumnya Anda memiliki `const uniqueId = Math.random().toString(36).substring(2);`
// Ganti dengan:
const uniqueId = generateSecureRandomString(16); // Untuk ID hex 16 byte (32 karakter)

// Pastikan untuk menyesuaikan panjang token/ID sesuai kebutuhan aplikasi Anda.
// ... kode yang ada setelahnya ...