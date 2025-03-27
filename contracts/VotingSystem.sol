// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract VotingSystem {
    // Candidate structure
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    // State variables
    address public owner;
    mapping(address => bool) public hasVoted;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;
    uint256 public constant MAX_CANDIDATES = 4;
    uint256 public constant MAX_VOTERS = 20;
    uint256 public totalVotes;

    // Events
    event CandidateAdded(uint256 candidateId, string name);
    event Voted(address voter, uint256 candidateId, string candidateName);
    event VotingEnded(string winnerName, uint256 winningVotes);

    // Modifiers
    modifier onlyOwner() {
        console.log("Checking owner: Sender %s, Owner %s", msg.sender, owner);
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier votingRules() {
        console.log("Checking voting rules for %s", msg.sender);
        console.log("Has voted: %s, Total votes: %s", hasVoted[msg.sender], totalVotes);
        require(!hasVoted[msg.sender], "Voter has already voted");
        require(totalVotes < MAX_VOTERS, "Maximum voter limit reached");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        console.log("Voting System deployed by: %s", owner);
    }

    // Add candidates
    function addCandidate(string memory _name) public onlyOwner {
        require(candidateCount < MAX_CANDIDATES, "Maximum candidate limit reached");
        
        candidates[candidateCount] = Candidate(_name, 0);
        
        console.log("Candidate added: %s (ID: %s)", _name, candidateCount);
        
        emit CandidateAdded(candidateCount, _name);
        candidateCount++;
    }

    // Vote function
    function vote(uint256 _candidateId) public votingRules {
        require(_candidateId < candidateCount, "Invalid candidate");
        
        // Log voting details
        console.log("Voting for candidate %s: %s", 
            _candidateId, 
            candidates[_candidateId].name
        );
        
        // Increment vote count
        candidates[_candidateId].voteCount++;
        
        // Mark voter as voted
        hasVoted[msg.sender] = true;
        
        // Increment total votes
        totalVotes++;

        // Emit vote event
        emit Voted(msg.sender, _candidateId, candidates[_candidateId].name);
        
        console.log("Vote recorded. Total votes for %s: %s", 
            candidates[_candidateId].name, 
            candidates[_candidateId].voteCount
        );
    }

    // Get winner
    function getWinner() public view returns (string memory, uint256) {
        require(totalVotes == MAX_VOTERS, "Voting not completed");
        
        uint256 winningVoteCount = 0;
        uint256 winningCandidateId = 0;

        // Find winner
        for (uint256 i = 0; i < candidateCount; i++) {
            console.log("Candidate %s: %s votes", 
                i, 
                candidates[i].voteCount
            );
            
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        console.log("Winner: %s with %s votes", 
            candidates[winningCandidateId].name, 
            winningVoteCount
        );

        return (candidates[winningCandidateId].name, winningVoteCount);
    }

    // Get candidate details
    function getCandidateDetails(uint256 _candidateId) public view returns (string memory, uint256) {
        require(_candidateId < candidateCount, "Invalid candidate");
        return (candidates[_candidateId].name, candidates[_candidateId].voteCount);
    }
}