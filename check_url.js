const https = require('https');
https.get('https://tpmsudamerica.vercel.app/admin/temporadas/cmr4nv3ez00012eh3aahov22o', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('ACCESO DENEGADO')) console.log('ACCESO DENEGADO FOUND');
    else if (data.includes('Cargando Torneo')) console.log('SUSPENSE RENDERED');
    else console.log('OTHER CONTENT:', data.substring(0, 100));
  });
});
