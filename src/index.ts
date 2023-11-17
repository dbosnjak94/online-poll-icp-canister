import {
  $query,
  $update,
  Vec,
  Record,
  StableBTreeMap,
  Result,
  nat64,
  match,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Define a record for a poll option
type PollOption = Record<{
  optionText: string;
  votes: nat64;
}>;

// Define a record for a poll
type Poll = Record<{
  id: string;
  question: string;
  options: Vec<PollOption>;
  isActive: string;
}>;

// Define a simple storage structure for polls
const pollStorage = new StableBTreeMap<string, Poll>(0, 44, 1024);

$update;
export function createPoll(
  question: string,
  optionsText: Vec<string>
): Result<Poll, string> {
  // Payload Validation
  if (!question || optionsText.length === 0) {
    return Result.Err<Poll, string>("Invalid payload for creating a poll.");
  }

  const pollId = uuidv4();
  const newPoll: Poll = {
    id: pollId,
    question,
    options: optionsText.map((optionText) => ({ optionText, votes: BigInt(0) })),
    isActive: "true",
  };

  try {
    // Error Handling
    pollStorage.insert(pollId, newPoll);
    return Result.Ok(newPoll);
  } catch (error) {
    return Result.Err<Poll, string>("Error creating the poll.");
  }
}

$update;
export function vote(pollId: string, optionText: string): Result<string, string> {
  // Parameter Validation
  if (!pollId || typeof pollId !== "string" || !optionText) {
    return Result.Err<string, string>("Invalid parameters for voting.");
  }

  const pollOpt = pollStorage.get(pollId);
  return match(pollOpt, {
    Some: (poll) => {
      // Check if the poll is active
      if (poll.isActive !== "true") {
        return Result.Err<string, string>("Poll is not active.");
      }

      // Check if the optionText exists
      const optionIndex = poll.options.findIndex(
        (option) => option.optionText === optionText
      );

      if (optionIndex === -1) {
        return Result.Err<string, string>("Option not found.");
      }

      // Update votes
      poll.options[optionIndex].votes = BigInt(poll.options[optionIndex].votes) + BigInt(1);
      pollStorage.insert(pollId, poll);

      return Result.Ok<string, string>("Vote recorded.");
    },
    None: () => Result.Err<string, string>("Poll not found."),
  });
}

$query;
export function getPollResults(pollId: string): Result<Poll, string> {
  // Parameter Validation
  if (!pollId || typeof pollId !== "string") {
    return Result.Err<Poll, string>("Invalid pollId for retrieving results.");
  }

  const pollOpt = pollStorage.get(pollId);
  return match(pollOpt, {
    Some: (poll) => Result.Ok<Poll, string>(poll),
    None: () => Result.Err<Poll, string>("Poll not found."),
  });
}

$update;
export function deletePoll(pollId: string): Result<string, string> {
  // Parameter Validation
  if (!pollId || typeof pollId !== "string") {
    return Result.Err<string, string>("Invalid pollId for deleting the poll.");
  }

  // Check if the poll exists
  if (!pollStorage.containsKey(pollId)) {
    return Result.Err<string, string>("Poll not found.");
  }

  // Delete the poll
  pollStorage.remove(pollId);
  return Result.Ok("Poll deleted.");
}

$query;
export function listActivePolls(): Result<Vec<Poll>, string> {
  try {
    // Error Handling
    const activePolls = pollStorage.values().filter((poll) => poll.isActive === "true");
    return Result.Ok(activePolls);
  } catch (error) {
    return Result.Err<Vec<Poll>, string>("Error listing active polls.");
  }
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
};
