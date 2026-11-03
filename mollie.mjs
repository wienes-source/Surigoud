// Alleen sandboxbetalingen; nooit echte orders of live-sleutels.
import {randomUUID} from 'node:crypto';
export function testConfig(env=process.env){
 if(env.ENABLE_MOLLIE_TEST!=='true'||!/^test_[A-Za-z0-9]+$/.test(env.MOLLIE_API_KEY||''))throw new Error('Mollie-testmodus is niet geconfigureerd.');
 const origin=new URL(env.PUBLIC_BASE_URL);
 if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw new Error('Gebruik een publiek HTTPS-hoofddomein.');
 return {key:env.MOLLIE_API_KEY,origin:origin.origin};
}
async function request(path,{key,fetcher=fetch,body,idempotencyKey}={}){
 const response=await fetcher(`https://api.mollie.com/v2/payments${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/json','Idempotency-Key':idempotencyKey}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000),redirect:'error'});
 if(!response.ok)throw new Error('Mollie is tijdelijk niet beschikbaar.');
 return response.json();
}
export async function createTestPayment({env=process.env,fetcher=fetch}={}){
 const {key,origin}=testConfig(env);
 const payment=await request('',{key,fetcher,idempotencyKey:randomUUID(),body:{amount:{currency:'EUR',value:'1.00'},description:'Surigoud TEST — geen bestelling, geen levering',redirectUrl:`${origin}/betaling-test`,locale:'nl_NL',metadata:{purpose:'surigoud-sandbox'}}});
 if(payment.mode!=='test')throw new Error('Onverwachte betaalmodus.');
 const url=new URL(payment._links?.checkout?.href);
 if(url.protocol!=='https:'||!(url.hostname==='mollie.com'||url.hostname.endsWith('.mollie.com'))||url.username||url.password)throw new Error('Onveilige betaal-URL.');
 return {checkoutUrl:url.href};
}
