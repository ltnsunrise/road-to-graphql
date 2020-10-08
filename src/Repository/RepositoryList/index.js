import React from 'react';
import FetchMore from '../../FetchMore';
import RepositoryItem from '../RepositoryItem';

const updateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }
  return {
    ...previousResult,
    viewer: {
      ...previousResult.viewer,
      repositories: {
        ...previousResult.viewer.repositories,
        ...fetchMoreResult.viewer.repositories,
        edges: [
          ...previousResult.viewer.repositories.edges,
          ...fetchMoreResult.viewer.repositories.edges,
        ],
      },
    },
  };
};

const RepositoryList = ({ repositories, fetchMore, loading }) => {
  return (
    <>
      {repositories.edges.map(({ node }) => (
        <div key={node.id} className='RepositoryItem'>
          <RepositoryItem {...node} />
        </div>
      ))}

      <FetchMore
        loading={loading}
        hasNextPage={repositories.pageInfo.hasNextPage}
        variables={{
          cursor: repositories.pageInfo.endCursor,
        }}
        updateQuery={updateQuery}
        fetchMore={fetchMore}>
        Repositories
      </FetchMore>
    </>
  );
};

export default RepositoryList;
