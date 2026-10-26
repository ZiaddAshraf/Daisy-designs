import { prisma } from '../src/lib/prisma';
async function main(){
const products=await prisma.product.findMany({where:{NOT:{slug:{startsWith:'demo-'}}},include:{variants:true,category:true}});
console.log(products.map(p=>({id:p.id,slug:p.slug,name:p.arabicName,price:p.price,stock:p.stock,published:p.published,category:p.category.slug,variants:p.variants.map(v=>({id:v.id,price:v.price,stock:v.stock}))})));
console.log(await prisma.category.findMany({where:{slug:{in:['stickers','printed-t-shirts','accessories']}},select:{id:true,slug:true,arabicName:true}}));
} main().catch(()=>{console.error('Inspection failed');process.exitCode=1}).finally(()=>prisma.$disconnect());
