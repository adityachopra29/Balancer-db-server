import { PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";
import { captureRejectionSymbol } from "events";
import { url } from "inspector";
import moment from "moment";

const prisma : PrismaClient = new PrismaClient();

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

const URL = `https://test-api-v3.balancer.fi/?query=query {
    poolGetPool(id:"${process.env.POOL_ADDRESS}", chain:SEPOLIA){
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

async function getData(URL: string) {
    try {
        // prices volatility of the last 30 days
        const current_date = moment();
        const prices1 = await prisma.price.findMany({
            where: {
                // prices of last 30 days
                date: { 
                    gt: current_date.subtract(30, 'days').toDate() //check this
                },
                tokenId: 1
            }
        })
        const prices2 = await prisma.price.findMany({
            where: {
                // prices of last 30 days
                date: { 
                    gt: current_date.subtract(30, 'days').toDate()
                },
                tokenId: 2
            }
        })
        var mean = [0, 0];
        var std_dev = [0, 0];
        for (let i = 0; i < prices1.length; i++) {
            mean[0] += prices1[i].price;
            mean[1] += prices2[i].price;
        }
        mean[0] /= prices1.length; 
        mean[1] /= prices2.length;
        for(let i = 0; i < prices1.length; i++) {
            std_dev[0] += (prices1[i].price - mean[0]) ** 2;
            std_dev[1] += (prices2[i].price - mean[1]) ** 2;
        }
        std_dev[0] = Math.sqrt(std_dev[0] / prices1.length);
        std_dev[1] = Math.sqrt(std_dev[1] / prices2.length);
        var volatility = std_dev[0] + std_dev[1];
        console.log("vol : ", volatility);

        //volume trade
        const volume24h = await prisma.dynamicData.findFirst();
        console.log("vol trade :", volume24h);

        //total liquidity and lifetime volume
        var totalLiquidity = (await prisma.dynamicData.findFirst())?.totalLiquidity;
        var lifetimeVolume = (await prisma.dynamicData.findFirst())?.lifetimeVolume;

        // old to new price raio for impermanent loss
        var old_price  = await prisma.price.findMany({
            skip: 2,
            take: 2
        });
        var new_price = await prisma.price.findMany({
            take: 2
        });
        // console.log("old price : ", old);
        console.log("new price : ", new_price);
        
        var del_p = 0;

        for (let i = 0; i < 2; i++) {
            if(old_price != null){
                del_p += new_price[i].price / old_price[i].price;
            }
        }

        var impermanent_loss = 1 - Math.sqrt(Math.pow((1 + del_p)/2, -0.5))

        return {
            volatility: Number(volatility),
            volume24h : Number(volume24h),
            totalLiquidity: Number(totalLiquidity),
            lifetimeVolume: Number(lifetimeVolume),
            impermanent_loss: Number(impermanent_loss)
        }

    } catch (error) {
        console.error(error);
    }
}

getData(URL);
export default getData;