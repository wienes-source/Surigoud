import http from 'node:http';
import {createTestPayment,testConfig} from './mollie.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {products} from './public/catalog.js';
export function validateCheckout(body){
 if(!body||!Array.isArray(body.items)||!body.items.length||body.items.length>50)return {status:400,error:'Ongeldige winkelwagen.'};
 const ids=new Set();
 for(const item of body.items){if(!item||typeof item.id!=='string'||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10||ids.has(item.id))return {status:400,error:'Ongeldige aantallen of dubbele producten.'};ids.add(item.id);const p=products.find(p=>p.id===item.id);if(!p)return {status:400,error:'Onbekend product.'};if(p.demo||!Number.isInteger(p.priceCents)||p.priceCents<=0||!Number.isInteger(p.stock)||p.stock<item.quantity)return {status:409,error:'Deze producten zijn nog niet te koop.'};}
 return {status:503,error:'De betaalprovider is nog niet gekoppeld.'};
}
let nextTestPayment=0;
export const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/payments/test'){
  if(req.method!=='POST')return json(405,{error:'Gebruik POST.'});
  let config;try{config=testConfig();}catch{return json(503,{error:'De Mollie-test is nog niet ingesteld. Er is niets afgeschreven.'});}
  if(req.headers.origin!==config.origin)return json(403,{error:'Start de test vanaf het ingestelde webshopdomein.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Gebruik application/json.'});
  // Globale limiet voor deze kleine, optionele sandbox; niet geschikt als productie-rate-limiter.
  if(Date.now()<nextTestPayment)return json(429,{error:'Wacht één minuut voordat je opnieuw test.'});
  nextTestPayment=Date.now()+60000;
  try{return json(200,await createTestPayment());}catch{return json(502,{error:'De Mollie-test kon niet starten. Probeer het later opnieuw.'});}
 }
 if(pathname==='/api/checkout'){
  if(req.method!=='POST')return json(405,{error:'Gebruik POST.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Gebruik application/json.'});
  let raw='';try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8192)return json(413,{error:'Verzoek te groot.'});}const result=validateCheckout(JSON.parse(raw));return json(result.status,{error:result.error});}catch{return json(400,{error:'Ongeldige JSON.'});}
 }
 if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Methode niet toegestaan.'});
 const routes={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/catalog.js':'catalog.js','/betaling-test':'payment-test.html','/payment-test.js':'payment-test.js','/assets/ringen.jpg':'assets/ringen.jpg','/assets/armbanden.jpg':'assets/armbanden.jpg','/assets/hangers.jpg':'assets/hangers.jpg'};
 if(!routes[pathname]){res.writeHead(404);return res.end('Pagina niet gevonden');}
 try{const data=await readFile(new URL('./public/'+routes[pathname],import.meta.url));res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'})[extname(routes[pathname])]});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(500);res.end('Pagina tijdelijk niet beschikbaar');}
});
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log(`Surigoud: http://localhost:${Number(process.env.PORT)||3000}`));
