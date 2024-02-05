async function main() {
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");

    // Start deployment, returning a promise that resolves to a contract object
    const loyalty_token = await LoyaltyToken.deploy("Flipkart Loyalty Token", "FLT");
    console.log("Contract deployed to address:", loyalty_token.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });