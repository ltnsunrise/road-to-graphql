import React from 'react';
import Link from '../../Link';
import { gql, useMutation } from '@apollo/client';
import Button from '../../Button';
import REPOSITORY_FRAGMENT from '../fragments';

const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const WATCH_REPOSITORY = gql`
  mutation($id: ID!, $viewerSubscription: SubscriptionState!) {
    updateSubscription(
      input: { state: $viewerSubscription, subscribableId: $id }
    ) {
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = (viewerSubscription) =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => {
  const [addStar] = useMutation(STAR_REPOSITORY, {
    update(cache, { data: { addStar } }) {
      const repository = cache.readFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
      });

      const totalCount = repository.stargazers.totalCount + 1;
      cache.writeFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
          ...repository,
          stargazers: {
            ...repository.stargazers,
            totalCount,
          },
        },
      });
    },
  });

  const [updateSubscription] = useMutation(WATCH_REPOSITORY, {
    update(cache, { data: { updateSubscription } }) {
      const repository = cache.readFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
      });
      let { totalCount } = repository.watchers;
      totalCount =
        viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED
          ? totalCount + 1
          : totalCount - 1;
      cache.writeFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
          ...repository,
          watchers: {
            ...repository.watchers,
            totalCount,
          },
        },
      });
    },
  });

  return (
    <div>
      <div className='RepositoryItem-title'>
        <h2>
          <Link href={url}>{name}</Link>
        </h2>
        {/* {!viewerHasStarred ? ( */}
        <Button
          className={'RepositoryItem-title-action'}
          onClick={() => addStar({ variables: { id } })}>
          {stargazers && stargazers.totalCount} Star
        </Button>
        {/* ) : null} */}
        <Button
          className='RepositoryItem-title-action'
          onClick={() =>
            updateSubscription({
              variables: {
                id,
                viewerSubscription: isWatch(viewerSubscription)
                  ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
                  : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
              },
            })
          }>
          {watchers.totalCount}
          {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
        </Button>
      </div>
      <div className='RepositoryItem-description'>
        <div
          className='RepositoryItem-description-info'
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
        <div className='RepositoryItem-description-details'>
          <div>
            {primaryLanguage && <span>Language: {primaryLanguage.name}</span>}
          </div>
          <div>
            {owner && (
              <span>
                Owner: <a href={owner.url}>{owner.login}</a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryItem;
