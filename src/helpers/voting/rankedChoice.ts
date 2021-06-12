import { getNumberWithOrdinal } from '@/helpers/utils';

function irv(ballots, rounds) {
  const candidates: any[] = [...new Set(ballots.map(vote => vote[0]).flat())];
  const votes = Object.entries(
    ballots.reduce((votes, [v], i, src) => {
      votes[v[0]] += src[i][1];
      return votes;
    }, Object.assign({}, ...candidates.map(c => ({ [c]: 0 }))))
  );
  const [topCand, topCount] = votes.reduce(
    ([n, m]: (number | string)[], [v, c]: any[]) => (c > m ? [v, c] : [n, m]),
    ['?', -Infinity]
  );
  const [bottomCand, bottomCount] = votes.reduce(
    ([n, m]: any, [v, c]: any) => (c < m ? [v, c] : [n, m]),
    ['?', Infinity]
  );
  const sortedByHighest = votes.sort((a: any, b: any) => b[1] - a[1]);
  const totalPowerOfVotes = ballots
    .map(bal => bal[1])
    .reduce((a, b: any) => a + b, 0);

  rounds.push({
    round: rounds.length + 1,
    sortedByHighest
  });

  return topCount > totalPowerOfVotes / 2 || sortedByHighest.length < 3
    ? rounds
    : irv(
        ballots
          .map(ballot => [ballot[0].filter(c => c != bottomCand), ballot[1]])
          .filter(b => b[0].length > 0),
        rounds
      );
}

function getFinalRound(i, votes) {
  const results = irv(
    votes.map((vote: any) => [vote.choice, vote.balance]),
    []
  );
  const finalRound = results[results.length - 1];
  return finalRound.sortedByHighest.filter((res: any) => res[0] == i + 1);
}

export default class ApprovalVoting {
  public proposal;
  public votes;
  public strategies;
  public selected;

  constructor(proposal, votes, strategies, selected) {
    this.proposal = proposal;
    this.votes = votes;
    this.strategies = strategies;
    this.selected = selected;
  }

  resultsByChoices() {
    return this.proposal.choices.map((choice, i) =>
      getFinalRound(i, this.votes).reduce((a, b: any) => a + b[1], 0)
    );
  }

  resultsOfChoicesByStrategy() {
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) =>
        getFinalRound(i, this.votes).reduce((a, b: any) => a + b[1], 0)
      )
    );
  }

  totalSumOfResults() {
    return this.votes.reduce((a, b: any) => a + b.balance, 0);
  }

  getChoiceString() {
    return this.selected
      .map((choice, i) => {
        if (this.proposal.choices[choice - 1])
          return this.proposal.choices[choice - 1];
      })
      .map((el, i) => `(${getNumberWithOrdinal(i + 1)}) ${el}`)
      .join(', ');
  }
}
