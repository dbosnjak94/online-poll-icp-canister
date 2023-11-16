import {
  Canister,
  query,
  update,
  text,
  Principal,
  Vec,
  Record,
  StableBTreeMap,
  Result,
  Ok,
  Err,
  nat64,
  ic,
} from "azle";

// Define a record for a poll option
const PollOption = Record({
  optionText: text,
  votes: nat64,
});

// Define a record for a poll
const Poll = Record({
  id: Principal,
  question: text,
  options: Vec(PollOption),
  isActive: text,
});

// Define a simple storage structure for polls
const pollStorage = StableBTreeMap(Principal, Poll, 1);

export default Canister({
  createPoll: update(
    [text, Vec(text)],
    Result(text, text),
    (question, optionsText) => {
      const pollId = generateId();
      const options = optionsText.map((optionText) => {
        return { optionText, votes: 0 };
      });
      const newPoll = {
        id: pollId,
        question,
        options,
        isActive: "true",
      };
      pollStorage.insert(pollId, newPoll);
      return Ok(`Poll created with ID: ${pollId.toText()}`);
    }
  ),

  vote: update([Principal, text], Result(text, text), (pollId, optionText) => {
    const poll = pollStorage.get(pollId);
    if (!poll.Some) {
      return Err("Poll not found.");
    }
    if (poll.Some.isActive !== "true") {
      return Err("Poll is not active.");
    }
    const optionIndex = poll.Some.options.findIndex(
      (option: any) => option.optionText === optionText
    );
    if (optionIndex === -1) {
      return Err("Option not found.");
    }
    poll.Some.options[optionIndex].votes += 1;
    pollStorage.insert(pollId, poll.Some);
    return Ok("Vote recorded.");
  }),

  getPollResults: query([Principal], Result(Poll, text), (pollId) => {
    const poll = pollStorage.get(pollId);
    if (!poll.Some) {
      return Err("Poll not found.");
    }
    return Ok(poll.Some);
  }),

  deletePoll: update([Principal], Result(text, text), (pollId) => {
    if (!pollStorage.containsKey(pollId)) {
      return Err("Poll not found.");
    }
    pollStorage.remove(pollId);
    return Ok("Poll deleted.");
  }),

  listActivePolls: query([], Result(Vec(Poll), text), () => {
    const activePolls = pollStorage
      .values()
      .filter((poll: any) => poll.isActive === "true");
    return Ok(activePolls);
  }),
});

function generateId(): Principal {
  const randomBytes = new Array(29)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256));
  return Principal.fromUint8Array(Uint8Array.from(randomBytes));
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
