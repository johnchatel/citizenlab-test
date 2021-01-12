import { API_PATH } from 'containers/App/constants';
import { useState, useEffect, useCallback } from 'react';
import { of, timer } from 'rxjs';
import { ITagging, taggingStream } from 'services/taggings';
import { isNilOrError } from 'utils/helperUtils';
import streams from 'utils/streams';

export default function useTaggings() {
  const [taggings, setTaggings] = useState<
    ITagging[] | null | undefined | Error
  >(undefined);

  const [ideaIds, setIdeaIds] = useState<string[] | null | undefined>([]);
  const [processing, setProcessing] = useState<boolean>(true);

  const onIdeasChange = useCallback((ideas: string[]) => {
    setIdeaIds([...ideas]);
  }, []);

  useEffect(() => {
    const taggingObservable = taggingStream({
      queryParameters: {
        idea_ids: ideaIds,
      },
    }).observable;

    const subscriptions = [
      taggingObservable.subscribe((taggings) => {
        setTaggings(isNilOrError(taggings) ? taggings : taggings.data);
        if (
          taggings.data.find(
            (tagging) => tagging.attributes.assignment_method === 'pending'
          )
        ) {
          setProcessing(true);
        } else {
          setProcessing(false);
        }
      }),
      ...[
        processing
          ? timer(10000, 10000).subscribe((_) =>
              streams.fetchAllWith({
                apiEndpoint: [`${API_PATH}/taggings`, `${API_PATH}/tags`],
              })
            )
          : of(null).subscribe(),
      ],
    ];

    return () => subscriptions.forEach((sub) => sub.unsubscribe());
  }, [ideaIds, processing]);

  return { taggings, onIdeasChange, processing };
}
