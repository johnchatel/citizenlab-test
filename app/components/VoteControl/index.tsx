import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import Icon from 'components/UI/Icon';
import { darken } from 'polished';
import { state, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';
import styled from 'styled-components';
import { authUserStream } from 'services/auth';
import eventEmitter from 'utils/eventEmitter';
import { ideaStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { votesStream, addVote, deleteVote, IIdeaVote, IIdeaVoteData } from 'services/ideaVotes';

const BACKGROUND = '#F8F8F8';
const FOREGROUND = '#6B6B6B';
const FOREGROUND_ACTIVE = '#FFFFFF';
const GREEN = '#32B67A';
const RED = '#FC3C2D';
const WIDTH = {
  small: 50,
  medium: 80,
  large: 100,
};
const HEIGHT = {
  small: 35,
  medium: 45,
  large: 57,
};
const FONT_SIZE = {
  small: 14,
  medium: 18,
  large: 23,
};
const GUTTER = {
  small: 3,
  medium: 5,
  large: 8,
};

const VotesContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const VoteButton: any = styled.button`
  cursor: pointer;
  background-color: ${BACKGROUND};
  width: ${props => WIDTH[(props as any).size]}px;
  height: ${props => HEIGHT[(props as any).size]}px;
  border-radius: 5px;
  font-size: ${props => FONT_SIZE[(props as any).size]}px;
  font-weight: 600;
  color: ${props => (props as any).active ? FOREGROUND_ACTIVE : FOREGROUND};
  margin-right: ${props => GUTTER[(props as any).size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 100ms ease-in-out;
  outline: none;
`;

const UpvoteButton = VoteButton.extend`
  ${props => props.active && `background: ${GREEN};`}
  &:hover {
    background-color: ${props => darken(0.1, props.active ? GREEN : BACKGROUND)};
  }
`;

const DownvoteButton = VoteButton.extend`
  ${props => props.active && `background: ${RED};`}
  &:hover {
    background-color: ${props => darken(0.1, props.active ? RED : BACKGROUND)};
  }
`;

const VoteIcon = styled(Icon)`
`;

const VoteCount = styled.div`
  margin-left: 6px;
`;

type Props = {
  ideaId: string;
  size: 'small' | 'medium' | 'large';
};

type State = {
  authUser: IUser | null,
  isAuthenticated: boolean;
  upvotesCount: number;
  downVotesCount: number;
  myVote: IIdeaVoteData | null;
};

export const namespace = 'VoteControl/index';

export default class Votes extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const { ideaId } = this.props;
    const instanceNamespace = `${namespace}/${ideaId}`;
    const initialState: State = {
      authUser: null,
      isAuthenticated: false,
      upvotesCount: 0,
      downVotesCount: 0,
      myVote: null
    };

    const idea$ = ideaStream(ideaId).observable;
    const authUser$ = authUserStream().observable;
    const isAuthenticated$ = authUser$.map(authUser => !_.isNull(authUser));
    const votes$ = votesStream(ideaId).observable;
    const authUserAndVotes$ = authUser$.switchMap(authUser => votes$.map(votes => ({ authUser, votes })));
    // const upvotesCount$ = votes$.map(votes => votes.data.filter(vote => vote.attributes.mode === 'up').length);
    // const downVotesCount$ = votes$.map(votes => votes.data.filter(vote => vote.attributes.mode === 'down').length);
    const myVote$ = Rx.Observable.combineLatest(authUser$, votes$).map(([authUser, votes]) => {
      if (authUser) {
        const myVote = _(votes.data).find(vote => vote.relationships.user.data.id === authUser.data.id);
        return (myVote ? myVote : null);
      }

      return null;
    });

    this.state$ = state.createStream<State>(instanceNamespace, instanceNamespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(
        idea$,
        isAuthenticated$,
        authUserAndVotes$,
        myVote$
      ).subscribe(([idea, isAuthenticated, { authUser, votes }, myVote]) => {
        let upvotesCount = idea.data.attributes.upvotes_count;
        let downVotesCount = idea.data.attributes.downvotes_count;

        if (isAuthenticated && votes) {
          upvotesCount = votes.data.filter(vote => vote.attributes.mode === 'up').length;
          downVotesCount = votes.data.filter(vote => vote.attributes.mode === 'down').length;
        }

        this.state$.next({ authUser, isAuthenticated, upvotesCount, downVotesCount, myVote });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onClickUpvote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.onClickVote('up');
  }

  onClickDownvote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.onClickVote('down');
  }

  onClickVote = async (voteMode: 'up' | 'down') => {
    try {
      const { authUser, myVote } = this.state;
      const { ideaId } = this.props;

      if (authUser) {
        if (myVote && myVote.attributes.mode !== voteMode) {
          await deleteVote(ideaId, myVote.id);
          await addVote(ideaId, { user_id: authUser.data.id, mode: voteMode });
        }

        if (myVote && myVote.attributes.mode === voteMode) {
          await deleteVote(ideaId, myVote.id);
        }

        if (!myVote) {
          await addVote(ideaId, { user_id: authUser.data.id, mode: voteMode });
        }
      } else {
        eventEmitter.emit(namespace, 'unauthenticatedVoteClick', ideaId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { size } = this.props;
    const { isAuthenticated, upvotesCount, downVotesCount, myVote } = this.state;
    const myVoteMode = (myVote ? myVote.attributes.mode : null);

    return (
      <VotesContainer>
        <UpvoteButton size={size} active={myVoteMode === 'up'} onClick={this.onClickUpvote}>
          <VoteIcon name="upvote" />
          <VoteCount>{upvotesCount}</VoteCount>
        </UpvoteButton>
        <DownvoteButton size={size} active={myVoteMode === 'down'} onClick={this.onClickDownvote}>
          <VoteIcon name="downvote" />
          <VoteCount>{downVotesCount}</VoteCount>
        </DownvoteButton>
      </VotesContainer>
    );
  }
}
