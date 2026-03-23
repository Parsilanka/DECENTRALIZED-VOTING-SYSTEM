// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Voting is ReentrancyGuard {
    address public admin;

    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    struct Election {
        uint id;
        string title;
        uint startTime;
        uint endTime;
        bool active;
    }

    uint public electionCount;
    mapping(uint => Election) public elections;
    mapping(uint => uint) public electionCandidateCount;
    mapping(uint => mapping(uint => Candidate)) public electionCandidates;
    mapping(address => bool) public isRegistered;
    mapping(address => mapping(uint => bool)) public hasVoted;

    event VoterRegistered(address indexed voter);
    event ElectionCreated(uint indexed electionId, string title, uint startTime, uint endTime);
    event CandidateAdded(uint indexed electionId, uint candidateId, string name);
    event VoteCast(address indexed voter, uint indexed electionId, uint indexed candidateId);
    event ElectionEnded(uint indexed electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "Not a registered voter");
        _;
    }

    modifier electionActive(uint _electionId) {
        require(elections[_electionId].active, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(string memory _title, uint _startTime, uint _endTime) public onlyAdmin {
        require(_startTime < _endTime, "Start time must be before end time");
        electionCount++;
        elections[electionCount] = Election(electionCount, _title, _startTime, _endTime, true);
        emit ElectionCreated(electionCount, _title, _startTime, _endTime);
    }

    function addCandidate(uint _electionId, string memory _name, string memory _party) public onlyAdmin {
        require(elections[_electionId].active, "Election not active");
        electionCandidateCount[_electionId]++;
        uint candidateId = electionCandidateCount[_electionId];
        electionCandidates[_electionId][candidateId] = Candidate(candidateId, _name, _party, 0);
        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function registerVoter(address _voter) public onlyAdmin {
        require(!isRegistered[_voter], "Voter already registered");
        isRegistered[_voter] = true;
        emit VoterRegistered(_voter);
    }

    function endElection(uint _electionId) public onlyAdmin {
        require(elections[_electionId].active, "Election already ended or doesn't exist");
        elections[_electionId].active = false;
        emit ElectionEnded(_electionId);
    }

    function castVote(uint _electionId, uint _candidateId) public onlyRegistered electionActive(_electionId) nonReentrant {
        require(!hasVoted[msg.sender][_electionId], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= electionCandidateCount[_electionId], "Invalid candidate");

        hasVoted[msg.sender][_electionId] = true;
        electionCandidates[_electionId][_candidateId].voteCount++;

        emit VoteCast(msg.sender, _electionId, _candidateId);
    }

    function getElection(uint _electionId) public view returns (Election memory) {
        return elections[_electionId];
    }

    function getCandidates(uint _electionId) public view returns (Candidate[] memory) {
        uint count = electionCandidateCount[_electionId];
        Candidate[] memory candidates = new Candidate[](count);
        for (uint i = 1; i <= count; i++) {
            candidates[i - 1] = electionCandidates[_electionId][i];
        }
        return candidates;
    }

    function getResults(uint _electionId) public view returns (Candidate[] memory) {
        return getCandidates(_electionId); // Results array
    }
}
