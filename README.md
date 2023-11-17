# Online Polling Canister

This project is a canister developed for the Internet Computer Protocol (ICP) using the Azle framework. It provides a simple yet effective way to create and manage online polls, allowing users to create polls, vote on them, view results, and delete polls.

## Key Components

- **PollOption**: A record that represents a single option in a poll, including the option text and the number of votes it has received.
- **Poll**: A record that represents a poll, including its unique identifier, the question being asked, a list of options, and a flag indicating whether the poll is active.
- **pollStorage**: A `StableBTreeMap` used for stable storage, ensuring the persistence of polls across system updates.

## Features

- **createPoll**: Create a new poll with a question and a list of options.
- **vote**: Cast a vote in a poll for a specific option.
- **getPollResults**: Retrieve the current results of a poll, including the number of votes for each option.
- **deletePoll**: Delete a poll from the system.
- **listActivePolls**: List all active polls currently available for voting.

## Interaction

Users can interact with the canister through its public methods. The canister supports both reading and writing operations, enabling users to participate in polls and view real-time results.

## Purpose

This canister serves as a practical example of how to build and manage a basic polling system on the ICP using the Azle framework. It demonstrates handling user inputs, managing state, and querying data.

## How to Run the Project

- Clone the repository

```bash
git clone https://github.com/YourUsername/Online-Polling-Canister.git
```

- Install Dependencies

```bash
npm install
```

- Start DFX

```bash
dfx start --background --clean
```

- Deploy the canister

```bash
dfx deploy
```

After deployment, you will receive URLs for interacting with your canister.

- Stop DFX when done

```bash
dfx stop
```

## Use Cases and Commands

- Create a new poll

```bash
dfx canister call online_poll createPoll '("Your Poll Question", vec {"Option 1", "Option 2", "Option 3"})'
```

- Vote in a Poll

```bash
dfx canister call online_poll vote '(principal "poll-id", "Option 1")'
```

- Get Poll Results

```bash
dfx canister call online_poll getPollResults '(principal "poll-id")'
```

- Delete a Poll

```bash
dfx canister call online_poll deletePoll '(principal "poll-id")'
```

- List Active Polls

```bash
dfx canister call online_poll listActivePolls
```

## Conclusion

This Online Polling Canister is a straightforward implementation of a polling system on the Internet Computer, showcasing the capabilities of the ICP and AZLE framework for building decentralized applications.
