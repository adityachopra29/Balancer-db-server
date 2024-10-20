import { PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";
import { parse } from "path";

const prisma : PrismaClient = new PrismaClient();

`{
    "data": {
        "poolGetPool": {
            "poolTokens": [
                {
                    "balance": "50",
                    "name": "Mock Token 1",
                    "address": "0x239e733ff339495df5d28730b5cad2f77fe27407",
                    "priceRate": "1000000000000000000"
                },
                {
                    "balance": "50",
                    "name": "Mock Token 2",
                    "address": "0x40d514790c1c0528e7143def9104aebbf54ff1ce",
                    "priceRate": "1000000000000000000"
                }
            ],
            "dynamicData": {
                "totalLiquidity": "0.00",
                "volume24h": "0.00",
                "lifetimeVolume": "0.00"
            }
        }
    }
}`

const url = `https://test-api-v3.balancer.fi/?query=query {
    poolGetPool(id:"0xEA34209c9c86b358Ebf9C92156aA8D12b81508B6", chain:SEPOLIA){
      poolTokens {
        balance
        name
        address
        priceRate
      }
      dynamicData{
        totalLiquidity
        volume24h
        lifetimeVolume
  }}}`

type Token = {
    balance: string;
    name: string;
    address: string;
    priceRate: number;
}

type Pool = {
    poolTokens: Token[];
    dynamicData: {
        totalLiquidity: string;
        volume24h: string;
        lifetimeVolume: string;
    }
}
//will work once the token addresses are added to the db
async function setData(url:string) {
    try {
        const response = await axios.get(url);
        console.log(response.data);
        const pool: Pool = response.data.data.poolGetPool;
        console.log(pool)
        var poolPrices = [parseFloat(response.data.data.poolGetPool.poolTokens[0].priceRate), parseFloat(response.data.data.poolGetPool.poolTokens[1].priceRate)]

        const tokenAdresses = await prisma.token.findMany();
        console.log(tokenAdresses);
        
        const addPriceData = await prisma.price.createMany({
            data: [{
                tokenId: tokenAdresses[0].id,
                date: new Date(),
                price: poolPrices[0]
            }, 
            {
                tokenId: tokenAdresses[1].id,
                date: new Date(),
                price: poolPrices[1]
            }
        ]
        })

        const addVolumeData = await prisma.dynamicData.create({
            data:{
                date: new Date(),
                volume24h: parseFloat(pool.dynamicData.volume24h),
                lifetimeVolume: parseFloat(pool.dynamicData.lifetimeVolume),
                totalLiquidity: parseFloat(pool.dynamicData.totalLiquidity)
            }
        });
        console.log("price wala", addPriceData)
        console.log("volume wala", addVolumeData)

      } catch (error) {
        console.error(error);
    }

}

setData(url)

export default setData;