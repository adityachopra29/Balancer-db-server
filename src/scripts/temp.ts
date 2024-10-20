import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tokens = await prisma.token.createMany({
        data: [
            {
                name: "Mock Token 1",
                address: process.env.TOKEN1_ADDRESS!,
            },
            {
                name: "Mock Token 2",
                address: process.env.TOKEN2_ADDRESS!,
            }
        ]
    })

    console.log(tokens)
}

main()