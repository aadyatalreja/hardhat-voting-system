const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem", function () {
    let votingSystem;
    let owner;
    let voters;

    beforeEach(async function () {
        // Get signers
        const signers = await ethers.getSigners();
        owner = signers[0];
        voters = signers.slice(1, 21); // First 20 additional accounts

        // Deploy contract
        const VotingSystem = await ethers.getContractFactory("VotingSystem");
        votingSystem = await VotingSystem.deploy();

        // Add candidates
        const candidates = ["Alice", "Bob", "Charlie", "David"];
        console.log("\n--- Adding Candidates ---");
        for (const candidate of candidates) {
            await votingSystem.addCandidate(candidate);
        }
    });

    it("Should allow voting and track votes correctly", async function () {
        console.log("\n--- Voting Process ---");
        
        // Distribute votes across candidates
        for (let i = 0; i < 20; i++) {
            // Vote for candidates in a round-robin style
            const candidateId = i % 4;
            
            console.log(`Voter ${voters[i].address} voting for candidate ${candidateId}`);
            
            // Cast vote
            await votingSystem.connect(voters[i]).vote(candidateId);
        }

        // Get and display candidate vote counts
        console.log("\n--- Vote Counts ---");
        const candidates = ["Alice", "Bob", "Charlie", "David"];
        for (let i = 0; i < 4; i++) {
            const [name, voteCount] = await votingSystem.getCandidateDetails(i);
            console.log(`${name}: ${voteCount} votes`);
        }

        // Determine and log the winner
        console.log("\n--- Determining Winner ---");
        const [winnerName, winnerVotes] = await votingSystem.getWinner();
        console.log(`Winner: ${winnerName} with ${winnerVotes} votes`);
    });

    it("Should prevent double voting", async function () {
        // First vote
        await votingSystem.connect(voters[0]).vote(0);

        // Attempt to vote again
        await expect(
            votingSystem.connect(voters[0]).vote(1)
        ).to.be.revertedWith("Voter has already voted");
    });

    it("Should limit total votes to 20", async function () {
        // Simulate voting by 20 different voters
        for (let i = 0; i < 20; i++) {
            await votingSystem.connect(voters[i]).vote(i % 4);
        }

        // Attempt to vote by 21st voter
        await expect(
            votingSystem.connect(owner).vote(0)
        ).to.be.revertedWith("Maximum voter limit reached");
    });
});