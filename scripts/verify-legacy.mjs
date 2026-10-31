import { sites } from './sites.mjs';
const results=[];
for (const site of sites) {
  if (!site.legacyHost) continue;
  const url = `https://${site.legacyHost}/?view=era`;
  try {
    const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});
    const location=response.headers.get('location');
    const expected=`https://data-of-japan.org${site.path}?view=era`;
    const ok=[301,308].includes(response.status) && location===expected;
    results.push({host:site.legacyHost,status:response.status,location,ok});
  } catch(error) { results.push({host:site.legacyHost,ok:false,error:error.message}); }
}
for (const result of results) console.log(JSON.stringify(result));
if(results.some(r=>!r.ok))process.exitCode=1;
