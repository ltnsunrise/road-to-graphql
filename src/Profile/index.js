import { gql, useQuery } from '@apollo/client';
import React from 'react';
import ErrorMessage from '../Error';
import Repository, { REPOSITORY_FRAGMENT } from '../Repository';

export const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  query($cursor: String) {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }

  ${REPOSITORY_FRAGMENT}
`;

const Profile = () => {
  const {
    data,
    loading,
    error,
    fetchMore,
  } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER, { networkStatus: true });

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }

  const { viewer } = data;
  return (
    <Repository
      loading={loading}
      repositories={viewer.repositories}
      fetchMore={fetchMore}
    />
  );
};

export default Profile;
