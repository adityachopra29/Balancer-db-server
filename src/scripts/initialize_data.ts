import { PrismaClient } from '@prisma/client'
import moment from 'moment'

const prisma = new PrismaClient()

async function main() {
    // const data = await prisma.token.findMany();
    // console.log(data);

    // await prisma.token.createMany({
    //     data: [
    //         {name: 'Mock Token 1', address: '0x239e733ff339495df5d28730b5cad2f77fe27407'},
    //         {name: 'Mock Token 2', address: '0x40d514790c1c0528e7143def9104aebbf54ff1ce'},
    //     ]
    // })

    // const dta = await prisma.price.findMany();
    // console.log(dta);

    // await prisma.price.createMany({
    //     data: [
    //         {tokenId: 3, price: 10*1e18, date: moment().subtract(1, 'days').toDate()},
    //         {tokenId: 4, price: 8*1e18, date: moment().subtract(1, 'days').toDate()},
    //         {tokenId: 3, price: 11*1e18, date: moment().subtract(2, 'days').toDate()},
    //         {tokenId: 4, price: 15*1e18, date: moment().subtract(2, 'days').toDate()},
    //         // {tokenId: 3, price: 11*1e18, date: moment().subtract(2, 'days').toDate()},
    //         // {tokenId: 4, price: 15*1e18, date: moment().subtract(2, 'days').toDate()},
    //         {tokenId: 3, price: 1*1e18, date: moment().subtract(3, 'days').toDate()},
    //         {tokenId: 4, price: 20*1e18, date: moment().subtract(3, 'days').toDate()},
    //         {tokenId: 3, price: 3*1e18, date: moment().subtract(4, 'days').toDate()},
    //         {tokenId: 4, price: 14*1e18, date: moment().subtract(4, 'days').toDate()},
    //         {tokenId: 3, price: 7*1e18, date: moment().subtract(5, 'days').toDate()},
    //         {tokenId: 4, price: 13*1e18, date: moment().subtract(5, 'days').toDate()},
    //     ]
    // })

    // await prisma.dynamicData.createMany({
    //     data: [
    //         {totalLiquidity: 110, volume24h: 10, lifetimeVolume: 110, date: moment().subtract(1, 'days').toDate()},
    //         {totalLiquidity: 110, volume24h: 20, lifetimeVolume: 140, date: moment().subtract(2, 'days').toDate()},
    //         {totalLiquidity: 110, volume24h: 40, lifetimeVolume: 130, date: moment().subtract(3, 'days').toDate()},
    //         {totalLiquidity: 110, volume24h: 50, lifetimeVolume: 120, date: moment().subtract(4, 'days').toDate()},
    //         {totalLiquidity: 110, volume24h: 70, lifetimeVolume: 170, date: moment().subtract(5, 'days').toDate()},
    //     ]
    // })

}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  