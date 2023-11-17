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
type PollOption = {
  optionText: string;
  votes: nat64;
};

// Define a record for a poll
type Poll = {
  id: Principal;
  question: string;
  options: Vec<PollOption>;
  isActive: boolean;
};

// Define a simple storage structure for polls
const pollStorage = StableBTreeMap<Principal, Poll, 1>();

export default Canister({
  createPoll: update(
    [text, Vec(text)],
    Result(Poll, string),
    (question, optionsText) => {
      const pollId = generateId();
      const options = optionsText.map((optionText) => ({
        optionText,
        votes: 0,
      }));
      const newPoll: Poll = {
        id: pollId,
        question,
        options,
        isActive: true,
      };
      pollStorage.insert(pollId, newPoll);
      return Ok(newPoll);
    }
  ),

  vote: update([Principal, text], Result(string, string), (pollId, optionText) => {
    const poll = pollStorage.get(pollId);
    if (!poll) {
      return Err("Poll not found.");
    }
    if (!poll.isActive) {
      return Err("Poll is not active.");
    }
    const optionIndex = poll.options.findIndex(
      (option) => option.optionText === optionText
    );
    if (optionIndex === -1) {
      return Err("Option not found.");
    }
    const updatedPoll = {
      ...poll,
      options: [
        ...poll.options.slice(0, optionIndex),
        { ...poll.options[optionIndex], votes: poll.options[optionIndex].votes + 1 },
        ...poll.options.slice(optionIndex + 1),
      ],
    };
    pollStorage.insert(pollId, updatedPoll);
    return Ok("Vote recorded.");
  }),

  getPollResults: query([Principal], Result(Poll, string), (pollId) => {
    const poll = pollStorage.get(pollId);
    return poll ? Ok(poll) : Err("Poll not found.");
  }),

  deletePoll: update([Principal], Result(string, string), (pollId) => {
    if (!pollStorage.containsKey(pollId)) {
      return Err("Poll not found.");
    }
    pollStorage.remove(pollId);
    return Ok("Poll deleted.");
  }),

  listActivePolls: query([], Result(Vec<Poll>, string), () => {
    const activePolls = pollStorage
      .values()
      .filter((poll) => poll.isActive);
    return Ok(activePolls);
  }),
});

function generateId(): Principal {
  const randomBytes = new Uint8Array(29);
  crypto.getRandomValues(randomBytes);
  return Principal.fromUint8Array(randomBytes);
}
