import React from 'react';

import { ModuleConfiguration } from 'utils/moduleUtils';
const ActionBarTranslateButton = React.lazy(
  () => import('./citizen/components/ActionBarTranslateButton')
);
const CommentTranslateButton = React.lazy(
  () => import('./citizen/components/CommentTranslateButton')
);
const IdeasShowTranslateButton = React.lazy(
  () => import('./citizen/components/IdeasShowTranslateButton')
);
const InitiativesTranslateButton = React.lazy(
  () => import('./citizen/components/InitiativesTranslateButton')
);
const PostShowTranslatedBody = React.lazy(
  () => import('./citizen/components/PostShowTranslatedBody')
);
const PostShowTranslatedCommentBody = React.lazy(
  () => import('./citizen/components/PostShowTranslatedCommentBody')
);
const PostShowTranslatedTitle = React.lazy(
  () => import('./citizen/components/PostShowTranslatedTitle')
);

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.PostShowComponents.ActionBar.right':
      ActionBarTranslateButton,
    'app.components.PostShowComponents.CommentFooter.left': (props) => (
      <CommentTranslateButton {...props} />
    ),
    'app.containers.InitiativesShow.left': InitiativesTranslateButton,
    'app.containers.IdeasShow.left': IdeasShowTranslateButton,
    'app.components.PostShowComponents.CommentBody.translation':
      PostShowTranslatedCommentBody,
    'app.components.PostShowComponents.Body.translation':
      PostShowTranslatedBody,
    'app.components.PostShowComponents.Title.translation':
      PostShowTranslatedTitle,
  },
};

export default configuration;
