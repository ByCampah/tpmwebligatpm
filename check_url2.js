const https = require('https');
https.get('https://tpmsudamerica.vercel.app/admin/temporadas/cmr4nv3ez00012eh3aahov22o', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('No encontrado')) {
       console.log('CONTAINS NO ENCONTRADO');
    }
    const match = data.match(/<script.*?>(.*?)<\/script>/gi);
    if (match) console.log('Scripts:', match.length);
    console.log(data.substring(data.length - 1000));
  });
});
