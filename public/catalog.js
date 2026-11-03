// Uitsluitend ontwerpvoorbeelden; geen verkoopdata of materiaalclaims.
export const products = [
 ['ala','Ala hanger','Hangers','Een sierlijk ontwerp met een persoonlijke betekenis.','pendant'],
 ['schakel','Klassieke schakelketting','Kettingen','Een tijdloos silhouet, om elke dag dichtbij te dragen.','chain'],
 ['creolen','Ronde creolen','Oorbellen','Een ronde vorm met een warme, elegante uitstraling.','earrings'],
 ['zegel','Ovale zegelring','Ringen','Een karaktervol ontwerp met een klassieke ovale vorm.','ring'],
 ['armband','Fijne schakelarmband','Armbanden','Subtiele schakels voor een verfijnde combinatie.','bracelet'],
 ['hart','Hart hanger','Hangers','Een klein gebaar voor een grote betekenis.','heart']
].map(([id,name,category,description,art])=>({id,name,category,description,art,demo:true,priceCents:null,stock:null,material:null}));
export const categories = ['Alles','Hangers','Kettingen','Oorbellen','Ringen','Armbanden'];
