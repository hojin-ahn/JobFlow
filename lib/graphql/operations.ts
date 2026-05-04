import { gql } from '@apollo/client'

export const POSTING_FIELDS = gql`
  fragment PostingFields on JobPosting {
    id
    title
    company
    location
    jobType
    category
    salaryMin
    salaryMax
    currency
    description
    requirements
    benefits
    status
    aiScore
    aiSuggestions
    views
    applications
    publishedAt
    expiresAt
    createdAt
    updatedAt
    userId
  }
`

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      image
      plan
    }
  }
`

export const GET_POSTING = gql`
  ${POSTING_FIELDS}
  query GetPosting($id: String!) {
    posting(id: $id) {
      ...PostingFields
    }
  }
`

export const GET_POSTINGS = gql`
  ${POSTING_FIELDS}
  query GetPostings($status: PostingStatus, $after: String, $first: Int) {
    postings(status: $status, after: $after, first: $first) {
      edges {
        node {
          ...PostingFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`

export const CREATE_POSTING = gql`
  ${POSTING_FIELDS}
  mutation CreatePosting($input: CreatePostingInput!) {
    createPosting(input: $input) {
      ...PostingFields
    }
  }
`

export const UPDATE_POSTING = gql`
  ${POSTING_FIELDS}
  mutation UpdatePosting($id: String!, $input: UpdatePostingInput!) {
    updatePosting(id: $id, input: $input) {
      ...PostingFields
    }
  }
`

export const PUBLISH_POSTING = gql`
  ${POSTING_FIELDS}
  mutation PublishPosting($id: String!) {
    publishPosting(id: $id) {
      ...PostingFields
    }
  }
`

export const DELETE_POSTING = gql`
  mutation DeletePosting($id: String!) {
    deletePosting(id: $id)
  }
`

export const UPDATE_POSTING_SCORE = gql`
  ${POSTING_FIELDS}
  mutation UpdatePostingScore($id: String!, $score: Int!, $suggestions: JSON) {
    updatePostingScore(id: $id, score: $score, suggestions: $suggestions) {
      ...PostingFields
    }
  }
`
