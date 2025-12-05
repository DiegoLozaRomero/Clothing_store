const replace = require('replace-in-file');
const path = require('path');

(async () => {
  try {
    const results = await replace({
      files: 'src/**/*.css',       // todos tus CSS dentro de src
      from: /^\s*;\s*$/gm,         // líneas que solo tengan ;
      to: '',                       // las reemplaza por nada
    });
    console.log('Archivos procesados:', results.map(r => r.file));
  } catch (error) {
    console.error('Error:', error);
  }
})();

