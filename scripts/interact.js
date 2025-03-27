const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Function to load contract artifacts
function loadContract() {
    try {
        // Path to the contract artifact
        const artifactPath = path.resolve(__dirname, 'artifacts/contracts/VotingSystem.sol/VotingSystem.json');
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        return {
            abi: artifact.abi,
            bytecode: artifact.bytecode
        };
    } catch (error) {
        console.error('Error loading contract artifact:', error);
        return null;
    }
}

class VotingSystemInteraction {
    constructor(providerUrl, privateKey) {
        // Connect to the network (e.g., Hardhat local network)
        this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
        
        // Create wallet from private key
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        
        // Load contract details
        const contractData = loadContract();
        if (!contractData) {
            throw new Error('Could not load contract data');
        }
        
        this.abi = contractData.abi;
        this.bytecode = contractData.bytecode;
        
        // Contract address (needs to be set after deployment)
        this.contractAddress = null;
        this.contract = null;
    }

    // Deploy the contract
    async deployContract() {
        try {
            console.log('Deploying VotingSystem contract...');
            
            // Create contract factory
            const VotingSystemFactory = new ethers.ContractFactory(
                this.abi, 
                this.bytecode, 
                this.wallet
            );
            
            // Deploy contract
            const votingSystem = await VotingSystemFactory.deploy();
            
            // Wait for deployment
            await votingSystem.deployed();
            
            this.contractAddress = votingSystem.address;
            this.contract = votingSystem;
            
            console.log('Contract deployed to:', this.contractAddress);
            return this.contractAddress;
        } catch (error) {
            console.error('Deployment error:', error);
            throw error;
        }
    }

    // Connect to existing contract
    async connectToContract(contractAddress) {
        try {
            this.contractAddress = contractAddress;
            this.contract = new ethers.Contract(
                contractAddress, 
                this.abi, 
                this.wallet
            );
            console.log('Connected to contract at:', contractAddress);
            return this.contract;
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    // Add a candidate (only by owner)
    async addCandidate(candidateName) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            console.log(`Adding candidate: ${candidateName}`);
            const tx = await this.contract.addCandidate(candidateName);
            await tx.wait();
            console.log(`Candidate ${candidateName} added successfully`);
            return tx;
        } catch (error) {
            console.error('Error adding candidate:', error);
            throw error;
        }
    }

    // Vote for a candidate
    async vote(candidateId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            console.log(`Voting for candidate ID: ${candidateId}`);
            const tx = await this.contract.vote(candidateId);
            await tx.wait();
            console.log('Vote cast successfully');
            return tx;
        } catch (error) {
            console.error('Voting error:', error);
            throw error;
        }
    }

    // Get candidate details
    async getCandidateDetails(candidateId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const details = await this.contract.getCandidateDetails(candidateId);
            console.log(`Candidate ${candidateId} details:`, {
                name: details[0],
                voteCount: details[1].toString()
            });
            return details;
        } catch (error) {
            console.error('Error getting candidate details:', error);
            throw error;
        }
    }

    // Get the winner
    async getWinner() {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const winner = await this.contract.getWinner();
            console.log('Winner:', {
                name: winner[0],
                votes: winner[1].toString()
            });
            return winner;
        } catch (error) {
            console.error('Error getting winner:', error);
            throw error;
        }
    }

    // Check if a specific address has voted
    async hasVoted(voterAddress) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const voted = await this.contract.hasVoted(voterAddress);
            console.log(`Has ${voterAddress} voted?`, voted);
            return voted;
        } catch (error) {
            console.error('Error checking voting status:', error);
            throw error;
        }
    }
}

// Example usage function
async function runVotingDemo() {
    try {
        // Use Hardhat's local network and a test private key
        const providerUrl = 'http://127.0.0.1:8545/';
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat's first test account

        // Create interaction instance
        const voting = new VotingSystemInteraction(providerUrl, privateKey);

        // Deploy contract
        const contractAddress = await voting.deployContract();

        // Add candidates
        await voting.addCandidate('Alice');
        await voting.addCandidate('Bob');
        await voting.addCandidate('Charlie');
        await voting.addCandidate('David');

        // Simulate voting
        for (let i = 0; i < 20; i++) {
            // Use different private keys for different voters
            const voterPrivateKey = ethers.utils.hexlify(ethers.utils.randomBytes(32));
            const voterWallet = new ethers.Wallet(voterPrivateKey, voting.provider);
            
            const voterInteraction = new VotingSystemInteraction(providerUrl, voterPrivateKey);
            await voterInteraction.connectToContract(contractAddress);
            
            // Vote for a candidate
            await voterInteraction.vote(i % 4);
        }

        // Get final results
        await voting.getWinner();
        
        // Check candidate details
        for (let i = 0; i < 4; i++) {
            await voting.getCandidateDetails(i);
        }
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Uncomment to run the demo
// runVotingDemo();

module.exports = {
    VotingSystemInteraction,
    runVotingDemo
};