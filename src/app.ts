import express from "express"
import dotenv from "dotenv";
import { get } from "http";

import { PrismaClient } from '@prisma/client'

import setData from "./services/set_data";
import getData from "./services/get_data";


// configures dotenv to work in your application
dotenv.config();
const prisma = new PrismaClient()
const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


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

var max_vol = 0;
var avg_vol = 0;
var day_ct = 0;

// normalized weights for dynamic fees
const w1 = 0.25; //volatitilty 
const w2 = 0.25; //liquidity percentage
const w3 = 0.25; //trading volume
const w4 = 0.25; // impermanent loss

async function main() {
    //fetching and setting to db after every 24 hours
    setInterval(async () => {
        await setData(URL);
        day_ct++;
    }, 86400);

    app.get("/get-data", async (req, res) => {
      const curr_values = await getData(URL);
      max_vol = Math.max(max_vol, curr_values!.volatility);
      avg_vol = curr_values!.lifetimeVolume / day_ct;
      

      //now calculating dynamic fees factor
      var volatility_f  = curr_values!.volatility / max_vol;
      var liquidity_percentage_f = curr_values!.volume24h / curr_values!.totalLiquidity;
      var trad_vol_f = curr_values!.volume24h! / avg_vol;
      var impermanent_loss_f = curr_values!.impermanent_loss;

      // dynamic fees calculation
      var dynamic_fees = w1 * volatility_f + w2 * liquidity_percentage_f + w3 * trad_vol_f + w4 * impermanent_loss_f;

      

      res.send({
        "dynamic_fees": dynamic_fees
      })
    });
    
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
  