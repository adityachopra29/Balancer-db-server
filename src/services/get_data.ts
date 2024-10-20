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

async function getData(URL: string) {
    var impermanent_loss = 0;
    var volatility = 0;
    var volume24h = 0;
    var totalLiquidity = 0;
    var lifetimeVolume = 0;

    try {
        // prices volatility of the last 30 days
        const current_date = moment();
        const prices1 = await prisma.price.findMany({
            where: {
                // prices of last 30 days
                date: { 
                    gt: current_date.subtract(30, 'days').toDate() //check this
                },
                tokenId: (await prisma.token.findFirst())?.id
            }
        })
        const prices2 = await prisma.price.findMany({
            where: {
                // prices of last 30 days
                date: { 
                    gt: current_date.subtract(30, 'days').toDate()
                },
                tokenId: (await prisma.token.findFirst({
                    skip: 1
                }))?.id
            }
        })

        //check that there is atleast one entry in db
        if(prices1.length != 0 || prices2.length != 0) {
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

            //volatility
            volatility = std_dev[0] + std_dev[1];

            //volume trade
            volume24h = (await prisma.dynamicData.findFirst())!.volume24h;
            // console.log("vol trade :", volume24h);

            //total liquidity and lifetime volume
            totalLiquidity = (await prisma.dynamicData.findFirst())!.totalLiquidity;
            lifetimeVolume = (await prisma.dynamicData.findFirst())!.lifetimeVolume;

            // old to new price raio for impermanent loss
            var old_price  = await prisma.price.findMany({
                skip: 2,
                take: 2
            });
            var new_price = await prisma.price.findMany({
                take: 2
            });
            // console.log("old price : ", old);
            // console.log("new price : ", new_price);
            
            var del_p = 0;

            for (let i = 0; i < 2; i++) {
                if(old_price != null && new_price != null) {
                    del_p += new_price[i].price / old_price[i].price;
                }
            }

            //impermanent loss
            if(del_p != 0) impermanent_loss =  1 - Math.sqrt(Math.pow((1 + del_p)/2, -0.5));
            else impermanent_loss = 0;
        }
        
        console.log("volatility : ", volatility);
        console.log("volume24h : ", volume24h);
        console.log("totalLiquidity : ", totalLiquidity);
        console.log("lifetimeVolume : ", lifetimeVolume);
        console.log("impermanent_loss : ", impermanent_loss);

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

// getData(URL);
export default getData;