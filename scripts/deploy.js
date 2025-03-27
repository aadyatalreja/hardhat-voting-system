const hre = require("hardhat");

async function main() {
    // Get the first signer (contract deployer)
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying the contract with the account:", deployer.address);

    // Deploy the contract
    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();

    // Wait for the contract to be deployed
    await votingSystem.waitForDeployment();

    console.log("VotingSystem deployed to:", await votingSystem.getAddress());

    // Add candidates
    const candidates = ["Alice", "Bob", "Charlie", "David"];
    
    console.log("\nAdding candidates:");
    for (const candidate of candidates) {
        await votingSystem.addCandidate(candidate);
    }

    console.log("\nDeployment complete. Ready for voting!");
}

// Recommended pattern for handling deployment errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });