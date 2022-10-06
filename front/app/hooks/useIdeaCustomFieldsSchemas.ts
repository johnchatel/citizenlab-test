import { useState, useEffect } from 'react';
import {
  ideaFormSchemaStream,
  IIdeaFormSchemas,
} from 'services/ideaCustomFieldsSchemas';
import { Observable, of } from 'rxjs';
import {
  ideaJsonFormsSchemaStream,
  IIdeaJsonFormSchemas,
} from 'services/ideaJsonFormsSchema';
import useFeatureFlag from './useFeatureFlag';

interface Props {
  projectId: string | null;
  ideaId?: string | null;
}

export default function useIdeaCustomFieldsSchemas({
  projectId,
  ideaId,
}: Props) {
  const [ideaCustomFieldsSchemas, setIdeaCustomFieldsSchemas] = useState<
    IIdeaFormSchemas | undefined | null | Error | IIdeaJsonFormSchemas
  >(undefined);

  const ideaCustomFieldsIsEnabled = useFeatureFlag({
    name: 'idea_custom_fields',
  });
  const dynamicIdeaFormIsEnabled = useFeatureFlag({
    name: 'dynamic_idea_form',
  });

  useEffect(() => {
    let observable: Observable<
      IIdeaFormSchemas | IIdeaJsonFormSchemas | Error | null
    > = of(null);

    if (
      !projectId ||
      typeof ideaCustomFieldsIsEnabled !== 'boolean' ||
      typeof dynamicIdeaFormIsEnabled !== 'boolean'
    ) {
      return;
    }

    if (ideaId && dynamicIdeaFormIsEnabled && ideaCustomFieldsIsEnabled) {
      observable = ideaJsonFormsSchemaStream(
        projectId,
        null,
        ideaId
      ).observable;
    } else {
      observable = ideaFormSchemaStream(projectId).observable;
    }

    const subscription = observable.subscribe((ideaCustomFieldsSchemas) => {
      setIdeaCustomFieldsSchemas(ideaCustomFieldsSchemas);
    });

    return () => subscription.unsubscribe();
  }, [projectId, ideaId, ideaCustomFieldsIsEnabled, dynamicIdeaFormIsEnabled]);

  return ideaCustomFieldsSchemas;
}
